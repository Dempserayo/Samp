"use client";

import { useState, useRef, useEffect } from "react";

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCrop: (croppedImage: string) => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function CropModal({ isOpen, onClose, imageSrc, onCrop }: CropModalProps) {
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (isOpen && imageSrc && containerRef.current) {
      const img = new Image();
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
        const container = containerRef.current;
        if (!container) return;
        
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        const scaleX = containerWidth / img.width;
        const scaleY = containerHeight / img.height;
        const newScale = Math.min(scaleX, scaleY, 0.9);
        setScale(newScale);

        const displayWidth = img.width * newScale;
        const displayHeight = img.height * newScale;

        const offsetX = (containerWidth - displayWidth) / 2;
        const offsetY = (containerHeight - displayHeight) / 2;
        setImageOffset({ x: offsetX, y: offsetY });

        setCropArea({
          x: offsetX + displayWidth * 0.1,
          y: offsetY + displayHeight * 0.1,
          width: displayWidth * 0.8,
          height: displayHeight * 0.8,
        });
      };
      img.src = imageSrc;
    }
  }, [isOpen, imageSrc]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (
      x >= cropArea.x &&
      x <= cropArea.x + cropArea.width &&
      y >= cropArea.y &&
      y <= cropArea.y + cropArea.height
    ) {
      setIsDragging(true);
      setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const displayWidth = imageSize.width * scale;
    const displayHeight = imageSize.height * scale;

    let newX = x - dragStart.x;
    let newY = y - dragStart.y;

    newX = Math.max(imageOffset.x, Math.min(newX, imageOffset.x + displayWidth - cropArea.width));
    newY = Math.max(imageOffset.y, Math.min(newY, imageOffset.y + displayHeight - cropArea.height));

    setCropArea((prev) => ({
      ...prev,
      x: newX,
      y: newY,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResize = (corner: "nw" | "ne" | "sw" | "se", e: React.MouseEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const startCropArea = { ...cropArea };

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const displayWidth = imageSize.width * scale;
      const displayHeight = imageSize.height * scale;

      let newCropArea = { ...startCropArea };

      if (corner === "nw") {
        newCropArea.x = Math.max(imageOffset.x, Math.min(startCropArea.x + deltaX, startCropArea.x + startCropArea.width - 50));
        newCropArea.y = Math.max(imageOffset.y, Math.min(startCropArea.y + deltaY, startCropArea.y + startCropArea.height - 50));
        newCropArea.width = startCropArea.width - (newCropArea.x - startCropArea.x);
        newCropArea.height = startCropArea.height - (newCropArea.y - startCropArea.y);
      } else if (corner === "ne") {
        newCropArea.y = Math.max(imageOffset.y, Math.min(startCropArea.y + deltaY, startCropArea.y + startCropArea.height - 50));
        newCropArea.width = Math.min(imageOffset.x + displayWidth - newCropArea.x, Math.max(50, startCropArea.width + deltaX));
        newCropArea.height = startCropArea.height - (newCropArea.y - startCropArea.y);
      } else if (corner === "sw") {
        newCropArea.x = Math.max(imageOffset.x, Math.min(startCropArea.x + deltaX, startCropArea.x + startCropArea.width - 50));
        newCropArea.width = startCropArea.width - (newCropArea.x - startCropArea.x);
        newCropArea.height = Math.min(imageOffset.y + displayHeight - newCropArea.y, Math.max(50, startCropArea.height + deltaY));
      } else if (corner === "se") {
        newCropArea.width = Math.min(imageOffset.x + displayWidth - newCropArea.x, Math.max(50, startCropArea.width + deltaX));
        newCropArea.height = Math.min(imageOffset.y + displayHeight - newCropArea.y, Math.max(50, startCropArea.height + deltaY));
      }

      setCropArea(newCropArea);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const handleApplyCrop = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const realX = ((cropArea.x - imageOffset.x) / scale);
      const realY = ((cropArea.y - imageOffset.y) / scale);
      const realWidth = (cropArea.width / scale);
      const realHeight = (cropArea.height / scale);

      const clampedX = Math.max(0, Math.min(realX, img.width));
      const clampedY = Math.max(0, Math.min(realY, img.height));
      const clampedWidth = Math.max(1, Math.min(realWidth, img.width - clampedX));
      const clampedHeight = Math.max(1, Math.min(realHeight, img.height - clampedY));

      canvas.width = clampedWidth;
      canvas.height = clampedHeight;

      ctx.drawImage(
        img,
        clampedX,
        clampedY,
        clampedWidth,
        clampedHeight,
        0,
        0,
        clampedWidth,
        clampedHeight
      );

      const croppedImage = canvas.toDataURL("image/png");
      onCrop(croppedImage);
      onClose();
    };
    img.src = imageSrc;
  };

  if (!isOpen) return null;

  const displayWidth = imageSize.width * scale;
  const displayHeight = imageSize.height * scale;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 shadow-xl w-full max-w-5xl max-h-[90vh] border border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            Recortar Imagen de Fondo
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 p-4 overflow-auto">
          <div
            ref={containerRef}
            className="relative mx-auto bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden"
            style={{ width: "100%", height: "60vh", minHeight: "400px" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Imagen para recortar"
              className="absolute"
              style={{
                left: `${imageOffset.x}px`,
                top: `${imageOffset.y}px`,
                width: `${displayWidth}px`,
                height: `${displayHeight}px`,
              }}
            />
            
            <div
              className="absolute bg-black/50"
              style={{
                top: 0,
                left: 0,
                width: `${cropArea.x}px`,
                height: "100%",
              }}
            />
            <div
              className="absolute bg-black/50"
              style={{
                top: 0,
                left: `${cropArea.x + cropArea.width}px`,
                right: 0,
                height: "100%",
              }}
            />
            <div
              className="absolute bg-black/50"
              style={{
                top: 0,
                left: `${cropArea.x}px`,
                width: `${cropArea.width}px`,
                height: `${cropArea.y}px`,
              }}
            />
            <div
              className="absolute bg-black/50"
              style={{
                top: `${cropArea.y + cropArea.height}px`,
                left: `${cropArea.x}px`,
                width: `${cropArea.width}px`,
                bottom: 0,
              }}
            />

            <div
              className="absolute border-2 border-blue-500 cursor-move"
              style={{
                left: `${cropArea.x}px`,
                top: `${cropArea.y}px`,
                width: `${cropArea.width}px`,
                height: `${cropArea.height}px`,
              }}
            >
              <div
              className="absolute border-2 border-blue-500 cursor-move"
              style={{
                left: `${cropArea.x}px`,
                top: `${cropArea.y}px`,
                width: `${cropArea.width}px`,
                height: `${cropArea.height}px`,
              }}
            >
              <div
                className="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nwse-resize"
                onMouseDown={(e) => handleResize("nw", e)}
              />
              <div
                className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nesw-resize"
                onMouseDown={(e) => handleResize("ne", e)}
              />
              <div
                className="absolute -bottom-1 -left-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nesw-resize"
                onMouseDown={(e) => handleResize("sw", e)}
              />
              <div
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nwse-resize"
                onMouseDown={(e) => handleResize("se", e)}
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors rounded"
          >
            Cancelar
          </button>
          <button
            onClick={handleApplyCrop}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors rounded shadow-md hover:shadow-lg"
          >
            Aplicar Recorte
          </button>
        </div>
      </div>
    </div>
  );
}

