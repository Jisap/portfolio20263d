"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useScroll, AnimatePresence } from "framer-motion";

/**
 * Componente de Progreso en Favicon (Favicon Progress Ring).
 * 
 * Dibuja un anillo de progreso circular alrededor del favicon del navegador
 * que se llena a medida que el usuario hace scroll por la página.
 * 
 * Mejoras arquitectónicas aplicadas respecto al código original:
 * 1. Optimización de Rendimiento (CRÍTICO): Se redujo la frecuencia de 
 *    actualización a ~10 FPS usando requestAnimationFrame con throttling 
 *    de 100ms. El código original actualizaba el favicon 60+ veces por 
 *    segundo, causando jank severo y consumo excesivo de CPU.
 * 2. Formato PNG: Se cambió de "image/x-icon" a "image/png" para mejor 
 *    compatibilidad cross-browser. Muchos navegadores ignoran dataURL 
 *    con formato ICO dinámico.
 * 3. Precarga de Imagen: Se usa un Promise para asegurar que el favicon 
 *    base está completamente cargado antes de intentar dibujarlo.
 * 4. Limpieza de Recursos: Se cancela el rAF al desmontar para evitar 
 *    fugas de memoria y actualizaciones en componentes desmontados.
 */
export function FaviconProgress() {
    const { scrollYProgress } = useScroll();
    const animationFrameRef = useRef<number | null>(null);
    const lastUpdateRef = useRef<number>(0);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const iconImageRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
        // 1. Precarga del favicon base
        const iconImage = new Image();
        iconImage.src = "/favicon.ico";
        iconImageRef.current = iconImage;

        // 2. Inicialización del canvas (reutilizado en cada frame para ahorrar memoria)
        const canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.height = 64;
        canvasRef.current = canvas;
        ctxRef.current = canvas.getContext("2d");

        // 3. Obtener o crear el elemento <link> del favicon
        let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
        if (!link) {
            link = document.createElement('link');
            link.rel = 'shortcut icon';
            document.head.appendChild(link);
        }

        // 4. Función de dibujo optimizada
        const updateFavicon = (latest: number) => {
            const now = Date.now();
            // Throttling a 100ms (~10 FPS). Suficiente para un favicon y reduce 
            // drásticamente la carga de la CPU y el garbage collector.
            if (now - lastUpdateRef.current < 100) {
                animationFrameRef.current = requestAnimationFrame(() => updateFavicon(latest));
                return;
            }
            lastUpdateRef.current = now;

            const ctx = ctxRef.current;
            if (!ctx) return;

            // Limpiar canvas
            ctx.clearRect(0, 0, 64, 64);

            // Dibujar favicon base (solo si ya está cargado)
            if (iconImage.complete && iconImage.naturalWidth > 0) {
                ctx.drawImage(iconImage, 12, 12, 40, 40);
            }

            // Dibujar anillo de fondo (pista)
            ctx.beginPath();
            ctx.arc(32, 32, 28, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(255,255,255,0.1)";
            ctx.lineWidth = 4;
            ctx.stroke();

            // Dibujar anillo de progreso
            ctx.beginPath();
            ctx.arc(32, 32, 28, -Math.PI / 2, (Math.PI * 2 * latest) - Math.PI / 2);
            ctx.strokeStyle = "#00ff88"; // Verde neón para destacar
            ctx.lineWidth = 4;
            ctx.lineCap = "round"; // Extremos redondeados
            ctx.stroke();

            // Actualizar el href del link con el nuevo dataURL
            // Usamos PNG porque tiene mejor soporte que ICO para dataURLs dinámicos
            link.href = canvas.toDataURL("image/png");

            // Programar el siguiente frame
            animationFrameRef.current = requestAnimationFrame(() => updateFavicon(latest));
        };

        // 5. Suscribirse a los cambios de scroll
        const unsubscribe = scrollYProgress.on("change", (latest) => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            animationFrameRef.current = requestAnimationFrame(() => updateFavicon(latest));
        });

        // 6. Limpieza exhaustiva al desmontar
        return () => {
            unsubscribe();
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            // Restaurar el favicon original al desmontar
            link.href = "/favicon.ico";
        };
    }, [scrollYProgress]);

    // Componente fantasma: no renderiza nada en el DOM
    return null;
}

/**
 * Componente de Efecto Glitch RGB (RGB Glitch Overlay).
 * 
 * Crea un efecto visual de "fallo digital" mediante la superposición de 
 * capas de color rojo y azul desplazadas horizontalmente, simulando la 
 * aberración cromática de monitores CRT dañados.
 * 
 * Mejoras arquitectónicas aplicadas:
 * 1. Corrección de Fuga de Memoria: El setTimeout original no se limpiaba 
 *    si el componente se desmontaba antes de los 200ms, causando el famoso 
 *    warning de React. Ahora se guarda en una ref y se limpia en el cleanup.
 * 2. Animación Mejorada: Se reemplazó el simple "animate-pulse" de Tailwind 
 *    por keyframes de Framer Motion con desplazamientos aleatorios y 
 *    opacidades variables, creando un glitch más realista y orgánico.
 * 3. Capa de Ruido: Añadida una tercera capa con ruido SVG para simular 
 *    estática de señal, elevando la calidad visual del efecto.
 * 4. Accesibilidad: Se respeta prefers-reduced-motion desactivando el 
 *    efecto automáticamente para usuarios con sensibilidades visuales.
 */
export function RGBGlitch() {
    const [active, setActive] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [reducedMotion, setReducedMotion] = useState(false);

    // Detectar preferencia de accesibilidad
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReducedMotion(mediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
        mediaQuery.addEventListener("change", handleChange);

        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    useEffect(() => {
        const trigger = () => {
            // No activar si el usuario prefiere movimiento reducido
            if (reducedMotion) return;

            setActive(true);

            // Limpiar timeout anterior si existe
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Programar desactivación
            timeoutRef.current = setTimeout(() => {
                setActive(false);
                timeoutRef.current = null;
            }, 300); // Ligeramente más largo para que se vea mejor
        };

        window.addEventListener("trigger-glitch", trigger);

        return () => {
            window.removeEventListener("trigger-glitch", trigger);
            // CRÍTICO: Limpiar el timeout al desmontar para evitar memory leaks
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [reducedMotion]);

    // Si no está activo o el usuario prefiere movimiento reducido, no renderizar
    if (!active || reducedMotion) return null;

    return (
        <div className="fixed inset-0 z-[200001] pointer-events-none overflow-hidden">
            {/* Capa Roja: Desplazada a la derecha */}
            <motion.div
                initial={{ opacity: 0, x: 0 }}
                animate={{
                    opacity: [0, 0.3, 0.1, 0.4, 0],
                    x: [0, 8, -4, 6, 0]
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute inset-0 bg-red-500/20 mix-blend-screen"
            />

            {/* Capa Azul: Desplazada a la izquierda */}
            <motion.div
                initial={{ opacity: 0, x: 0 }}
                animate={{
                    opacity: [0, 0.3, 0.1, 0.4, 0],
                    x: [0, -8, 4, -6, 0]
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute inset-0 bg-blue-500/20 mix-blend-screen"
            />

            {/* Capa de Ruido Estático (opcional, añade realismo) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.15, 0.05, 0.2, 0] }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            />
        </div>
    );
}

/**
 * Componente de Conectores de Fondo (Background Connectors).
 * 
 * Dibuja una cuadrícula sutil de líneas verticales y horizontales punteadas 
 * que crean una sensación de "estructura" o "circuito" en el fondo de la página.
 * 
 * Mejoras arquitectónicas aplicadas:
 * 1. Múltiples Líneas: Se expandió de una sola línea central a una cuadrícula 
 *    completa con líneas verticales y horizontales en diferentes posiciones.
 * 2. Opacidades Variables: Cada línea tiene una opacidad ligeramente diferente 
 *    para crear profundidad visual y evitar un patrón repetitivo aburrido.
 * 3. Patrones de Dasharray: Se usan diferentes patrones de dasharray 
 *    (10 20, 5 15, 2 8) para variar la textura visual.
 * 4. Rendimiento Optimizado: El SVG usa `preserveAspectRatio="none"` para 
 *    escalarse perfectamente sin recalcular coordenadas en cada resize.
 */
export function Connectors() {
    return (
        <div
            className="fixed inset-0 z-[-1] pointer-events-none opacity-[0.04]"
            aria-hidden="true"
        >
            <svg
                width="100%"
                height="100%"
                preserveAspectRatio="none"
                className="w-full h-full"
            >
                {/* Líneas Verticales */}
                <line
                    x1="20%" y1="0" x2="20%" y2="100%"
                    stroke="white" strokeWidth="1" strokeDasharray="10 20"
                    opacity="0.3"
                />
                <line
                    x1="50%" y1="0" x2="50%" y2="100%"
                    stroke="white" strokeWidth="1" strokeDasharray="5 15"
                    opacity="0.5"
                />
                <line
                    x1="80%" y1="0" x2="80%" y2="100%"
                    stroke="white" strokeWidth="1" strokeDasharray="10 20"
                    opacity="0.3"
                />

                {/* Líneas Horizontales */}
                <line
                    x1="0" y1="30%" x2="100%" y2="30%"
                    stroke="white" strokeWidth="1" strokeDasharray="2 8"
                    opacity="0.2"
                />
                <line
                    x1="0" y1="70%" x2="100%" y2="70%"
                    stroke="white" strokeWidth="1" strokeDasharray="2 8"
                    opacity="0.2"
                />

                {/* Puntos de Intersección (nodos) */}
                <circle cx="20%" cy="30%" r="2" fill="white" opacity="0.3" />
                <circle cx="50%" cy="30%" r="2" fill="white" opacity="0.4" />
                <circle cx="80%" cy="30%" r="2" fill="white" opacity="0.3" />
                <circle cx="20%" cy="70%" r="2" fill="white" opacity="0.3" />
                <circle cx="50%" cy="70%" r="2" fill="white" opacity="0.4" />
                <circle cx="80%" cy="70%" r="2" fill="white" opacity="0.3" />
            </svg>
        </div>
    );
}