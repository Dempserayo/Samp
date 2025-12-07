"use client";

import { useRef, useState } from "react";
import CropModal from "./CropModal";

export type TextConfig = {
  fontSize: number;
  color: string;
  position: "left-top" | "center-top" | "right-top" | "left-center" | "center-center" | "right-center" | "left-bottom" | "center-bottom" | "right-bottom";
  maxWidth: number;
};

interface TextBlock {
  id: string;
  text: string;
  selected: boolean;
}

interface SidebarProps {
  imageWithText: string | null;
  backgroundImage: string | null;
  extractedText: string;
  combinedImage: string | null;
  isProcessing: boolean;
  textBlocks: TextBlock[];
  onImageWithTextChange: (image: string | null) => void;
  onBackgroundImageChange: (image: string | null) => void;
  onExtractText: (text?: string) => void;
  onExtractedTextChange: (text: string) => void;
  onCombine: () => void;
  onDownload: () => void;
  onOpenModal: (modalType: "textSelection" | "textConfig") => void;
  onChangeBackground: (image: string) => void;
}

export default function Sidebar({
  imageWithText,
  backgroundImage,
  extractedText,
  combinedImage,
  isProcessing,
  textBlocks,
  onImageWithTextChange,
  onBackgroundImageChange,
  onExtractText,
  onExtractedTextChange,
  onCombine,
  onDownload,
  onOpenModal,
  onChangeBackground,
}: SidebarProps) {
  const textImageRef = useRef<HTMLInputElement>(null);
  const backgroundImageRef = useRef<HTMLInputElement>(null);
  const changeBackgroundRef = useRef<HTMLInputElement>(null);
  
  const [isOpen, setIsOpen] = useState(true);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempBackgroundImage, setTempBackgroundImage] = useState<string | null>(null);
  const [isChangingBackground, setIsChangingBackground] = useState(false);
  const [openSections, setOpenSections] = useState({
    ayuda: false,
    images: true,
    actions: false,
    extractedText: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => {
      // Si la sección que se está abriendo ya está abierta, cerrarla
      // Si se está abriendo una nueva, cerrar todas las demás y abrir solo esa
      const isCurrentlyOpen = prev[section];
      if (isCurrentlyOpen) {
        // Cerrar la sección actual
        return {
          ...prev,
          [section]: false,
        };
      } else {
        // Cerrar todas las secciones y abrir solo la seleccionada
        return {
          ayuda: false,
          images: false,
          actions: false,
          extractedText: false,
          [section]: true,
        };
      }
    });
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
          setTempBackgroundImage(event.target.result as string);
          setShowCropModal(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    onBackgroundImageChange(croppedImage);
    setTempBackgroundImage(null);
    setShowCropModal(false);
  };

  const handleCropCancel = () => {
    setTempBackgroundImage(null);
    setShowCropModal(false);
    if (backgroundImageRef.current) {
      backgroundImageRef.current.value = "";
    }
  };

  const handleChangeBackground = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setIsChangingBackground(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newBackground = event.target.result as string;
          setTempBackgroundImage(newBackground);
          setShowCropModal(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangeBackgroundCropComplete = (croppedImage: string) => {
    onChangeBackground(croppedImage);
    setTempBackgroundImage(null);
    setShowCropModal(false);
    setIsChangingBackground(false);
    if (changeBackgroundRef.current) {
      changeBackgroundRef.current.value = "";
    }
  };

  return (
    <div className={`${isOpen ? 'w-[400px]' : 'w-20'} h-full flex flex-col justify-between bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm shadow-2xl overflow-hidden transition-all duration-300 relative`}>
      {/* Botón de toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`absolute ${isOpen ? 'top-4 right-4' : 'top-4 left-1/2 -translate-x-1/2'} z-50 p-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600  transition-all duration-300 `}
        aria-label={isOpen ? "Cerrar sidebar" : "Abrir sidebar"}
      >
        {isOpen ? (
          <svg
            className="w-5 h-5 text-slate-700 dark:text-slate-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 text-slate-700 dark:text-slate-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="flex flex-col gap-4 p-6 overflow-y-auto h-full">
          <div className="mb-2">
            <h1 className="text-xl font-bold uppercase bg-linear-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Screenshot Generator
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Extrae texto y combínalo con imágenes
            </p>
          </div>

        {/* Sección: Ayuda */}
        <div className="border border-slate-200 dark:border-slate-700 overflow-hidden">
          <button
            onClick={() => toggleSection("ayuda")}
            className="w-full px-4 py-3 flex items-center justify-between   hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ayuda
            </span>
            <svg
              className={`w-4 h-4 text-slate-600 dark:text-slate-400 transition-transform ${
                openSections.ayuda ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openSections.ayuda && (
            <div className="p-4 space-y-4">
              <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Paso 1: Sube tus imágenes
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 ml-6">
                    Sube una imagen con texto que quieras extraer y una imagen de fondo donde quieras colocar ese texto.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Paso 2: Extrae el texto
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 ml-6">
                    Haz clic en &quot;Extraer Texto&quot; para que la aplicación detecte y extraiga el texto de tu imagen automáticamente.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    Paso 3: Configura el texto
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 ml-6">
                    Ajusta el tamaño, color, posición y ancho máximo del texto según tus preferencias.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Paso 4: Genera y descarga
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 ml-6">
                    Haz clic en &quot;Generar Imagen Combinada&quot; para crear tu imagen final y luego descárgala.
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  💡 Tip: El texto se formatea automáticamente como diálogos si detecta el patrón &quot;Nombre: mensaje&quot;
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Sección: Imágenes */}
        <div className="border border-slate-200 dark:border-slate-700 overflow-hidden">
          <button
            onClick={() => toggleSection("images")}
            className="w-full px-4 py-3 flex items-center justify-between  transition-colors"
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
            <div className="p-4 space-y-4 ">
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
                  className="px-4 py-3 bg-slate-500 hover:bg-slate-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 text-sm flex items-center justify-start gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Seleccionar Imagen con Texto
                </button>
                {imageWithText && (
                  <button
                    onClick={() => onExtractText()}
                    disabled={isProcessing}
                    className="w-full px-4 py-3 bg-slate-500 hover:bg-slate-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-start gap-2"
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
                  className="px-4 py-3 bg-slate-500 hover:bg-slate-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 text-sm flex items-center justify-start gap-2"
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

        {/* Sección: Acciones */}
        {extractedText && (
          <div className="border border-slate-200 dark:border-slate-700  overflow-hidden">
            <button
              onClick={() => toggleSection("actions")}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
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
              <div className="p-4 space-y-3">
                {/* Botón: Selección de Texto */}
                {textBlocks.length > 0 && (
                  <button
                    onClick={() => onOpenModal("textSelection")}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-start gap-2"
                    title="Selección de Texto"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Selección de Texto
                  </button>
                )}

                {/* Botón: Configuración del Texto */}
                {extractedText && (
                  <button
                    onClick={() => onOpenModal("textConfig")}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-start gap-2"
                    title="Configuración del Texto"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    Configuración del Texto
                  </button>
                )}

                {extractedText && backgroundImage && (
                  <button
                    onClick={onCombine}
                    disabled={isProcessing}
                    className="w-full px-4 py-3 bg-slate-500 hover:bg-slate-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-start gap-2"
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
                  <>
                    <input
                      ref={changeBackgroundRef}
                      type="file"
                      accept="image/*"
                      onChange={handleChangeBackground}
                      className="hidden"
                    />
                    <button
                      onClick={() => changeBackgroundRef.current?.click()}
                      disabled={isProcessing}
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-start gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Cambiar fondo de la imagen generada"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Cambiar Fondo
                    </button>
                    <button
                      onClick={onDownload}
                      className="w-full px-4 py-3 bg-slate-500 hover:bg-slate-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-start gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Descargar Imagen
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
        </div>
      )}

      {/* Sección: Texto Extraído */}
      {isOpen && extractedText && (
        <div className="border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={() => toggleSection("extractedText")}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
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
            <div className="p-4">
              <textarea
                value={extractedText}
                onChange={(e) => onExtractedTextChange(e.target.value)}
                className="w-full min-h-[120px] max-h-40 overflow-y-auto text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md p-3 font-mono text-xs leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 focus:border-transparent"
                placeholder="Edita el texto aquí..."
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">
                💡 Edita el texto y la imagen se actualizará automáticamente
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal de recorte */}
      {tempBackgroundImage && (
        <CropModal
          isOpen={showCropModal}
          onClose={() => {
            if (isChangingBackground) {
              setTempBackgroundImage(null);
              setShowCropModal(false);
              setIsChangingBackground(false);
              if (changeBackgroundRef.current) {
                changeBackgroundRef.current.value = "";
              }
            } else {
              handleCropCancel();
            }
          }}
          imageSrc={tempBackgroundImage}
          onCrop={(croppedImage) => {
            if (isChangingBackground) {
              handleChangeBackgroundCropComplete(croppedImage);
            } else {
              handleCropComplete(croppedImage);
            }
          }}
        />
      )}
    </div>
  );
}

