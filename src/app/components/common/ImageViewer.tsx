"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface ImageViewerProps {
  combinedImage: string | null;
}

export default function ImageViewer({ combinedImage }: ImageViewerProps) {
  const [isZoomed, setIsZoomed] = useState(false);

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
      <div className="flex-1 h-full bg-white/20 p-10 shadow-2xl">
        <div className="h-full flex items-center justify-center">
          {combinedImage ? (
            <div 
              className="relative w-full h-full cursor-zoom-in"
              onClick={() => setIsZoomed(true)}
            >
              <Image
                src={combinedImage}
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
      </div>

      {isZoomed && combinedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative w-full h-full max-w-7xl max-h-[90vh]">
            <Image
              src={combinedImage}
              alt="Imagen ampliada"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2 hover:bg-black/70"
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

