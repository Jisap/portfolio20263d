"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Secuencia clásica del Código Konami
const KONAMI_CODE = [
    "ArrowUp", "ArrowUp",
    "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight",
    "ArrowLeft", "ArrowRight",
    "b", "a"
];

/**
 * Componente Easter Egg: Efecto de "Gravedad" al introducir el Código Konami.
 * 
 * Escucha las pulsaciones del teclado a nivel global. Si detecta la secuencia exacta,
 * inyecta estilos CSS dinámicos y aplica clases a los elementos del DOM para simular
 * que "caen" por la pantalla con una rotación aleatoria.
 * 
 * Mejoras de arquitectura aplicadas:
 * - Uso de `useRef` para el buffer de teclas, evitando re-registrar el event listener
 *   en cada renderizado (anti-patrón común en manejo de teclas).
 * - Limpieza (cleanup) adecuada de `setTimeout` y etiquetas `<style>` inyectadas 
 *   para prevenir fugas de memoria (memory leaks).
 */
export default function KonamiGravity() {
    const [isGravityBroken, setIsGravityBroken] = useState(false);

    // Ref para almacenar la secuencia de teclas sin provocar re-renderizados en cada pulsación
    const sequenceRef = useRef<string[]>([]);
    // Ref para guardar los IDs de los timeouts y poder cancelarlos si el componente se desmonta
    const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
    // Ref para la etiqueta de estilo inyectada, permitiendo su eliminación limpia
    const styleRef = useRef<HTMLStyleElement | null>(null);

    // --- Efecto 1: Listener global de teclado optimizado ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Añadimos la tecla y mantenemos solo la longitud máxima necesaria usando slice
            // Esto es mucho más eficiente que crear un nuevo array y usar shift() en cada tecla.
            sequenceRef.current = [...sequenceRef.current, e.key].slice(-KONAMI_CODE.length);

            // Comprobamos si la secuencia acumulada coincide con el código Konami
            if (sequenceRef.current.join(",") === KONAMI_CODE.join(",")) {
                triggerGravityDrop();
                // Opcional: Reiniciar la secuencia tras el éxito para permitir re-activación tras el reboot
                sequenceRef.current = [];
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        // Limpieza: remover el listener al desmontar el componente
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []); // Dependencia vacía: el listener se registra una sola vez

    // --- Lógica de activación del efecto de gravedad ---
    const triggerGravityDrop = () => {
        if (isGravityBroken) return;
        setIsGravityBroken(true);

        // 1. Inyección de estilos globales para la animación de caída
        const style = document.createElement("style");
        style.id = "gravity-styles";
        style.innerHTML = `
      /* 
        Usamos cubic-bezier(0.5, 0, 1, 1) para simular aceleración por gravedad:
        comienza lento y acelera drásticamente hacia el final de la transición.
      */
      * {
        transition: transform 2s cubic-bezier(0.5, 0, 1, 1), opacity 2s ease-in !important;
      }
      .gravity-fall {
        /* La variable --r se inyecta dinámicamente por elemento para rotación aleatoria */
        transform: translateY(150vh) rotate(calc(var(--r, 0) * 1deg)) !important;
        opacity: 0 !important;
        pointer-events: none !important; /* Evita clics accidentales mientras caen */
      }
    `;
        document.head.appendChild(style);
        styleRef.current = style;

        // 2. Selección y aplicación del efecto a elementos del DOM
        // Incluimos '.gravity-target' para que puedas marcar elementos específicos en tu app si lo deseas.
        const elements = document.querySelectorAll("h1, h2, h3, p, a, img, button, canvas, .gravity-target");

        elements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            // Generar rotación aleatoria entre -45 y 45 grados
            const randomRotation = Math.random() * 90 - 45;
            htmlEl.style.setProperty("--r", randomRotation.toString());

            // Retraso aleatorio (0 a 1000ms) para crear un efecto de "lluvia" o caída escalonada
            const timeoutId = setTimeout(() => {
                htmlEl.classList.add("gravity-fall");
            }, Math.random() * 1000);

            timeoutsRef.current.push(timeoutId);
        });
    };

    // --- Función de recuperación ---
    const rebootSystem = () => {
        // Limpieza proactiva antes de recargar (buena práctica, aunque el reload lo haría por nosotros)
        cleanupGravityEffect();
        window.location.reload();
    };

    // --- Función de limpieza (Cleanup) ---
    // Extraída para poder ser llamada tanto en el useEffect de desmontaje como en el reboot
    const cleanupGravityEffect = () => {
        // Cancelar todos los timeouts pendientes
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];

        // Eliminar la etiqueta de estilo inyectada
        if (styleRef.current && styleRef.current.parentNode) {
            styleRef.current.parentNode.removeChild(styleRef.current);
            styleRef.current = null;
        }
    };

    // --- Efecto 2: Limpieza al desmontar el componente ---
    useEffect(() => {
        return () => {
            cleanupGravityEffect();
        };
    }, []);

    return (
        <AnimatePresence>
            {isGravityBroken && (
                <motion.div
                    initial={{ opacity: 0 }}
                    // El delay de 2s coincide exactamente con la duración de la transición CSS de la caída,
                    // asegurando que la pantalla de "System Failure" aparezca justo cuando los elementos han caído.
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                    className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md"
                    role="alert" // Accesibilidad: indica que este es un mensaje de estado importante
                >
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 2.2, type: "spring" }}
                        className="text-red-500 font-mono text-xl md:text-2xl mb-8 animate-pulse text-center px-4"
                    >
                        ⚠️ SYSTEM FAILURE: GRAVITY ANOMALY DETECTED ⚠️
                    </motion.div>

                    <button
                        onClick={rebootSystem}
                        className="group relative px-8 py-4 border border-red-500 text-red-500 font-mono uppercase tracking-widest overflow-hidden transition-colors hover:text-black focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black"
                        aria-label="Reboot the system to restore normal gravity"
                    >
                        {/* Efecto de relleno (fill) al hacer hover para un feedback visual más rico */}
                        <span className="absolute inset-0 w-full h-full bg-red-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                        <span className="relative z-10 font-bold">Reboot System</span>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}