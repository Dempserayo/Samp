"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface ImageViewerProps {
  combinedImages: string[];
  currentImageIndex: number;
  onImageChange: (index: number) => void;
  onAddNewImage: () => void;
}

export default function ImageViewer({ combinedImages, currentImageIndex, onImageChange, onAddNewImage }: ImageViewerProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  
  const currentImage = currentImageIndex >= 0 && currentImageIndex < combinedImages.length 
    ? combinedImages[currentImageIndex] 
    : null;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsZoomed(false);
      }
    };

    if (isZoomed) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isZoomed]);

  return (
    <>
      <div className="flex-1 h-full bg-white/20 p-10 shadow-2xl relative">
        <div className="h-full flex items-center justify-center">
          {currentImage ? (
            <div 
              className="relative w-full h-full cursor-zoom-in"
              onClick={() => setIsZoomed(true)}
            >
              <Image
                src={currentImage}
                alt="Imagen combinada"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-white/50">
              <svg className="w-24 h-24 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="flex flex-col items-center justify-center">
                <p className="text-xl font-medium">La imagen combinada aparecerá aquí</p>
                <p className="text-xs">Sube las imágenes y genera tu combinación</p>
              </span>
            </div>
          )}
        </div>

        {combinedImages.length > 0 && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-3 max-h-[40vh] overflow-y-auto p-2 bg-linear-to-b from-black/40 via-black/50 to-black/40 backdrop-blur-md shadow-2xl border border-white/10 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {combinedImages.map((image, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  onImageChange(index);
                }}
                className={`relative w-10 h-10  overflow-hidden border-2 transition-all duration-300 transform ${
                  index === currentImageIndex
                    ? "border-blue-400 ring-4 ring-blue-400/30 scale-110 shadow-lg shadow-blue-500/50"
                    : "border-white/20 hover:border-white/60 hover:scale-105 hover:shadow-lg hover:shadow-white/20"
                }`}
                aria-label={`Ver imagen ${index + 1}`}
              >
                <Image
                  src={image}
                  alt={`Miniatura ${index + 1}`}
                  fill
                  className={`object-cover transition-transform duration-300 ${
                    index === currentImageIndex ? "scale-105" : "hover:scale-110"
                  }`}
                  unoptimized
                />
                <div className={`absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${
                  index === currentImageIndex ? "opacity-100" : "opacity-60"
                  }`} />
                <div className={`absolute bottom-0 left-0 right-0 text-white text-xs font-semibold text-center py-1.5 transition-all duration-300 ${
                  index === currentImageIndex 
                    ? "bg-linear-to-t from-blue-500/90 to-blue-400/70" 
                    : "bg-linear-to-t from-black/80 to-black/60"
                  }`}>
                  {index + 1}
                </div>
                {index === currentImageIndex && (
                  <div className="absolute top-1 right-1 w-3 h-3 bg-blue-400 ring-2 ring-white shadow-lg animate-pulse" />
                )}
              </button>
            ))}
            {combinedImages.length < 5 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddNewImage();
                }}
                className="relative w-10 h-10 overflow-hidden border-2 border-dashed border-white/40 hover:border-white/70 transition-all duration-300 transform hover:scale-105 flex items-center justify-center bg-black/20 hover:bg-black/40"
                aria-label="Agregar nueva imagen"
                title="Generar nueva imagen"
              >
                <svg className="w-6 h-6 text-white/70 hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {isZoomed && currentImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative w-full h-full max-w-7xl max-h-[90vh]">
            <Image
              src={currentImage}
              alt="Imagen ampliada"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors bg-black/50  p-2 hover:bg-black/70"
            aria-label="Cerrar zoom"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}

