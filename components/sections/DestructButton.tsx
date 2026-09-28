"use client";

// ============================================================================
// DestructButton.tsx
// ----------------------------------------------------------------------------
// Easter-egg del footer: botón "System Override" que inicia una secuencia
// falsa de autodestrucción.
//
// Qué hace:
// - Estado inicial: muestra un botón discreto rojo.
// - Al hacer clic: muestra cuenta atrás 3 → 0 ("Initiating Self-Destruct").
// - Al llegar a 0: aplica glitch visual al <body> y recarga la página a los 2s.
// - Mientras recarga: muestra overlay blanco fijo con "REBOOTING...".
//
// Dependencias:
// - framer-motion: `motion` + `AnimatePresence` para transicionar
//   entre botón y contador.
// ============================================================================

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * DestructButton — botón de autodestrucción simulada.
 *
 * Máquina de estados:
 * 1. `isCounting=false`: visible el botón "System Override".
 * 2. `isCounting=true, count>0`: visible el contador descendente.
 * 3. `count===0`: `triggerDestruct()` → `isDestructed=true` + reload.
 *
 * @returns JSX del botón / contador / overlay de reboot.
 */
export default function DestructButton() {
    // ¿Está corriendo la cuenta atrás?
    const [isCounting, setIsCounting] = useState(false);
    // Segundos restantes de la cuenta atrás. Empieza en 3.
    const [count, setCount] = useState(3);
    // ¿Ya se disparó la "destrucción"? Controla el overlay final.
    const [isDestructed, setIsDestructed] = useState(false);

    // Cuenta atrás con `setTimeout` encadenado:
    // - Si `isCounting` y queda tiempo: programa -1 en 1s (con cleanup).
    // - Si llega a 0: dispara la destrucción.
    useEffect(() => {
        if (isCounting && count > 0) {
            const timer = setTimeout(() => setCount(count - 1), 1000);
            return () => clearTimeout(timer);
        } else if (isCounting && count === 0) {
            triggerDestruct();
        }
    }, [isCounting, count]);

    // Efecto "destructivo" (solo visual):
    // - Deforma toda la app con blur + grayscale + contraste extremo.
    // - Recarga la página a los 2 segundos (esto revierte el estilo).
    const triggerDestruct = () => {
        setIsDestructed(true);
        // Visual "destruction" - apply blur and glitch to main app
        document.body.style.filter = "blur(20px) grayscale(100%) contrast(500%)";
        document.body.style.backgroundColor = "white";

        setTimeout(() => {
            window.location.reload();
        }, 2000);
    };

    return (
        // Contenedor centrado con aire vertical dentro del footer.
        <div className="flex flex-col items-center gap-4 py-10">
            {/* Alterna con animación entre botón inicial y contador. */}
            <AnimatePresence>
                {!isCounting ? (
                    // Estado 1: botón de activación, estilo fantasma rojo.
                    <motion.button
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        onClick={() => setIsCounting(true)}
                        className="group relative px-6 py-2 border border-red-500/30 text-red-500/50 text-[10px] font-mono uppercase tracking-[0.3em] hover:border-red-500 hover:text-red-500 transition-all rounded-full overflow-hidden"
                    >
                        <span className="relative z-10">System Override</span>
                        {/* Barrido rojo de izquierda a derecha en hover. */}
                        <div className="absolute inset-0 bg-red-500/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
                    </motion.button>
                ) : (
                    // Estado 2: cuenta atrás con zoom de entrada.
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center gap-2"
                    >
                        {/* Número grande pulsante (3, 2, 1, 0). */}
                        <div className="text-red-500 font-mono text-3xl font-bold animate-ping">
                            {count}
                        </div>
                        <div className="text-red-500 font-mono text-[10px] uppercase tracking-widest">
                            Initiating Self-Destruct
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Estado 3: overlay a pantalla completa mientras se recarga. */}
            {isDestructed && (
                <div className="fixed inset-0 z-[100000] bg-white flex items-center justify-center">
                    <div className="text-black font-mono text-xl animate-pulse">REBOOTING...</div>
                </div>
            )}
        </div>
    );
}
