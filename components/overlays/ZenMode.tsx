"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Componente de Modo Zen (Pantalla de Meditación/Respiración Guiada).
 * 
 * Proporciona una experiencia de inmersión total para ayudar al usuario 
 * a relajarse y enfocarse. Se activa mediante el comando 'zen' en la Terminal 
 * o mediante el evento personalizado 'trigger-zen'.
 * 
 * Características clave:
 * - Inmersión total: Pantalla negra con cursor oculto para eliminar distracciones.
 * - Respiración guiada: Animación de 6 segundos (inhalar 3s, exhalar 3s) 
 *   sincronizada con el texto "Breathe".
 * - Cierre intuitivo: Click en cualquier parte o tecla Escape.
 * - Z-Index máximo (200000): Garantiza que esté por encima de TODO, 
 *   incluyendo el PageLoader, creando una experiencia aislada.
 * 
 * Psicología del diseño:
 * - 6 segundos por ciclo: Basado en técnicas de respiración 4-7-8 simplificadas.
 * - Cursor oculto: Elimina la tentación de hacer clic, forzando al usuario 
 *   a "soltar" el control y simplemente observar.
 * - Blur extremo (blur-xl): Crea una sensación de suavidad y calma visual.
 */
export default function ZenMode() {
  const [isActive, setIsActive] = useState(false);

  // --- Efecto 1: Escucha del evento global de activación ---
  useEffect(() => {
    const handleZen = () => setIsActive(prev => !prev);

    // El componente <Terminal> dispara este evento cuando el usuario 
    // escribe el comando 'zen'. Mantiene el principio de bajo acoplamiento.
    window.addEventListener("trigger-zen", handleZen);

    return () => window.removeEventListener("trigger-zen", handleZen);
  }, []);

  // --- Efecto 2: Soporte para tecla Escape (Accesibilidad) ---
  useEffect(() => {
    if (!isActive) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsActive(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isActive]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }} // Fade in/out lento para transición suave

          // cursor-none: Decisión de UX intencional. Al ocultar el cursor, 
          // eliminamos la affordance de "hacer clic", forzando al usuario 
          // a simplemente existir en el momento. Solo el texto inferior 
          // revela que puede hacer clic para salir.
          className="fixed inset-0 z-[200000] bg-black flex flex-col items-center justify-center cursor-none"
          onClick={() => setIsActive(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Zen mode. Press Escape or click anywhere to exit."
        >
          {/* Círculo de respiración: Escala y opacidad sincronizadas */}
          <motion.div
            // Keyframes de 3 valores: 
            // 0% (inicio) -> 50% (pico de inhalación) -> 100% (retorno a exhalar)
            // Esto crea un ciclo completo de respiración en 6 segundos.
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 6, // 6 segundos = ciclo completo de respiración
              repeat: Infinity,
              ease: "easeInOut" // Suavidad en los puntos de inflexión
            }}
            // bg-white/20 + blur-xl: Crea un "halo" suave y difuso, 
            // no un círculo sólido y agresivo.
            className="w-32 h-32 rounded-full bg-white/20 blur-xl"
          />

          {/* Texto "Breathe": Sincronizado con el círculo pero con animación más sutil */}
          <motion.div
            // Solo escala, sin cambio de opacidad, para mantener legibilidad constante.
            // La escala es menor (1.2 vs 1.5) para no competir visualmente con el círculo.
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              duration: 6, // MISMA duración que el círculo = sincronización perfecta
              repeat: Infinity,
              ease: "easeInOut"
            }}
            // tracking-[0.5em]: Espaciado extremo entre letras para un aspecto 
            // minimalista y "aireado", reforzando la sensación de calma.
            className="absolute text-white/50 font-mono text-sm tracking-[0.5em] uppercase select-none"
          >
            Breathe
          </motion.div>

          {/* Instrucción de salida: Ultra sutil para no distraer */}
          <div className="absolute bottom-10 text-white/20 text-[10px] font-mono uppercase tracking-widest select-none">
            Click anywhere to return
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}