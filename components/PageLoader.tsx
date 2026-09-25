"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeContext"; // Asumimos que este contexto gestiona el estado global de carga

/**
 * Componente de Carga de Página Cinemática (Page Loader).
 * 
 * Actúa como una "cortina" inicial que cubre la aplicación mientras se cargan 
 * los recursos críticos. Simula un progreso de carga no lineal (más realista) 
 * y ofrece una experiencia visual de alta calidad con efectos de glitch y 
 * flujo de datos binarios.
 * 
 * Características clave:
 * - Bloqueo de scroll global durante la carga para evitar interacciones prematuras.
 * - Simulación de progreso con incrementos aleatorios (evita la linealidad robótica).
 * - Animación de salida tipo "cortina" (curva bezier personalizada) al completar la carga.
 * - Efecto de "glitch" sutil mediante keyframes de Framer Motion.
 */

export default function PageLoader() {
  // El estado de carga se comparte globalmente para que otros componentes 
  // (como el Layout o el Router) sepan si la app está lista.
  const { isLoading: loading, setIsLoading: setLoading } = useTheme();

  // Estado local para la barra de progreso (0 a 100)
  const [progress, setProgress] = useState(0);

  // Estado para el fondo binario. Se genera como una sola cadena larga 
  // en lugar de un array mapeado, lo cual es mucho más eficiente para el DOM 
  // al renderizar miles de caracteres con opacidad baja.
  const [binary, setBinary] = useState("");

  // --- Efecto Principal: Gestión del ciclo de vida de la carga ---
  useEffect(() => {
    // 1. Generación del fondo binario (2000 caracteres '0' o '1')
    const bits = Array.from({ length: 2000 }).map(() => Math.round(Math.random())).join("");
    setBinary(bits);

    // 2. Bloqueo del scroll del body.
    // Crucial para UX: evita que el usuario haga scroll y vea contenido 
    // a medio renderizar o interactúe con elementos antes de que estén listos.
    document.body.style.overflow = "hidden";

    // 3. Simulación de progreso de carga
    const interval = setInterval(() => {
      setProgress((prev) => {
        // Condición de finalización
        if (prev >= 100) {
          clearInterval(interval); // Detenemos el intervalo inmediatamente

          // Pequeño retraso (500ms) en el 100% para que el usuario registre 
          // visualmente que la carga se completó antes de que la cortina se levante.
          setTimeout(() => {
            setLoading(false); // Notifica al contexto global que la app está lista
            document.body.style.overflow = "unset"; // Restaura la capacidad de hacer scroll
          }, 500);

          return 100;
        }

        // Incremento no lineal: suma entre 2% y 6% en cada tick de 50ms.
        // Esto imita la naturaleza impredecible de las cargas de red reales, 
        // evitando que la barra se mueva de forma mecánica y predecible.
        return prev + Math.floor(Math.random() * 5) + 2;
      });
    }, 50); // Se ejecuta cada 50 milisegundos

    // Función de limpieza (Cleanup):
    // Se ejecuta si el componente se desmonta inesperadamente.
    // Garantiza que el intervalo se detenga y, lo más importante, que el 
    // scroll del body se restaure, evitando que la página quede "congelada".
    return () => {
      clearInterval(interval);
      document.body.style.overflow = "unset";
    };
  }, []); // Array vacío: solo se ejecuta una vez al montar el componente

  return (
    // AnimatePresence es obligatorio aquí para que la animación de 'exit' 
    // (la cortina subiendo) se reproduzca completamente antes de desmontar el div.
    <AnimatePresence>
      {loading && (
        <motion.div
          // Animación de salida: La cortina se desliza hacia arriba (-100% en Y).
          // La curva de easing [0.76, 0, 0.24, 1] es un "Expo Out" personalizado: 
          // comienza rápido y frena suavemente al final, dando una sensación premium.
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100000] bg-background flex flex-col items-center justify-center overflow-hidden"
        >
          {/* 
            Fondo Binario (Data Stream):
            - opacity-[0.03]: Extremadamente sutil, solo aporta textura.
            - break-all: Fuerza a que el texto largo se ajuste al ancho de la pantalla.
            - pointer-events-none & select-none: Garantiza que este fondo no interfiera 
              con el rendimiento del ratón ni permita selección de texto accidental.
          */}
          <div className="absolute inset-0 opacity-[0.03] font-mono text-[10px] break-all pointer-events-none select-none p-4 text-foreground">
            {binary}
          </div>

          {/* Contenido Central (Z-index superior para estar sobre el fondo) */}
          <div className="relative z-10 flex flex-col items-center">

            {/* Porcentaje de carga con entrada suave */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-6xl md:text-9xl font-black text-foreground tracking-tighter mb-8"
            >
              {progress}%
            </motion.div>

            {/* Barra de progreso contenedora */}
            <div className="w-64 h-[2px] bg-foreground/10 rounded-full overflow-hidden">
              {/* Barra de progreso activa: su ancho se anima sincronizado con el estado */}
              <motion.div
                className="h-full bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 50, damping: 15 }} // Suaviza los saltos del incremento aleatorio
              />
            </div>

            {/* Textos de estado del sistema */}
            <div className="mt-6 flex flex-col items-center gap-2">
              {/* Texto parpadeante fijo */}
              <div className="text-[10px] font-mono text-white/30 uppercase tracking-[0.4em] animate-pulse">
                INITIALIZING CORE_OS
              </div>

              {/* Texto dinámico que cambia según el umbral de progreso alcanzado */}
              <div className="text-[10px] font-mono text-white/30 uppercase tracking-[0.4em]">
                {progress < 30
                  ? "LOADING ASSETS..."
                  : progress < 70
                    ? "SYNCING INTERFACES..."
                    : "ESTABLISHING CONNECT..."}
              </div>
            </div>
          </div>

          {/* 
            Capa de Efecto Glitch (Fallo digital):
            Utiliza un array de valores en Framer Motion para crear keyframes.
            - opacity: parpadea entre 0, 0.1, 0, 0.05, 0.
            - x: se desplaza horizontalmente de forma errática (0 -> 10 -> -10 -> 5 -> 0).
            Esto crea la ilusión de una interferencia de señal CRT cada ~1 segundo.
          */}
          <motion.div
            animate={{
              opacity: [0, 0.1, 0, 0.05, 0],
              x: [0, 10, -10, 5, 0]
            }}
            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 1 }}
            className="absolute inset-0 bg-white/5 pointer-events-none mix-blend-overlay"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}