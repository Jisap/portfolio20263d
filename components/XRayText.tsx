"use client";
// 👆 Directiva de Next.js: marca este archivo como Client Component.
// Es necesario porque usamos hooks (useState, useRef) y event listeners// del navegador (mousemove, touchmove), que solo corren en el cliente.

import React, { useRef, useState } from "react";
// 👆 React + dos hooks:
//   - useRef: para obtener una referencia mutable al <section> y leer//     su posición/tamaño en pantalla.
//   - useState: para guardar el estado reactivo (posición del cursor
//     y si el usuario está "hovereando" el componente).

import { motion } from "framer-motion";
// 👆 Librería de animaciones. La usamos para transicionar el "light
// indicator" (el puntito blanco) con un spring suave.

/**
 * XRayText
 * ----------------------------------------------------------------
 * Efecto visual tipo "rayos X": se muestra un texto grande y tenue
 * de fondo, y al pasar el cursor se "revela" el mismo texto con un
 * gradiente de color dentro de un círculo que sigue al puntero.
 *
 * Cómo funciona (resumen):
 * 1. Hay2 capas con el mismo texto "Innovation".
 *    - La capa de fondo es blanca pero casi transparente (text-white/10).
 *    - La capa superior tiene gradiente morado→rosa→naranja y se
 *      recorta con `clip-path: circle(...)` para mostrar solo un
 *      círculo de 150px alrededor del cursor.
 * 2. Se trackea la posición del mouse/touch relativa al contenedor.
 * 3. Cuando el usuario entra/sale, se cambia `isHovered` para
 *     animar el tamaño del círculo (de 0 a 150px) y mostrar/ocultar
 *     el mensaje "Hover to scan".
 * 4. Un pequeño círculo blanco con `mix-blend-difference` sigue al
 *     cursor como un punto de luz.
 */
export default function XRayText() {
    // Referencia al <section> contenedor.
    // La necesitamos para calcular coordenadas relativas del cursor
    // (porque clientX/clientY son respecto al viewport, no al elemento).
    const containerRef = useRef<HTMLDivElement>(null);

    // Posición del cursor relativa al contenedor (en píxeles).
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // ¿El cursor/touch está dentro del componente?
    // Controla el tamaño del clip-path y la visibilidad del mensaje
    // y del indicador de luz.
    const [isHovered, setIsHovered] = useState(false);

    /**
     * Handler para mousemove en desktop.
     * Convierte clientX/clientY (viewport) a coordenadas relativas al
       contenedor y las guarda en estado.
     */
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return; // safety: el ref aún no está listo
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left, // x dentro del contenedor
            y: e.clientY - rect.top,  // y dentro del contenedor
        });
    };

    /**
     * Handler para touchmove en móvil.
     * Misma lógica que mousemove, pero leyendo `e.touches[0]` (el primer * dedo). También fuerza `isHovered = true` mientras hay contacto,
     * ya que en touch no existen los equivalentes a mouseenter.
     */
    const handleTouchMove = (e: React.TouchEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const touch = e.touches[0]; // primer punto de contacto
        setMousePos({
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top,
        });
        setIsHovered(true);
    };

    return (
        // Contenedor principal: sección a pantalla parcial (40vh móvil, 60vh desktop).
        // - cursor-none: oculta el cursor nativo (el "puntito blanco" hace de cursor).
        // - overflow-hidden: evita que el gradiente o el clip-path se salga.
        // - bg-black + flex center: centra vertical y horizontalmente el texto.
        <section
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => setIsHovered(false)}
            className="relative w-full h-[40vh] md:h-[60vh] bg-black flex items-center justify-center overflow-hidden cursor-none"
        >
            {/* ────────────────────────────────────────────────────────── CAPA 1: Texto de fondo
          Mismo texto "Innovation" pero en blanco casi transparente
          (text-white/10). Sirve como "silueta" que el efecto X-Ray
          va a ir revelando. select-none evita que el usuario lo
          seleccione al arrastrar.
         ────────────────────────────────────────────────────────── */}
            <h2 className="text-[12vw] font-black tracking-tighter leading-none select-none text-white/10 uppercase">
                Innovation
            </h2>

            {/* ──────────────────────────────────────────────────────────
          CAPA 2: Capa "rayos X" (la que se revela con el cursor)
          - absolute inset-0: cubre todo el contenedor.
          - pointer-events-none: NO bloquea el mouse, deja pasar los
            // eventos al<section> para seguir trackeando.
          - z-10: por encima del texto de fondo.
          - clipPath animado: un círculo centrado en (mousePos.x, mousePos.y)
            cuyo radio cambia entre 0px (oculto) y 150px (revelado)
            según isHovered. Esto produce el efecto de "linterna".
         ────────────────────────────────────────────────────────── */}
            <motion.div
                className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center bg-black"
                style={{
                    clipPath: `circle(${isHovered ? "150px" : "0px"} at ${mousePos.x}px ${mousePos.y}px)`,
                }}
            >
                {/* Mismo texto, pero con gradiente morado → rosa → naranja.
            bg-clip-text + text-transparent hace que el degradado
            rellene solo el contorno de los caracteres. */}
                <h2 className="text-[12vw] font-black tracking-tighter leading-none select-none uppercase bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                    Innovation
                </h2>
            </motion.div>

            {/* ──────────────────────────────────────────────────────────
          MENSAJE "Hover to scan"
          Solo visible cuando NO hay hover (sirve como invitación).
          - initial/animate con framer-motion para un fade-in al montar.
          - animate-pulse (Tailwind) para un pulso suave continuo.
         ────────────────────────────────────────────────────────── */}
            {!isHovered && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute bottom-10 text-white/30 font-mono text-xs uppercase tracking-[0.3em] animate-pulse"
                >
                    Hover to scan
                </motion.div>
            )}

            {/* ──────────────────────────────────────────────────────────
          INDICADOR DE LUZ (el puntito blanco que sigue al cursor)
          - blur-sm: glow suave.
          - mix-blend-difference: invierte el color según el fondo,
            creando un efecto tipo "negativo fotográfico".
          - z-20: por encima de todo.
          - animate: framer-motion interpola x, y y scale usando la
            posición del mouse. El -8 es para centrar el punto de 16px
            (w-4 h-4) en la posición exacta del cursor.
          - Cuando NO hay hover, scale: 0 (se oculta).
          - transition spring: damping alto + stiffness medio = sigue
            al cursor de forma suave pero sin lag excesivo.
         ────────────────────────────────────────────────────────── */}
            <motion.div
                className="absolute w-4 h-4 bg-white rounded-full blur-sm pointer-events-none z-20 mix-blend-difference"
                animate={{
                    x: mousePos.x - 8,
                    y: mousePos.y - 8,
                    scale: isHovered ? 1 : 0,
                }}
                transition={{ type: "spring", damping: 30, stiffness: 200 }}
            />
        </section>
    );
}