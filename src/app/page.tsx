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
    fontSize: 16,
    color: "#FFFFFF",
    position: "left-bottom",
    maxWidth: 800,
  });


  // Palabras que indican que toda la línea debe ser ignorada
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
    // Dividir en líneas para procesar cada una
    const lines = text.split(/\n/);
    
    // Filtrar líneas: eliminar cualquier línea que contenga palabras ignoradas
    const filteredLines = lines.filter(line => {
      const lineLower = line.toLowerCase().trim();
      
      // Si la línea contiene alguna palabra ignorada, eliminar toda la línea
      const containsIgnoredWord = ignoredWords.some(ignoredWord => 
        lineLower.includes(ignoredWord.toLowerCase())
      );
      
      // Si contiene una palabra ignorada, no incluir esta línea
      if (containsIgnoredWord) {
        return false;
      }
      
      // Mantener la línea si no contiene palabras ignoradas y no está vacía
      return line.trim().length > 0;
    });
    
    // Limpiar espacios múltiples dentro de cada línea
    const cleanedLines = filteredLines.map(line => 
      line.replace(/\s+/g, " ").trim()
    ).filter(line => line.length > 0);
    
    return cleanedLines.join("\n");
  };

  const formatDialogueText = (text: string): string[] => {
    // Primero filtrar palabras ignoradas
    const filteredText = filterIgnoredWords(text);
    
    // Dividir el texto en líneas
    const lines = filteredText.split(/\n/).filter(line => line.trim().length > 0);
    const formattedLines: string[] = [];

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      
      // Buscar patrones de diálogo: "Nombre Apellido: mensaje" o "Nombre: mensaje"
      // También puede ser "Nombre Apellido dice: mensaje"
      const dialoguePattern = /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*(?:dice\s*)?:\s*(.+)$/i;
      const match = trimmedLine.match(dialoguePattern);
      
      if (match) {
        // Si ya tiene el formato correcto, usarlo tal cual
        formattedLines.push(trimmedLine);
      } else {
        // Si no tiene el formato, intentar detectar si es un nombre seguido de dos puntos
        const colonIndex = trimmedLine.indexOf(":");
        if (colonIndex > 0) {
          const beforeColon = trimmedLine.substring(0, colonIndex).trim();
          const afterColon = trimmedLine.substring(colonIndex + 1).trim();
          
          // Verificar si la parte antes de los dos puntos parece un nombre
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
      // Dividir en líneas y crear bloques
      const lines = rawText.split(/\n/).filter(line => line.trim().length > 0);
      const blocks: TextBlock[] = lines.map((line, index) => ({
        id: `block-${index}`,
        text: line.trim(),
        selected: true, // Por defecto todos seleccionados
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
      const worker = await createWorker("spa"); // español
      const { data: { text } } = await worker.recognize(imageSrc);
      await worker.terminate();
      const rawText = text.trim();
      
      // Formatear el texto como diálogos
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

  // Efecto para extraer bloques de texto cuando cambia la imagen
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

      // Dibujar imagen de fondo
      ctx.drawImage(bgImg, 0, 0);

      // Configurar estilo del texto
      ctx.font = `bold ${textConfig.fontSize}px Arial`;
      ctx.fillStyle = textConfig.color;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      // Dividir el texto en diálogos (cada línea es un diálogo)
      const dialogueLines = extractedText.split("\n").filter(line => line.trim().length > 0);
      const renderedLines: { text: string; isName: boolean; isAsterisk: boolean }[] = [];

      dialogueLines.forEach((dialogue) => {
        const trimmedDialogue = dialogue.trim();
        const isAsteriskDialogue = trimmedDialogue.startsWith("*");
        
        // Si comienza con *, quitar el asterisco para el procesamiento
        const dialogueToProcess = isAsteriskDialogue ? trimmedDialogue.substring(1).trim() : trimmedDialogue;
        
        const colonIndex = dialogueToProcess.indexOf(":");
        if (colonIndex > 0) {
          const name = dialogueToProcess.substring(0, colonIndex).trim();
          const message = dialogueToProcess.substring(colonIndex + 1).trim();
          
          // Configurar fuente para medir el mensaje
          ctx.font = `${textConfig.fontSize}px Arial`;
          
          // Dividir el mensaje en múltiples líneas si es muy largo
          const words = message.split(" ");
          let currentLine = "";
          let isFirstLine = true;
          
          words.forEach((word) => {
            // Construir la línea de prueba (currentLine siempre contiene solo palabras del mensaje)
            const testMessageLine = currentLine ? `${currentLine} ${word}` : word;
            const testLine = isFirstLine ? `${name}: ${testMessageLine}` : testMessageLine;
            
            const metrics = ctx.measureText(testLine);
            if (metrics.width > textConfig.maxWidth && currentLine) {
              // Guardar la línea actual
              if (isFirstLine) {
                renderedLines.push({ text: `${name}: ${currentLine}`, isName: false, isAsterisk: isAsteriskDialogue });
                isFirstLine = false;
              } else {
                renderedLines.push({ text: currentLine, isName: false, isAsterisk: isAsteriskDialogue });
              }
              currentLine = word;
            } else {
              // Continuar agregando palabras a la línea actual
              currentLine = testMessageLine;
            }
          });
          
          // Agregar la última línea
          if (currentLine) {
            if (isFirstLine) {
              renderedLines.push({ text: `${name}: ${currentLine}`, isName: false, isAsterisk: isAsteriskDialogue });
            } else {
              renderedLines.push({ text: currentLine, isName: false, isAsterisk: isAsteriskDialogue });
            }
          }
        } else {
          // Si no tiene formato de diálogo, agregarlo tal cual
          renderedLines.push({ text: dialogueToProcess, isName: false, isAsterisk: isAsteriskDialogue });
        }
      });

      // Calcular altura total del texto
      const lineHeight = textConfig.fontSize + 2;
      const totalTextHeight = renderedLines.length * lineHeight;

      // Calcular posición basada en la configuración
      const padding = 20;
      let x = 0;
      let startY = 0;

      // Calcular posición horizontal
      if (textConfig.position.includes("left")) {
        x = padding;
      } else if (textConfig.position.includes("right")) {
        x = canvas.width - padding;
      } else { // center
        x = canvas.width / 2;
      }

      // Calcular posición vertical
      if (textConfig.position.includes("top")) {
        startY = padding;
      } else if (textConfig.position.includes("bottom")) {
        startY = canvas.height - totalTextHeight - padding;
      } else { // center
        startY = (canvas.height - totalTextHeight) / 2;
      }

      // Configurar alineación del texto
      if (textConfig.position.includes("left")) {
        ctx.textAlign = "left";
      } else if (textConfig.position.includes("right")) {
        ctx.textAlign = "right";
      } else { // center
        ctx.textAlign = "center";
      }
      
      // Dibujar texto con efecto de relieve negro (múltiples capas para mejor legibilidad)
      let y = startY;
      const nameFontSize = textConfig.fontSize;
      const messageFontSize = textConfig.fontSize;
      // Color morado para diálogos con asterisco (similar al tono común en textos)
      const purpleColor = "#e0bbfd"; // Color morado estándar

      renderedLines.forEach((lineObj) => {
        if (lineObj.isName) {
          // Estilo para el nombre (más grande y destacado)
          ctx.font = `bold ${nameFontSize}px Arial`;
        } else {
          // Estilo para el mensaje
          ctx.font = `${messageFontSize}px Arial`;
        }

        // Determinar el color del texto: morado si es diálogo con asterisco, sino el color configurado
        const textColor = lineObj.isAsterisk ? purpleColor : textConfig.color;
        ctx.fillStyle = textColor;

        // Calcular el grosor del relieve basado en el tamaño de fuente
        const strokeWidth = Math.max(2, Math.floor(textConfig.fontSize / 8));
        
        // Dibujar múltiples capas de stroke para crear un efecto de relieve suave
        // Capa exterior (más gruesa y opaca)
        ctx.strokeStyle = "rgba(0, 0, 0, 0.9)";
        ctx.lineWidth = strokeWidth + 2;
        ctx.lineJoin = "round";
        ctx.miterLimit = 2;
        ctx.strokeText(lineObj.text, x, y);
        
        // Capa intermedia (suaviza la transición)
        ctx.strokeStyle = "rgba(0, 0, 0, 0.6)";
        ctx.lineWidth = strokeWidth + 1;
        ctx.strokeText(lineObj.text, x, y);
        
        // Capa interior (más delgada para definir el borde)
        ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
        ctx.lineWidth = strokeWidth;
        ctx.strokeText(lineObj.text, x, y);
        
        // Dibujar el texto principal encima
        ctx.fillText(lineObj.text, x, y);
        y += lineHeight;
      });

      // Convertir canvas a imagen
      const resultImage = canvas.toDataURL("image/png");
      
      // Usar funciones de callback para acceder a los valores actuales del estado
      // y determinar si crear una nueva imagen o actualizar la actual
      setCurrentImageIndex(prevIndex => {
        setCombinedImages(prevImages => {
          // Si createNew es true o no hay imagen actual válida, crear una nueva
          // Si createNew es false y hay una imagen actual válida, actualizar esa imagen
          const shouldCreateNew = createNew || prevIndex < 0 || prevIndex >= prevImages.length;
          
          if (shouldCreateNew) {
            // Crear una nueva imagen - el índice se actualizará después
            return [...prevImages, resultImage];
          } else {
            // Actualizar la imagen actual
            const newImages = [...prevImages];
            newImages[prevIndex] = resultImage;
            return newImages;
          }
        });
        
        // Actualizar el índice solo si se crea una nueva imagen
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
    // Regenerar la imagen automáticamente (actualizar la actual)
    setTimeout(() => {
      combineTextWithBackground(false); // false = actualizar imagen actual
    }, 150);
  };

  const handleAutoMode = () => {
    // Seleccionar todos los bloques y aplicar
    const updatedBlocks = textBlocks.map(block => ({ ...block, selected: true }));
    setTextBlocks(updatedBlocks);
    const allText = updatedBlocks.map(block => block.text).join("\n");
    handleExtractText(allText);
    // Regenerar la imagen automáticamente (actualizar la actual)
    setTimeout(() => {
      combineTextWithBackground(false); // false = actualizar imagen actual
    }, 150);
  };

  const handleExtractText = async (providedText?: string) => {
    if (providedText) {
      // Si se proporciona texto directamente (desde la selección), formatearlo y usarlo
      const formattedLines = formatDialogueText(providedText);
      const formattedText = formattedLines.join("\n");
      setExtractedText(formattedText);
      // Si hay imagen de fondo, generar automáticamente (actualizar la actual)
      if (backgroundImage) {
        setTimeout(() => {
          combineTextWithBackground(false); // false = actualizar imagen actual
        }, 100);
      }
      return;
    }

    // Si no se proporciona texto, extraerlo de la imagen
    if (!imageWithText) {
      alert("Por favor, sube primero la imagen con texto");
      return;
    }
    const extracted = await extractTextFromImage(imageWithText);
    // Si hay texto extraído y hay imagen de fondo, generar automáticamente
    // Actualizar la imagen actual si existe, o crear nueva si no hay
    if (extracted && backgroundImage) {
      // Esperar un momento para que el estado se actualice
      setTimeout(() => {
        combineTextWithBackground(false); // false = actualizar si existe, crear si no
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
      // Descargar imagen original sin redimensionar
      const link = document.createElement("a");
      link.download = "imagen-combinada.png";
      link.href = currentImage;
      link.click();
      return;
    }

    // Redimensionar imagen
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = width;
      canvas.height = height;

      // Dibujar la imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir a blob y descargar
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
      {/* Contenido principal: Sidebar + ImageViewer + TextSidebar */}
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
            // Regenerar la imagen automáticamente si hay imagen de fondo (actualizar la actual)
            if (backgroundImage && text.trim()) {
              setTimeout(() => {
                combineTextWithBackground(false); // false = actualizar imagen actual
              }, 300);
            }
          }}
          onCombine={() => combineTextWithBackground(true)} // true = crear nueva imagen
          onDownload={downloadImage}
          onOpenModal={setOpenTextModal}
          onChangeBackground={(newBackground) => {
            setBackgroundImage(newBackground);
            // Regenerar la imagen actual con el nuevo fondo
            if (extractedText) {
              setTimeout(() => {
                combineTextWithBackground(false); // false = actualizar imagen actual
              }, 100);
            }
          }}
        />
        <ImageViewer 
          combinedImages={combinedImages}
          currentImageIndex={currentImageIndex}
          onImageChange={setCurrentImageIndex}
        />
      </div>

      {/* Modal de descarga */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onDownload={handleDownloadWithSize}
        currentImage={combinedImages[currentImageIndex] || null}
      />

      {/* Modal de selección de texto */}
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

      {/* Modal de configuración de texto */}
      <TextConfigModal
        isOpen={openTextModal === "textConfig"}
        onClose={() => setOpenTextModal(null)}
        textConfig={textConfig}
        onTextConfigChange={setTextConfig}
        onSave={(config) => {
          setTextConfig(config);
          // Regenerar la imagen con la nueva configuración (actualizar la actual)
          if (backgroundImage && extractedText) {
            setTimeout(() => {
              combineTextWithBackground(false); // false = actualizar imagen actual
            }, 100);
          }
        }}
      />
    </div>
  );
}
