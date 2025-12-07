"use client";

import { useRef, useState } from "react";

export type TextConfig = {
  fontSize: number;
  color: string;
  position: "left-top" | "center-top" | "right-top" | "left-center" | "center-center" | "right-center" | "left-bottom" | "center-bottom" | "right-bottom";
  maxWidth: number;
};

interface SidebarProps {
  imageWithText: string | null;
  backgroundImage: string | null;
  extractedText: string;
  combinedImage: string | null;
  isProcessing: boolean;
  textConfig: TextConfig;
  onImageWithTextChange: (image: string | null) => void;
  onBackgroundImageChange: (image: string | null) => void;
  onExtractText: () => void;
  onTextConfigChange: (config: TextConfig) => void;
  onCombine: () => void;
  onDownload: () => void;
}

export default function Sidebar({
  imageWithText,
  backgroundImage,
  extractedText,
  combinedImage,
  isProcessing,
  textConfig,
  onImageWithTextChange,
  onBackgroundImageChange,
  onExtractText,
  onTextConfigChange,
  onCombine,
  onDownload,
}: SidebarProps) {
  const textImageRef = useRef<HTMLInputElement>(null);
  const backgroundImageRef = useRef<HTMLInputElement>(null);
  
  const [openSections, setOpenSections] = useState({
    images: true,
    textConfig: false,
    actions: false,
    extractedText: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleTextImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageWithTextChange(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onBackgroundImageChange(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-96 h-full flex flex-col justify-between bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-r border-slate-200 dark:border-slate-700 shadow-xl overflow-y-auto p-2">
      <div className="flex flex-col gap-4 p-6">
        <div className="mb-2">
          <h1 className="text-2xl font-bold bg-linear-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Combinador de Imágenes
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Extrae texto y combínalo con imágenes
          </p>
        </div>
        
        {/* Sección: Imágenes */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection("images")}
            className="w-full px-4 py-3 flex items-center justify-between bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Imágenes
            </span>
            <svg
              className={`w-4 h-4 text-slate-600 dark:text-slate-400 transition-transform ${
                openSections.images ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openSections.images && (
            <div className="p-4 space-y-4 bg-white dark:bg-slate-900">
              {/* Input para imagen con texto */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Imagen con Texto</label>
                <input
                  ref={textImageRef}
                  type="file"
                  accept="image/*"
                  onChange={handleTextImageChange}
                  className="hidden"
                />
                <button
                  onClick={() => textImageRef.current?.click()}
                  className="px-4 py-3 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Seleccionar Imagen con Texto
                </button>
                {imageWithText && (
                  <button
                    onClick={onExtractText}
                    disabled={isProcessing}
                    className="w-full px-4 py-3 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Extrayendo...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Extraer Texto
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {/* Input para imagen de fondo */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Imagen de Fondo</label>
                <input
                  ref={backgroundImageRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundImageChange}
                  className="hidden"
                />
                <button
                  onClick={() => backgroundImageRef.current?.click()}
                  className="px-4 py-3 bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Seleccionar Imagen de Fondo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sección: Configuración del Texto */}
        {extractedText && (
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("textConfig")}
              className="w-full px-4 py-3 flex items-center justify-between bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Configuración del Texto
              </span>
              <svg
                className={`w-4 h-4 text-slate-600 dark:text-slate-400 transition-transform ${
                  openSections.textConfig ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSections.textConfig && (
              <div className="p-4 bg-white dark:bg-slate-900">
                <div className="flex flex-col gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Tamaño de fuente</label>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{textConfig.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="120"
                  value={textConfig.fontSize}
                  onChange={(e) => onTextConfigChange({ ...textConfig, fontSize: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => onTextConfigChange({ ...textConfig, fontSize: 24 })}
                    className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      textConfig.fontSize === 24
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                    }`}
                  >
                    Pequeño
                  </button>
                  <button
                    onClick={() => onTextConfigChange({ ...textConfig, fontSize: 48 })}
                    className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      textConfig.fontSize === 48
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                    }`}
                  >
                    Mediano
                  </button>
                  <button
                    onClick={() => onTextConfigChange({ ...textConfig, fontSize: 72 })}
                    className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      textConfig.fontSize === 72
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                    }`}
                  >
                    Grande
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">Color del texto</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={textConfig.color}
                    onChange={(e) => onTextConfigChange({ ...textConfig, color: e.target.value })}
                    className="w-12 h-10 rounded-lg border-2 border-slate-300 dark:border-slate-600 cursor-pointer"
                  />
                  <div className="flex-1 px-3 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300">
                    {textConfig.color}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">Posición del Texto</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { pos: "left-top", label: "Izq. Sup." },
                    { pos: "center-top", label: "Cen. Sup." },
                    { pos: "right-top", label: "Der. Sup." },
                    { pos: "left-center", label: "Izq. Cen." },
                    { pos: "center-center", label: "Centro" },
                    { pos: "right-center", label: "Der. Cen." },
                    { pos: "left-bottom", label: "Izq. Inf." },
                    { pos: "center-bottom", label: "Cen. Inf." },
                    { pos: "right-bottom", label: "Der. Inf." },
                  ].map(({ pos, label }) => (
                    <button
                      key={pos}
                      onClick={() => onTextConfigChange({ ...textConfig, position: pos as TextConfig["position"] })}
                      className={`px-2 py-2 text-xs font-medium rounded-lg transition-all ${
                        textConfig.position === pos
                          ? "bg-blue-500 text-white shadow-md"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Ancho máximo</label>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{textConfig.maxWidth}px</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="1200"
                  value={textConfig.maxWidth}
                  onChange={(e) => onTextConfigChange({ ...textConfig, maxWidth: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sección: Acciones */}
        {extractedText && (
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("actions")}
              className="w-full px-4 py-3 flex items-center justify-between bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Acciones
              </span>
              <svg
                className={`w-4 h-4 text-slate-600 dark:text-slate-400 transition-transform ${
                  openSections.actions ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSections.actions && (
              <div className="p-4 space-y-3 bg-white dark:bg-slate-900">
          {extractedText && backgroundImage && (
            <button
              onClick={onCombine}
              disabled={isProcessing}
              className="w-full px-4 py-3 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Generar Imagen Combinada
                </>
              )}
            </button>
          )}
          {combinedImage && (
            <button
              onClick={onDownload}
              className="w-full px-4 py-3 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descargar Imagen
            </button>
          )}
            </div>
          )}
          </div>
        )}
      </div>

      {/* Sección: Texto Extraído */}
      {extractedText && (
        <div className="border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={() => toggleSection("extractedText")}
            className="w-full px-4 py-3 flex items-center justify-between bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Texto Extraído
            </span>
            <svg
              className={`w-4 h-4 text-slate-600 dark:text-slate-400 transition-transform ${
                openSections.extractedText ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openSections.extractedText && (
            <div className="p-4 bg-white dark:bg-slate-900">
              <p className="font-semibold mb-3 text-sm text-slate-700 dark:text-slate-200">Texto Extraído</p>
          <div className="text-slate-600 dark:text-slate-400 max-h-40 overflow-y-auto whitespace-pre-line font-mono text-xs leading-relaxed p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            {extractedText.split("\n").map((line, index) => {
              const colonIndex = line.indexOf(":");
              if (colonIndex > 0) {
                const name = line.substring(0, colonIndex);
                const message = line.substring(colonIndex + 1);
                return (
                  <div key={index} className="mb-1.5">
                    <span className="font-bold text-blue-600 dark:text-blue-400">{name}:</span>
                    <span className="ml-1">{message}</span>
                  </div>
                );
              }
              return <div key={index} className="mb-1.5">{line}</div>;
            })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

