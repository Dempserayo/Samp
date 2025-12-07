"use client";

interface TextBlock {
  id: string;
  text: string;
  selected: boolean;
}

interface TextSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  textBlocks: TextBlock[];
  isExtractingText: boolean;
  isProcessing: boolean;
  onToggleBlockSelection: (blockId: string) => void;
  onApplySelectedText: () => void;
  onAutoMode: () => void;
}

export default function TextSelectionModal({
  isOpen,
  onClose,
  textBlocks,
  isExtractingText,
  isProcessing,
  onToggleBlockSelection,
  onApplySelectedText,
  onAutoMode,
}: TextSelectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 shadow-xl w-full max-w-2xl border border-slate-200 dark:border-slate-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              Selección de Texto
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
            {/* Modo automático */}
            <div className="flex flex-col gap-2">
              <button
                onClick={onAutoMode}
                disabled={isExtractingText || isProcessing}
                className="w-full px-4 py-2 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Modo Automático (Usar Todo el Texto)
              </button>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Procesa automáticamente todo el texto extraído
              </p>
            </div>

            {/* Selector de bloques */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Seleccionar Texto ({textBlocks.filter(b => b.selected).length}/{textBlocks.length} seleccionados)
                </label>
                <button
                  onClick={() => {
                    const allSelected = textBlocks.every(b => b.selected);
                    textBlocks.forEach(block => {
                      if (block.selected === allSelected) {
                        onToggleBlockSelection(block.id);
                      }
                    });
                  }}
                  className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {textBlocks.every(b => b.selected) ? "Deseleccionar todo" : "Seleccionar todo"}
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800">
                {isExtractingText ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="animate-spin h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Extrayendo texto...</p>
                    </div>
                  </div>
                ) : (
                  textBlocks.map((block) => (
                    <div
                      key={block.id}
                      onClick={() => onToggleBlockSelection(block.id)}
                      className={`p-2 cursor-pointer transition-all ${
                        block.selected
                          ? "bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500"
                          : "bg-white dark:bg-slate-700 border-2 border-transparent hover:bg-slate-100 dark:hover:bg-slate-600"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={block.selected}
                          onChange={() => onToggleBlockSelection(block.id)}
                          className="mt-1"
                        />
                        <p className="text-xs text-slate-700 dark:text-slate-300 flex-1 whitespace-pre-wrap wrap-break-word">
                          {block.text}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button
                onClick={onApplySelectedText}
                disabled={isExtractingText || isProcessing || textBlocks.filter(b => b.selected).length === 0}
                className="w-full px-4 py-2 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Aplicar Texto Seleccionado
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

