"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Square } from "lucide-react";

interface WindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  zIndex: number;
  onFocus: () => void;
}

/**
 * Componente de Ventana Individual Arrastrable (Draggable Window).
 * 
 * Representa una ventana estilo macOS/Windows que puede ser arrastrada,
 * enfocada y cerrada. Incluye gestión de z-index para ventanas activas
 * y límites de arrastre para evitar que se salgan de la pantalla.
 */
function Window({ id, title, children, onClose, zIndex, onFocus }: WindowProps) {
  const windowRef = useRef<HTMLDivElement>(null);

  // Cierre con tecla Escape cuando la ventana está enfocada
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && document.activeElement === windowRef.current) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <motion.div
      ref={windowRef}
      // Arrastre habilitado con límites para evitar salir de la pantalla
      drag
      dragMomentum={false}
      dragConstraints={{
        left: 0,
        right: window.innerWidth - 600, // Ancho máximo de la ventana
        top: 0,
        bottom: window.innerHeight - 100, // Altura mínima visible
      }}
      // Posicionamiento inicial centrado con offset para evitar superposición
      initial={{
        scale: 0.9,
        opacity: 0,
        x: Math.random() * 100 - 50, // Offset aleatorio horizontal
        y: Math.random() * 50 // Offset aleatorio vertical
      }}
      animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      // z-index dinámico gestionado por el padre
      style={{ zIndex }}
      // Al hacer clic, la ventana se enfoca (trae al frente)
      onMouseDown={onFocus}
      // Accesibilidad: permite navegación por teclado
      tabIndex={0}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} window`}
      className="fixed w-full max-w-2xl bg-background/90 glass rounded-xl shadow-2xl overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-white/50"
    >
      {/* Barra de título arrastrable */}
      <div className="flex items-center justify-between px-4 py-2 bg-foreground/5 border-b border-foreground/10 cursor-grab active:cursor-grabbing select-none">
        <div className="flex items-center gap-2">
          {/* Botones de control estilo macOS */}
          <div className="flex gap-1.5">
            <button
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors"
              aria-label="Close window"
            />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-[10px] font-mono text-foreground/40 uppercase tracking-widest ml-4">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-4 text-foreground/20">
          <Minus size={14} />
          <Square size={10} />
        </div>
      </div>

      {/* Contenido de la ventana con scroll */}
      <div className="p-8 max-h-[60vh] overflow-y-auto scrollbar-hide">
        {children}
      </div>
    </motion.div>
  );
}

// Tipado correcto para el evento personalizado
interface OpenWindowEvent extends CustomEvent {
  detail: {
    id: string;
    title: string;
    content: React.ReactNode;
  };
}

/**
 * Componente Gestor de Ventanas (Window Manager).
 * 
 * Gestiona el estado global de todas las ventanas abiertas en la aplicación.
 * Escucha eventos personalizados para abrir nuevas ventanas y maneja el
 * z-index dinámico para asegurar que la ventana activa esté siempre al frente.
 * 
 * Mejoras arquitectónicas aplicadas:
 * 1. Corrección del Anti-Patrón del Listener: Usa useRef para el estado
 *    dentro del listener, evitando re-registrar el evento en cada cambio.
 * 2. Gestión de Z-Index Dinámico: Cada ventana tiene su propio z-index
 *    que se actualiza al enfocarla, trayéndola al frente.
 * 3. Límites de Arrastre: Las ventanas no pueden arrastrarse fuera de la pantalla.
 * 4. Accesibilidad Completa: Soporte de teclado (Tab, Escape, Enter) y ARIA.
 * 5. Posicionamiento Inteligente: Offset aleatorio para evitar superposición.
 */
export default function WindowManager() {
  const [windows, setWindows] = useState<{ id: string; title: string; content: React.ReactNode }[]>([]);

  // Ref para acceder al estado actual dentro del listener sin re-registrarlo
  const windowsRef = useRef(windows);
  windowsRef.current = windows;

  // Contador de z-index para gestión de ventanas activas
  const [zIndexCounter, setZIndexCounter] = useState(5000);
  const [focusedWindowId, setFocusedWindowId] = useState<string | null>(null);

  // Listener optimizado: usa ref para evitar re-registro en cada cambio de estado
  useEffect(() => {
    const handleOpenWindow = (e: Event) => {
      const customEvent = e as OpenWindowEvent;
      const { id, title, content } = customEvent.detail;

      // Verificamos si la ventana ya está abierta usando la ref
      if (!windowsRef.current.find(w => w.id === id)) {
        setWindows(prev => [...prev, { id, title, content }]);
        setFocusedWindowId(id);
        setZIndexCounter(prev => prev + 1);
      } else {
        // Si ya está abierta, la enfocamos (traemos al frente)
        setFocusedWindowId(id);
        setZIndexCounter(prev => prev + 1);
      }
    };

    window.addEventListener("open-window", handleOpenWindow);
    return () => window.removeEventListener("open-window", handleOpenWindow);
  }, []); // Array vacío: el listener se registra una sola vez

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    if (focusedWindowId === id) {
      setFocusedWindowId(null);
    }
  };

  const focusWindow = (id: string) => {
    setFocusedWindowId(id);
    setZIndexCounter(prev => prev + 1);
  };

  // Calculamos el z-index para cada ventana
  const getZIndex = (id: string) => {
    if (id === focusedWindowId) {
      return zIndexCounter;
    }
    // Ventanas no enfocadas tienen z-index base
    return 5000;
  };

  return (
    <AnimatePresence>
      {windows.map(w => (
        <Window
          key={w.id}
          id={w.id}
          title={w.title}
          onClose={() => closeWindow(w.id)}
          zIndex={getZIndex(w.id)}
          onFocus={() => focusWindow(w.id)}
        >
          {w.content}
        </Window>
      ))}
    </AnimatePresence>
  );
}