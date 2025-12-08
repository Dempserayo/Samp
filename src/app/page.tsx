"use client";

import { useState, useEffect } from "react";
import { createWorker } from "tesseract.js";
import Sidebar, { type TextConfig } from "./components/common/Sidebar";
import ImageViewer from "./components/common/ImageViewer";
import DownloadModal from "./components/common/DownloadModal";
import TextSelectionModal from "./components/common/TextSelectionModal";
import TextConfigModal from "./components/common/TextConfigModal";

interface TextBlock {
  id: string;
  text: string;
  selected: boolean;
}
  
export default function Home() {
  const [imageWithText, setImageWithText] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [combinedImages, setCombinedImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [openTextModal, setOpenTextModal] = useState<"textSelection" | "textConfig" | null>(null);
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([]);
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [textConfig, setTextConfig] = useState<TextConfig>({
    fontSize: 10,
    color: "#FFFFFF",
    position: "left-bottom",
    maxWidth: 800,
  });


  const ignoredWords = [
    "screenshot",
    "screenshots",
    "captura",
    "capturas",
    "pantalla",
    "imagen",
    "image",
    "photo",
    "foto"
  ];

  const filterIgnoredWords = (text: string): string => {
    const lines = text.split(/\n/);
    
    const filteredLines = lines.filter(line => {
      const lineLower = line.toLowerCase().trim();
      
      const containsIgnoredWord = ignoredWords.some(ignoredWord => 
        lineLower.includes(ignoredWord.toLowerCase())
      );
      
      if (containsIgnoredWord) {
        return false;
      }
      
      return line.trim().length > 0;
    });
    
    const cleanedLines = filteredLines.map(line => 
      line.replace(/\s+/g, " ").trim()
    ).filter(line => line.length > 0);
    
    return cleanedLines.join("\n");
  };

  const formatDialogueText = (text: string): string[] => {
    const filteredText = filterIgnoredWords(text);
    
    const lines = filteredText.split(/\n/).filter(line => line.trim().length > 0);
    const formattedLines: string[] = [];

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      
      const dialoguePattern = /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*(?:dice\s*)?:\s*(.+)$/i;
      const match = trimmedLine.match(dialoguePattern);
      
      if (match) {
        formattedLines.push(trimmedLine);
      } else {
        const colonIndex = trimmedLine.indexOf(":");
        if (colonIndex > 0) {
          const beforeColon = trimmedLine.substring(0, colonIndex).trim();
          const afterColon = trimmedLine.substring(colonIndex + 1).trim();
          
          if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/.test(beforeColon)) {
            formattedLines.push(`${beforeColon}: ${afterColon}`);
          } else {
            formattedLines.push(trimmedLine);
          }
        } else {
          formattedLines.push(trimmedLine);
        }
      }
    });

    return formattedLines;
  };

  const extractTextBlocks = async (imageSrc: string) => {
    setIsExtractingText(true);
    try {
      const worker = await createWorker("spa");
      const { data: { text } } = await worker.recognize(imageSrc);
      await worker.terminate();
      
      const rawText = text.trim();
      const lines = rawText.split(/\n/).filter(line => line.trim().length > 0);
      const blocks: TextBlock[] = lines.map((line, index) => ({
        id: `block-${index}`,
        text: line.trim(),
        selected: true,
      }));
      
      setTextBlocks(blocks);
      return blocks;
    } catch (error) {
      console.error("Error extrayendo texto:", error);
      alert("Error al extraer el texto de la imagen");
      return [];
    } finally {
      setIsExtractingText(false);
    }
  };

  const extractTextFromImage = async (imageSrc: string) => {
    setIsProcessing(true);
    try {
      const worker = await createWorker("spa");
      const { data: { text } } = await worker.recognize(imageSrc);
      await worker.terminate();
      const rawText = text.trim();
      
      const formattedLines = formatDialogueText(rawText);
      const formattedText = formattedLines.join("\n");
      
      setExtractedText(formattedText);
      return formattedText;
    } catch (error) {
      console.error("Error extrayendo texto:", error);
      alert("Error al extraer el texto de la imagen");
      return "";
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (imageWithText) {
      extractTextBlocks(imageWithText);
    } else {
      setTextBlocks([]);
    }
  }, [imageWithText]);

  const combineTextWithBackground = async (createNew: boolean = false) => {
    if (!backgroundImage || !extractedText) {
      alert("Por favor, sube ambas imágenes y extrae el texto primero");
      return;
    }

    setIsProcessing(true);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        bgImg.onload = resolve;
        bgImg.onerror = reject;
        bgImg.src = backgroundImage;
      });

      canvas.width = bgImg.width;
      canvas.height = bgImg.height;

      ctx.drawImage(bgImg, 0, 0);

      ctx.font = `bold ${textConfig.fontSize}px Arial`;
      ctx.fillStyle = textConfig.color;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      const dialogueLines = extractedText.split("\n").filter(line => line.trim().length > 0);
      const renderedLines: { text: string; isName: boolean; isAsterisk: boolean }[] = [];

      dialogueLines.forEach((dialogue) => {
        const trimmedDialogue = dialogue.trim();
        const isAsteriskDialogue = trimmedDialogue.startsWith("*");
        
        const dialogueToProcess = isAsteriskDialogue ? trimmedDialogue.substring(1).trim() : trimmedDialogue;
        
        const colonIndex = dialogueToProcess.indexOf(":");
        if (colonIndex > 0) {
          const name = dialogueToProcess.substring(0, colonIndex).trim();
          const message = dialogueToProcess.substring(colonIndex + 1).trim();
          
          ctx.font = `${textConfig.fontSize}px Arial`;
          
          const words = message.split(" ");
          let currentLine = "";
          let isFirstLine = true;
          
          words.forEach((word) => {
            const testMessageLine = currentLine ? `${currentLine} ${word}` : word;
            const testLine = isFirstLine ? `${name}: ${testMessageLine}` : testMessageLine;
            
            const metrics = ctx.measureText(testLine);
            if (metrics.width > textConfig.maxWidth && currentLine) {
              if (isFirstLine) {
                renderedLines.push({ text: `${name}: ${currentLine}`, isName: false, isAsterisk: isAsteriskDialogue });
                isFirstLine = false;
              } else {
                renderedLines.push({ text: currentLine, isName: false, isAsterisk: isAsteriskDialogue });
              }
              currentLine = word;
            } else {
              currentLine = testMessageLine;
            }
          });
          
          if (currentLine) {
            if (isFirstLine) {
              renderedLines.push({ text: `${name}: ${currentLine}`, isName: false, isAsterisk: isAsteriskDialogue });
            } else {
              renderedLines.push({ text: currentLine, isName: false, isAsterisk: isAsteriskDialogue });
            }
          }
        } else {
          renderedLines.push({ text: dialogueToProcess, isName: false, isAsterisk: isAsteriskDialogue });
        }
      });

      const lineHeight = textConfig.fontSize + 2;
      const totalTextHeight = renderedLines.length * lineHeight;

      const padding = 20;
      let x = 0;
      let startY = 0;

      if (textConfig.position.includes("left")) {
        x = padding;
      } else if (textConfig.position.includes("right")) {
        x = canvas.width - padding;
      } else {
        x = canvas.width / 2;
      }

      if (textConfig.position.includes("top")) {
        startY = padding;
      } else if (textConfig.position.includes("bottom")) {
        startY = canvas.height - totalTextHeight - padding;
      } else {
        startY = (canvas.height - totalTextHeight) / 2;
      }

      if (textConfig.position.includes("left")) {
        ctx.textAlign = "left";
      } else if (textConfig.position.includes("right")) {
        ctx.textAlign = "right";
      } else {
        ctx.textAlign = "center";
      }
      
      let y = startY;
      const nameFontSize = textConfig.fontSize;
      const messageFontSize = textConfig.fontSize;
      const purpleColor = "#e0bbfd";

      renderedLines.forEach((lineObj) => {
        if (lineObj.isName) {
          ctx.font = `bold ${nameFontSize}px Arial`;
        } else {
          ctx.font = `${messageFontSize}px Arial`;
        }

        const textColor = lineObj.isAsterisk ? purpleColor : textConfig.color;
        ctx.fillStyle = textColor;

        const strokeWidth = Math.max(2, Math.floor(textConfig.fontSize / 8));
        
        ctx.strokeStyle = "rgba(0, 0, 0, 0.9)";
        ctx.lineWidth = strokeWidth + 2;
        ctx.lineJoin = "round";
        ctx.miterLimit = 2;
        ctx.strokeText(lineObj.text, x, y);
        
        ctx.strokeStyle = "rgba(0, 0, 0, 0.6)";
        ctx.lineWidth = strokeWidth + 1;
        ctx.strokeText(lineObj.text, x, y);
        
        ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
        ctx.lineWidth = strokeWidth;
        ctx.strokeText(lineObj.text, x, y);
        
        ctx.fillText(lineObj.text, x, y);
        y += lineHeight;
      });

      const resultImage = canvas.toDataURL("image/png");
      
      setCurrentImageIndex(prevIndex => {
        setCombinedImages(prevImages => {
          const shouldCreateNew = createNew || prevIndex < 0 || prevIndex >= prevImages.length;
          
          if (shouldCreateNew) {
            if (prevImages.length >= 5) {
              return prevImages;
            }
            return [...prevImages, resultImage];
          } else {
            const newImages = [...prevImages];
            newImages[prevIndex] = resultImage;
            return newImages;
          }
        });
        
        const shouldCreateNew = createNew || prevIndex < 0;
        return shouldCreateNew ? (prevIndex < 0 ? 0 : prevIndex + 1) : prevIndex;
      });
    } catch (error) {
      console.error("Error combinando imágenes:", error);
      alert("Error al combinar las imágenes");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleBlockSelection = (blockId: string) => {
    setTextBlocks(prev => 
      prev.map(block => 
        block.id === blockId ? { ...block, selected: !block.selected } : block
      )
    );
  };

  const moveBlock = (blockId: string, direction: "up" | "down") => {
    setTextBlocks(prev => {
      const index = prev.findIndex(block => block.id === blockId);
      if (index === -1) return prev;

      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const newBlocks = [...prev];
      [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
      return newBlocks;
    });
  };

  const reorderBlocks = (fromIndex: number, toIndex: number) => {
    setTextBlocks(prev => {
      const newBlocks = [...prev];
      const [movedBlock] = newBlocks.splice(fromIndex, 1);
      newBlocks.splice(toIndex, 0, movedBlock);
      return newBlocks;
    });
  };

  const handleApplySelectedText = () => {
    const selectedText = textBlocks
      .filter(block => block.selected)
      .map(block => block.text)
      .join("\n");
    handleExtractText(selectedText);
    setTimeout(() => {
      combineTextWithBackground(false);
    }, 150);
  };

  const handleAutoMode = () => {
    const updatedBlocks = textBlocks.map(block => ({ ...block, selected: true }));
    setTextBlocks(updatedBlocks);
    const allText = updatedBlocks.map(block => block.text).join("\n");
    handleExtractText(allText);
    setTimeout(() => {
      combineTextWithBackground(false);
    }, 150);
  };

  const handleExtractText = async (providedText?: string) => {
    if (providedText) {
      const formattedLines = formatDialogueText(providedText);
      const formattedText = formattedLines.join("\n");
      setExtractedText(formattedText);
      if (backgroundImage) {
        setTimeout(() => {
          combineTextWithBackground(false);
        }, 100);
      }
      return;
    }

    if (!imageWithText) {
      alert("Por favor, sube primero la imagen con texto");
      return;
    }
    const extracted = await extractTextFromImage(imageWithText);
    if (extracted && backgroundImage) {
      setTimeout(() => {
        combineTextWithBackground(false);
      }, 100);
    }
  };

  const downloadImage = () => {
    const currentImage = combinedImages[currentImageIndex];
    if (!currentImage) return;
    setShowDownloadModal(true);
  };

  const handleDownloadWithSize = (width: number, height: number) => {
    const currentImage = combinedImages[currentImageIndex];
    if (!currentImage) return;

    if (width === 0 || height === 0) {
      const link = document.createElement("a");
      link.download = "imagen-combinada.png";
      link.href = currentImage;
      link.click();
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `imagen-combinada-${width}x${height}.png`;
        link.href = url;
        link.click();
      URL.revokeObjectURL(url);
    }, "image/png");
    };
    img.src = currentImage;
  };

  return (
    <div className="w-full h-screen flex flex-col bg-linear-to-b from-slate-50 to-slate-100 dark:from-indigo-900 dark:to-gray-800">
      <div className="flex-1 flex flex-row overflow-hidden min-h-0 p-4 gap-2">
        <Sidebar
          imageWithText={imageWithText}
          backgroundImage={backgroundImage}
          extractedText={extractedText}
          combinedImage={combinedImages[currentImageIndex] || null}
          isProcessing={isProcessing}
          textBlocks={textBlocks}
          onImageWithTextChange={setImageWithText}
          onBackgroundImageChange={setBackgroundImage}
          onExtractText={handleExtractText}
          onExtractedTextChange={(text) => {
            setExtractedText(text);
            if (backgroundImage && text.trim()) {
              setTimeout(() => {
                combineTextWithBackground(false);
              }, 300);
            }
          }}
          onCombine={() => combineTextWithBackground(true)}
          onDownload={downloadImage}
          onOpenModal={setOpenTextModal}
          onChangeBackground={(newBackground) => {
            setBackgroundImage(newBackground);
            if (extractedText) {
              setTimeout(() => {
                combineTextWithBackground(false);
              }, 100);
            }
          }}
        />
        <ImageViewer 
          combinedImages={combinedImages}
          currentImageIndex={currentImageIndex}
          onImageChange={setCurrentImageIndex}
          onAddNewImage={() => combineTextWithBackground(true)}
        />
      </div>

      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onDownload={handleDownloadWithSize}
        currentImage={combinedImages[currentImageIndex] || null}
      />

      <TextSelectionModal
        isOpen={openTextModal === "textSelection"}
        onClose={() => setOpenTextModal(null)}
        textBlocks={textBlocks}
        isExtractingText={isExtractingText}
        isProcessing={isProcessing}
        onToggleBlockSelection={toggleBlockSelection}
        onApplySelectedText={handleApplySelectedText}
        onAutoMode={handleAutoMode}
        onMoveBlock={moveBlock}
        onReorderBlocks={reorderBlocks}
      />

      <TextConfigModal
        isOpen={openTextModal === "textConfig"}
        onClose={() => setOpenTextModal(null)}
        textConfig={textConfig}
        onTextConfigChange={setTextConfig}
        onSave={(config) => {
          setTextConfig(config);
          if (backgroundImage && extractedText) {
            setTimeout(() => {
              combineTextWithBackground(false);
            }, 100);
          }
        }}
      />
    </div>
  );
}
