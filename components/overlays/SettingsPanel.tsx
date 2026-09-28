"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Cpu, Monitor, Volume2, Waves } from "lucide-react";
import { useTheme } from "../providers/ThemeContext";

/**
 * Componente de Panel de Configuración Deslizante (Settings Drawer).
 * 
 * Proporciona una interfaz lateral para controlar el tema global y los efectos 
 * visuales de la aplicación. Se integra con el ThemeContext para persistir 
 * las preferencias del usuario en localStorage.
 * 
 * Mejoras arquitectónicas aplicadas:
 * - Focus Trap: El tabulador queda confinado dentro del modal cuando está abierto,
 *   cumpliendo con estándares de accesibilidad WCAG 2.1.
 * - Soporte para Escape: Cierra el panel con la tecla Escape (estándar de UX).
 * - Scroll interno: El contenido es scrolleable si la ventana es muy pequeña.
 * - Type Safety: Eliminado el `as any` en setTheme usando tipado estricto.
 * - Feedback visual mejorado: Los toggles tienen animaciones más claras y los 
 *   botones de tema muestran un indicador visual más distintivo.
 */
export default function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, setTheme, toggleScanlines, toggleGrain, toggleAudio, togglePerformance } = useTheme();

  // Refs para el focus trap
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // --- Efecto 1: Soporte para tecla Escape ---
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // --- Efecto 2: Focus Trap (Accesibilidad WCAG) ---
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;

    // Enfocamos el botón de cerrar inmediatamente al abrir el panel
    closeButtonRef.current?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusableElements = panelRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      // Si estamos en el último elemento y presionamos Tab, volvemos al primero
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
      // Si estamos en el primer elemento y presionamos Shift+Tab, vamos al último
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleTab);
    return () => window.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  return (
    <>
      {/* Botón flotante para abrir el panel */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-20 z-[999] p-3 glass rounded-full text-white/50 hover:text-white hover:scale-110 transition-all"
        aria-label="Open settings panel"
        aria-haspopup="dialog"
      >
        <Settings size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop oscuro con blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Panel lateral deslizante */}
            <motion.div
              ref={panelRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              // overflow-y-auto: Permite scroll si el contenido es muy largo
              className="fixed top-0 right-0 h-full w-full max-w-sm z-[10001] bg-black/90 glass border-l border-white/10 p-8 text-white overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-label="Settings panel"
            >
              {/* Cabecera */}
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-2xl font-bold tracking-tighter">SETTINGS</h2>
                <button
                  ref={closeButtonRef}
                  onClick={() => setIsOpen(false)}
                  className="text-white/50 hover:text-white transition-colors"
                  aria-label="Close settings panel"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Contenido principal */}
              <div className="space-y-10">
                {/* Sección: Selección de Tema */}
                <section>
                  <h3 className="text-xs font-mono text-white/30 uppercase tracking-[0.2em] mb-4">Core Theme</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {(["cyberpunk", "forest", "mono"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`px-4 py-3 text-xs font-mono border rounded-lg transition-all relative overflow-hidden ${settings.theme === t
                            ? "border-white bg-white text-black font-bold"
                            : "border-white/10 text-white/50 hover:border-white/30"
                          }`}
                        aria-pressed={settings.theme === t}
                      >
                        {/* Indicador visual mejorado: punto de color cuando está seleccionado */}
                        {settings.theme === t && (
                          <motion.div
                            layoutId="theme-indicator"
                            className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-500"
                          />
                        )}
                        {t.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Sección: Toggles de Efectos Visuales */}
                <section className="space-y-6">
                  <h3 className="text-xs font-mono text-white/30 uppercase tracking-[0.2em] mb-4">Environment</h3>

                  {/* Toggle: Scanlines */}
                  <ToggleItem
                    icon={<Monitor size={18} />}
                    label="Scanlines"
                    description="CRT effect"
                    isActive={settings.scanlines}
                    onToggle={toggleScanlines}
                  />

                  {/* Toggle: Film Grain */}
                  <ToggleItem
                    icon={<Waves size={18} />}
                    label="Film Grain"
                    description="Noise texture"
                    isActive={settings.grain}
                    onToggle={toggleGrain}
                  />

                  {/* Toggle: Ambience Audio */}
                  <ToggleItem
                    icon={<Volume2 size={18} />}
                    label="Ambience"
                    description="Background drone"
                    isActive={settings.audioEnabled}
                    onToggle={toggleAudio}
                  />

                  {/* Toggle: Performance Mode */}
                  <ToggleItem
                    icon={<Cpu size={18} />}
                    label="Perf Mode"
                    description="Reduce animations"
                    isActive={settings.performanceMode}
                    onToggle={togglePerformance}
                  />
                </section>
              </div>

              {/* Footer informativo */}
              <div className="mt-12 pt-8 border-t border-white/10 text-[10px] font-mono text-white/20 uppercase leading-relaxed">
                System optimized for high-end scrollytelling. <br />
                Last build: {new Date().toLocaleDateString()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Componente reutilizable para cada fila de toggle.
 * Extraído para mantener el código limpio y evitar duplicación.
 */
function ToggleItem({
  icon,
  label,
  description,
  isActive,
  onToggle
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  isActive: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className="text-white/40 group-hover:text-white/60 transition-colors">
          {icon}
        </div>
        <div>
          <div className="text-sm text-white/80">{label}</div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider">{description}</div>
        </div>
      </div>

      {/* Toggle switch mejorado visualmente */}
      <button
        onClick={onToggle}
        className={`w-12 h-6 rounded-full relative transition-colors ${isActive ? "bg-green-500" : "bg-white/10"
          }`}
        role="switch"
        aria-checked={isActive}
        aria-label={`Toggle ${label}`}
      >
        <motion.div
          animate={{ x: isActive ? 24 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
        />
      </button>
    </div>
  );
}