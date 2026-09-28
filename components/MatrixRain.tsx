"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Componente de Efecto Visual "Matrix Rain" (Lluvia de Código).
 * 
 * Renderiza una animación de caracteres cayendo en un canvas HTML5, 
 * simulando el icónico efecto de la película "The Matrix".
 * 
 * Mejoras arquitectónicas aplicadas respecto al código original:
 * 1. requestAnimationFrame: Reemplaza setInterval para una animación fluida 
 *    a 60fps sincronizada con el refresco del monitor, ahorrando batería 
 *    cuando la pestaña no está activa.
 * 2. Soporte DPR (Device Pixel Ratio): Escala el canvas internamente para 
 *    garantizar nitidez en pantallas de alta densidad (Retina, 4K, móviles).
 * 3. Integración con CustomEvents: Escucha el evento 'trigger-matrix' 
 *    disparado por la Terminal, manteniendo el principio de bajo acoplamiento.
 * 4. Desactivación por clic: Permite al usuario cerrar el efecto inmediatamente.
 */
export default function MatrixRain() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | null>(null);
    const [isActive, setIsActive] = useState(false);

    // --- Efecto 1: Escucha del evento global de activación ---
    useEffect(() => {
        const handleMatrix = () => setIsActive(prev => !prev);

        // El componente <Terminal> dispara este evento cuando el usuario 
        // escribe el comando 'matrix-rain'. Esto evita acoplar los componentes.
        window.addEventListener("trigger-matrix", handleMatrix);

        return () => window.removeEventListener("trigger-matrix", handleMatrix);
    }, []);

    // --- Efecto 2: Lógica de renderizado del Canvas ---
    useEffect(() => {
        if (!isActive) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // 1. Configuración del Canvas con soporte para pantallas de alta densidad (DPR)
        // Sin esto, el canvas se vería borroso en móviles modernos y pantallas Retina.
        const dpr = window.devicePixelRatio || 1;

        const setupCanvas = () => {
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            ctx.scale(dpr, dpr); // Escalamos el contexto para dibujar en coordenadas CSS
        };

        setupCanvas();

        // 2. Configuración de la cuadrícula de caracteres
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()*&^%ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ"; // Añadidos Katakana para autenticidad
        const fontSize = 16;
        const columns = Math.floor(window.innerWidth / fontSize);

        // Array que guarda la posición Y (en "filas") de cada columna.
        // Inicializado en 1 para que todas empiecen cayendo desde arriba.
        const drops: number[] = Array(columns).fill(1);

        // 3. Función de dibujo (se ejecuta en cada frame)
        const draw = () => {
            // Efecto de "estela" (trail): En lugar de limpiar el canvas completamente,
            // dibujamos un rectángulo negro semitransparente sobre todo.
            // Esto hace que los caracteres anteriores se desvanezcan gradualmente.
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
            ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

            ctx.fillStyle = "#0F0"; // Verde Matrix clásico
            ctx.font = `${fontSize}px monospace`;

            // Dibujamos un carácter en cada columna
            for (let i = 0; i < drops.length; i++) {
                const text = characters.charAt(Math.floor(Math.random() * characters.length));
                const x = i * fontSize;
                const y = drops[i] * fontSize;

                ctx.fillText(text, x, y);

                // Lógica de reinicio: Si la columna llega al final Y hay un 2.5% de probabilidad,
                // la reiniciamos al principio para crear variabilidad en la lluvia.
                if (y > window.innerHeight && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }

            // Solicitamos el siguiente frame al navegador
            animationFrameRef.current = requestAnimationFrame(draw);
        };

        // Iniciamos el bucle de animación
        animationFrameRef.current = requestAnimationFrame(draw);

        // 4. Manejo de redimensionamiento de la ventana
        const handleResize = () => {
            setupCanvas();
            // Recalculamos las columnas tras el redimensionamiento
            const newColumns = Math.floor(window.innerWidth / fontSize);
            drops.length = newColumns;
            drops.fill(1);
        };

        window.addEventListener("resize", handleResize);

        // 5. Limpieza (Cleanup): Crucial para evitar fugas de memoria
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            window.removeEventListener("resize", handleResize);
        };
    }, [isActive]);

    // Renderizado condicional: Si no está activo, no existe en el DOM
    if (!isActive) return null;

    return (
        <canvas
            ref={canvasRef}
            // z-[100000]: Máxima prioridad, por encima de todo (incluso del PageLoader)
            // pointer-events-none: Permite ver el efecto sin bloquear clics...
            // ...PERO añadimos un onClick para que el usuario pueda cerrarlo haciendo clic en cualquier lado
            className="fixed inset-0 z-[100000] pointer-events-auto cursor-pointer opacity-60 bg-black/90"
            onClick={() => setIsActive(false)}
            aria-label="Matrix rain effect. Click to close."
        />
    );
}