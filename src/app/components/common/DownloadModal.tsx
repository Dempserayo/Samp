"use client";

import { useState, useEffect } from "react";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (width: number, height: number) => void;
  currentImage: string | null;
}

const presetSizes = [
  { label: "Original", width: 0, height: 0 },
  { label: "800x600", width: 800, height: 600 },
  { label: "1024x768", width: 1024, height: 768 },
  { label: "1280x720 (HD)", width: 1280, height: 720 },
  { label: "1920x1080 (Full HD)", width: 1920, height: 1080 },
  { label: "1080x1080 (Instagram)", width: 1080, height: 1080 },
  { label: "1200x630 (Facebook)", width: 1200, height: 630 },
];

export default function DownloadModal({
  isOpen,
  onClose,
  onDownload,
  currentImage,
}: DownloadModalProps) {
  const [selectedSize, setSelectedSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [customWidth, setCustomWidth] = useState<string>("");
  const [customHeight, setCustomHeight] = useState<string>("");
  const [useCustom, setUseCustom] = useState(false);

  // Resetear al abrir el modal
  useEffect(() => {
    if (!isOpen) return;
    // Use startTransition to avoid sync setState warning and cascading renders
    import("react").then(({ startTransition }) => {
      startTransition(() => {
        setSelectedSize({ width: 0, height: 0 });
        setCustomWidth("");
        setCustomHeight("");
        setUseCustom(false);
      });
    });
  }, [isOpen]);

  if (!isOpen || !currentImage) return null;

  const handleDownload = () => {
    let width = selectedSize.width;
    let height = selectedSize.height;

    if (useCustom) {
      width = parseInt(customWidth) || 0;
      height = parseInt(customHeight) || 0;
    }

    if (width > 0 && height > 0) {
      onDownload(width, height);
    } else {
      // Si es tamaño original, descargar sin redimensionar
      onDownload(0, 0);
    }
    onClose();
  };

  const handlePresetSelect = (width: number, height: number) => {
    setSelectedSize({ width, height });
    setUseCustom(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 shadow-xl w-full max-w-2xl  border border-slate-200 dark:border-slate-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              Opciones de Descarga
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

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 block">
                Tamaños Predefinidos
              </label>
              <div className="grid grid-cols-2 gap-2">
                {presetSizes.map((size) => (
                  <button
                    key={size.label}
                    onClick={() => handlePresetSelect(size.width, size.height)}
                    className={`px-4 py-3 text-sm font-medium  transition-all ${
                      !useCustom &&
                      selectedSize.width === size.width &&
                      selectedSize.height === size.height
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 block">
                Tamaño Personalizado
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setUseCustom(!useCustom)}
                  className={`px-3 py-2 text-sm font-medium  transition-all ${
                    useCustom
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                  }`}
                >
                  Usar personalizado
                </button>
              </div>
              {useCustom && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    placeholder="Ancho"
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600  bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                    min="1"
                  />
                  <span className="text-slate-600 dark:text-slate-400">x</span>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                    placeholder="Alto"
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600  bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                    min="1"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300  hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium shadow-md"
            >
              Descargar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

