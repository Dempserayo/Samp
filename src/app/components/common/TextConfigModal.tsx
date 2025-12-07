"use client";

import { useState, useEffect } from "react";
import { type TextConfig } from "./Sidebar";

interface TextConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  textConfig: TextConfig;
  onTextConfigChange: (config: TextConfig) => void;
  onSave: (config: TextConfig) => void;
}

export default function TextConfigModal({
  isOpen,
  onClose,
  textConfig,
  onTextConfigChange,
  onSave,
}: TextConfigModalProps) {
  const [localConfig, setLocalConfig] = useState<TextConfig>(textConfig);

  // Actualizar el estado local cuando cambia textConfig o se abre el modal
  useEffect(() => {
    if (isOpen) {
      setLocalConfig(textConfig);
    }
  }, [textConfig, isOpen]);

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 shadow-xl w-full max-w-2xl border border-slate-200 dark:border-slate-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              Configuración del Texto
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
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Tamaño de fuente</label>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{localConfig.fontSize}px</span>
              </div>
              <input
                type="range"
                min="10"
                max="120"
                value={localConfig.fontSize}
                onChange={(e) => setLocalConfig({ ...localConfig, fontSize: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setLocalConfig({ ...localConfig, fontSize: 24 })}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium transition-all ${
                    localConfig.fontSize === 24
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                  }`}
                >
                  Pequeño
                </button>
                <button
                  onClick={() => setLocalConfig({ ...localConfig, fontSize: 48 })}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium transition-all ${
                    localConfig.fontSize === 48
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                  }`}
                >
                  Mediano
                </button>
                <button
                  onClick={() => setLocalConfig({ ...localConfig, fontSize: 72 })}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium transition-all ${
                    localConfig.fontSize === 72
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
                  value={localConfig.color}
                  onChange={(e) => setLocalConfig({ ...localConfig, color: e.target.value })}
                  className="w-12 h-10 border-2 border-slate-300 dark:border-slate-600 cursor-pointer"
                />
                <div className="flex-1 px-3 py-2 bg-slate-200 dark:bg-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300">
                  {localConfig.color}
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
                    onClick={() => setLocalConfig({ ...localConfig, position: pos as TextConfig["position"] })}
                    className={`px-2 py-2 text-xs font-medium transition-all ${
                      localConfig.position === pos
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
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{localConfig.maxWidth}px</span>
              </div>
              <input
                type="range"
                min="200"
                max="1200"
                value={localConfig.maxWidth}
                onChange={(e) => setLocalConfig({ ...localConfig, maxWidth: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          {/* Botón de Guardar */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors rounded"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors rounded shadow-md hover:shadow-lg"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

