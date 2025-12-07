"use client";

import { useState } from "react";
import { createWorker } from "tesseract.js";
import Sidebar, { type TextConfig } from "./components/Sidebar";
import ImageViewer from "./components/ImageViewer";
  
export default function Home() {
  const [imageWithText, setImageWithText] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [combinedImage, setCombinedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textConfig, setTextConfig] = useState<TextConfig>({
    fontSize: 16,
    color: "#FFFFFF",
    position: "left-bottom",
    maxWidth: 800,
  });


  const formatDialogueText = (text: string): string[] => {
    // Dividir el texto en líneas
    const lines = text.split(/\n/).filter(line => line.trim().length > 0);
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

  const combineTextWithBackground = async () => {
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
      const renderedLines: { text: string; isName: boolean }[] = [];

      dialogueLines.forEach((dialogue) => {
        const colonIndex = dialogue.indexOf(":");
        if (colonIndex > 0) {
          const name = dialogue.substring(0, colonIndex).trim();
          const message = dialogue.substring(colonIndex + 1).trim();
          
          // Agregar nombre
          renderedLines.push({ text: `${name}:`, isName: true });
          
          // Configurar fuente para medir el mensaje
          ctx.font = `${textConfig.fontSize}px Arial`;
          
          // Dividir el mensaje en múltiples líneas si es muy largo
          const words = message.split(" ");
          let currentLine = "";
          
          words.forEach((word) => {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > textConfig.maxWidth && currentLine) {
              renderedLines.push({ text: currentLine, isName: false });
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          });
          if (currentLine) {
            renderedLines.push({ text: currentLine, isName: false });
          }
        } else {
          // Si no tiene formato de diálogo, agregarlo tal cual
          renderedLines.push({ text: dialogue, isName: false });
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
      
      // Dibujar texto con borde (outline) para mejor legibilidad
      let y = startY;
      const nameFontSize = textConfig.fontSize;
      const messageFontSize = textConfig.fontSize;

      renderedLines.forEach((lineObj) => {
        if (lineObj.isName) {
          // Estilo para el nombre (más grande y destacado)
          ctx.font = `bold ${nameFontSize}px Arial`;
        } else {
          // Estilo para el mensaje
          ctx.font = `${messageFontSize}px Arial`;
        }

        // Dibujar borde negro
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4;
        ctx.strokeText(lineObj.text, x, y);
        // Dibujar texto
        ctx.fillText(lineObj.text, x, y);
        y += lineHeight;
      });

      // Convertir canvas a imagen
      const resultImage = canvas.toDataURL("image/png");
      setCombinedImage(resultImage);
    } catch (error) {
      console.error("Error combinando imágenes:", error);
      alert("Error al combinar las imágenes");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExtractText = async () => {
    if (!imageWithText) {
      alert("Por favor, sube primero la imagen con texto");
      return;
    }
    const extracted = await extractTextFromImage(imageWithText);
    // Si hay texto extraído y hay imagen de fondo, generar automáticamente
    if (extracted && backgroundImage) {
      // Esperar un momento para que el estado se actualice
      setTimeout(() => {
        combineTextWithBackground();
      }, 100);
    }
  };

  const downloadImage = () => {
    if (!combinedImage) return;
    const link = document.createElement("a");
    link.download = "imagen-combinada.png";
    link.href = combinedImage;
    link.click();
  };

  return (
    <div className="w-full h-screen flex flex-row bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Sidebar
        imageWithText={imageWithText}
        backgroundImage={backgroundImage}
        extractedText={extractedText}
        combinedImage={combinedImage}
        isProcessing={isProcessing}
        textConfig={textConfig}
        onImageWithTextChange={setImageWithText}
        onBackgroundImageChange={setBackgroundImage}
        onExtractText={handleExtractText}
        onTextConfigChange={setTextConfig}
        onCombine={combineTextWithBackground}
        onDownload={downloadImage}
      />
      <ImageViewer combinedImage={combinedImage} />
    </div>
  );
}
