"use client";

interface TextBlock {
  id: string;
  text: string;
  selected: boolean;
}

interface TextSidebarProps {
  imageWithText: string | null;
  backgroundImage: string | null;
  extractedText: string;
  textBlocks: TextBlock[];
  onOpenModal: (modalType: "textSelection" | "textConfig") => void;
}

export default function TextSidebar({
  imageWithText,
  backgroundImage,
  extractedText,
  textBlocks,
  onOpenModal,
}: TextSidebarProps) {

  // Solo mostrar el sidebar si hay imagen de texto Y de fondo
  if (!imageWithText || !backgroundImage) {
    return null;
  }

  return (
    <div className="w-20 h-full flex flex-col items-center justify-start p-4 gap-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-l border-slate-200 dark:border-slate-700 shadow-xl">
      {/* Botón: Selección de Texto */}
      {textBlocks.length > 0 && (
        <button
          onClick={() => onOpenModal("textSelection")}
          className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 shadow-md hover:shadow-lg transition-all duration-200"
          title="Selección de Texto"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      )}

      {/* Botón: Configuración del Texto */}
      {extractedText && (
        <button
          onClick={() => onOpenModal("textConfig")}
          className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 shadow-md hover:shadow-lg transition-all duration-200"
          title="Configuración del Texto"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
    </div>
  );
}

