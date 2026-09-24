"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useSpring, useMotionValue, AnimatePresence } from "framer-motion";

interface TrailPoint {
    id: number;
    x: number;
    y: number;
}

/**
 * Descripción
 *
 * Componente que sustituye visualmente el cursor del sistema por un cursor personalizado compuesto por varias capas animadas con Framer Motion:
 * Un punto central que sigue al ratón con un efecto de muelle (spring).
 * Un anillo exterior que acompaña al punto.
 * Una estela geométrica de pequeños cuadrados que se desvanecen.
 * Un foco de inversión que aparece sobre imágenes o elementos marcados.
 * Un efecto magnético que atrae el cursor hacia el centro de los elementos interactivos.
 * 
 * No recibe props y no ocupa espacio en el layout: todas sus capas usan position: fixed y pointer-events: none.
 * 
 * Funcionamiento
 * 1º. Escucha del ratón: un useEffect registra un listener mousemove en window y lo elimina al desmontarse.
 * 2º. Detección de elementos interactivos: con target.closest(...) comprueba si el puntero está sobre .interactive, a o button.
 * 3º. Efecto magnético: si hay elemento interactivo, la posición objetivo es el centro del elemento más un 20 % del desplazamiento del puntero respecto a ese centro (centro + (mouse - centro) * 0.2). El cursor queda atraído hacia el centro del elemento pero se mueve ligeramente con el ratón. Si no lo hay, sigue directamente al puntero.
 * 4º. Estela: en cada movimiento se añade un punto y se conservan solo los últimos 11 (slice(-10) más el nuevo). Cada punto se anima de opacity: 0.5, scale: 1 a opacity: 0, scale: 0 en 0,5 s y rota id * 45 grados, por lo que cada cuadrado tiene una orientación distinta.
 * 5º. Inversión: isInverted se activa si el elemento es una <img>, está dentro de una, o tiene la clase invert-cursor.
 * 6º. Renderizado de capas:
 */

export default function CustomCursor() {
    const [isHovering, setIsHovering] = useState(false);
    const [isInverted, setIsInverted] = useState(false);
    const [trail, setTrail] = useState<TrailPoint[]>([]);
    const trailIdRef = useRef(0);

    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 25, stiffness: 250, mass: 0.5 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            const target = e.target as HTMLElement;                                                                  // Obtiene el elemento HTML sobre el que se mueve el cursor
            const interactiveEl = target.closest(".interactive") || target.closest("a") || target.closest("button"); // Busca si el elemento actual o alguno de sus ancestros tiene la clase .interactive, es un enlace o es un botón.

            if (interactiveEl) {
                const rect = (interactiveEl as HTMLElement).getBoundingClientRect();                                   // Obtiene las dimensiones y la posición del elemento interactivo.
                const centerX = rect.left + rect.width / 2;                                                            // Calcula el centro del elemento interactivo.
                const centerY = rect.top + rect.height / 2;                                                            // Calcula el centro del elemento interactivo.

                // Magnetic pull: cursor position is averaged with element center
                cursorX.set(centerX + (e.clientX - centerX) * 0.2);                                                    // Establece la posición X del cursor, aplicando un efecto magnético que lo atrae hacia el centro del elemento interactivo.
                cursorY.set(centerY + (e.clientY - centerY) * 0.2);                                                    // Establece la posición Y del cursor, aplicando un efecto magnético que lo atrae hacia el centro del elemento interactivo.
                setIsHovering(true);                                                                                   // Indica que el cursor está sobre un elemento interactivo.
            } else {
                cursorX.set(e.clientX);                                                                                // Si no hay elemento interactivo, el cursor sigue la posición del puntero.
                cursorY.set(e.clientY);                                                                                // Si no hay elemento interactivo, el cursor sigue la posición del puntero.
                setIsHovering(false);                                                                                  // Indica que el cursor no está sobre un elemento interactivo.
            }

            // Add to trail
            const newPoint = { id: trailIdRef.current++, x: e.clientX, y: e.clientY };                               // Añade un nuevo punto a la estela con la posición actual del puntero.
            setTrail(prev => [...prev.slice(-10), newPoint]);                                                        // Mantiene solo los últimos 10 puntos de la estela.

            setIsInverted(                                                                                           // Indica si el cursor debe invertirse.
                target.tagName === "IMG" ||                                                                            // Comprueba si el cursor está sobre una imagen.
                !!target.closest("img") ||                                                                             // Comprueba si el cursor está cerca de una imagen.
                target.classList.contains("invert-cursor")                                                             // Comprueba si el cursor está sobre una imagen con la clase invert-cursor.
            );
        };


        window.addEventListener("mousemove", moveCursor);                                                           // Añade el event listener para el movimiento del ratón.
        return () => window.removeEventListener("mousemove", moveCursor);                                           // Elimina el event listener para el movimiento del ratón.
    }, [cursorX, cursorY]);                                                                                       // Dependencias del efecto.

    return (
        <>
            <motion.div
                className="fixed top-0 left-0 w-4 h-4 bg-white rounded-full pointer-events-none z-[10000] mix-blend-difference"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
                animate={{
                    scale: isHovering ? 4 : 1,
                }}
            />

            {/* Geometric Trail */}
            <AnimatePresence>
                {trail.map((point, index) => (
                    <motion.div
                        key={point.id}
                        initial={{ opacity: 0.5, scale: 1 }}
                        animate={{ opacity: 0, scale: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="fixed top-0 left-0 w-2 h-2 bg-white/20 pointer-events-none z-[9998]"
                        style={{
                            x: point.x,
                            y: point.y,
                            translateX: "-50%",
                            translateY: "-50%",
                            rotate: point.id * 45,
                        }}
                    />
                ))}
            </AnimatePresence>

            {/* Outer ring */}
            <motion.div
                className="fixed top-0 left-0 w-8 h-8 border border-white/30 rounded-full pointer-events-none z-[9999]"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
                animate={{
                    scale: isHovering ? 1.5 : 1,
                    opacity: isHovering ? 0 : 1,
                }}
            />

            {/* Inversion spotlight */}
            {isInverted && (
                <motion.div
                    className="fixed top-0 left-0 w-32 h-32 rounded-full pointer-events-none z-[10001] bg-white mix-blend-difference"
                    style={{
                        x: cursorXSpring,
                        y: cursorYSpring,
                        translateX: "-50%",
                        translateY: "-50%",
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                />
            )}
        </>
    );
}