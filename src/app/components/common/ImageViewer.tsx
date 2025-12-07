"use client";

import Image from "next/image";

interface ImageViewerProps {
  combinedImage: string | null;
}

export default function ImageViewer({ combinedImage }: ImageViewerProps) {
  return (
    <div className="flex-1 h-full">
      <div className="h-full flex items-center justify-center">
        {combinedImage ? (
          <div className="relative w-full h-full">
            <Image
              src={combinedImage}
              alt="Imagen combinada"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
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
  );
}

