"use client";

import React from "react";
import { motion, useScroll, useVelocity, useSpring, useTransform, useMotionValueEvent } from "framer-motion";

/**
 * Componente de Indicador de Progreso en Esquina (Corner Progress).
 * 
 * Muestra un anillo circular y un porcentaje que representa el progreso 
 * de scroll vertical de la página completa.
 * 
 * Mejoras arquitectónicas aplicadas:
 * 1. Actualización directa al DOM: Se utiliza una referencia al elemento `<span>` 
 *    y `useMotionValueEvent` para mutar `textContent` directamente sin re-renderizar 
 *    el componente en cada frame de scroll.
 * 2. strokeLinecap="round": Añadido para que el extremo del arco de progreso 
 *    sea redondeado, mejorando drásticamente la estética visual.
 * 3. Pointer Events: El contenedor principal es `pointer-events-none` para 
 *    no bloquear clics en el contenido inferior, pero el anillo es `pointer-events-auto` 
 *    para permitir el efecto hover.
 */
export function CornerProgress() {
    const { scrollYProgress } = useScroll();
    const percentRef = React.useRef<HTMLSpanElement>(null);

    // La circunferencia de un círculo con r=14 es 2 * π * 14 ≈ 87.96 (redondeado a 88).
    // Mapeamos el progreso de 0 a 1 para que el dashOffset vaya de 88 (vacío) a 0 (lleno).
    const dashOffset = useTransform(scrollYProgress, [0, 1], [88, 0]);

    // Actualiza el texto en tiempo real directamente en el DOM sin provocar re-renders de React
    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        if (percentRef.current) {
            percentRef.current.textContent = `${Math.round(latest * 100)}%`;
        }
    });

    React.useEffect(() => {
        if (percentRef.current) {
            percentRef.current.textContent = `${Math.round(scrollYProgress.get() * 100)}%`;
        }
    }, [scrollYProgress]);

    return (
        <div className="fixed bottom-8 left-8 z-[1000] flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity duration-300 pointer-events-none group">
            <div className="w-8 h-8 relative pointer-events-auto">
                <svg className="w-full h-full rotate-[-90deg]">
                    {/* Círculo de fondo (pista) */}
                    <circle
                        cx="16" cy="16" r="14"
                        fill="none" stroke="currentColor" strokeWidth="1.5"
                        className="text-foreground/10"
                    />
                    {/* Círculo de progreso animado */}
                    <motion.circle
                        cx="16" cy="16" r="14"
                        fill="none"
                        stroke="var(--accent, currentColor)"
                        strokeWidth="1.5"
                        strokeDasharray="88"
                        strokeLinecap="round" // Extremos redondeados para un acabado premium
                        style={{ strokeDashoffset: dashOffset }}
                    />
                </svg>
            </div>

            <div className="flex flex-col items-start">
                <span className="text-[8px] font-mono text-foreground/30 uppercase tracking-[0.2em]">OS_LOAD</span>
                <span ref={percentRef} className="text-xs font-bold text-foreground">
                    0%
                </span>
            </div>
        </div>
    );
}

/**
 * Componente de Medidor de Velocidad de Scroll (Scroll Gauge).
 * 
 * Muestra una barra vertical que se ilumina y crece proporcionalmente a la 
 * velocidad del scroll del usuario, creando un efecto visual de "inercia" o "velocidad".
 * 
 * Mejoras arquitectónicas aplicadas:
 * 1. Transformación Directa de Altura: Se reemplazó el cálculo con `Math.abs` 
 *    en el render por un mapeo directo en `useTransform` ([-2000, 0, 2000] -> ["100%", "0%", "100%"]).
 *    Esto es más limpio y evita ejecutar funciones callback en cada frame de animación.
 * 2. Ajuste de Sensibilidad: El rango de velocidad se ajustó a [-2000, 2000], 
 *    que es un valor más realista para un scroll rápido con rueda del ratón 
 *    o trackpad, haciendo que la animación sea más sensible y visible.
 * 3. Efecto de Resplandor: Añadido `shadow-[0_0_8px_var(--accent)]` a la barra 
 *    para que parezca un medidor de energía o neón cuando se activa.
 * 4. Accesibilidad: Se añadió `aria-hidden="true"` ya que es un elemento 
 *    puramente decorativo que no aporta información semántica crítica.
 */
export function ScrollGauge() {
    const { scrollY } = useScroll();

    // useVelocity calcula los píxeles por segundo que se desplaza el scroll
    const scrollVelocity = useVelocity(scrollY);

    // useSpring suaviza los picos bruscos de velocidad, dando una sensación de 
    // "peso" e inercia fluida en lugar de un medidor nervioso y tembloroso.
    const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });

    // Mapeamos la velocidad a un porcentaje de altura directamente.
    // -2000 (scroll rápido hacia arriba) -> 100% de altura
    // 0 (sin movimiento) -> 0% de altura
    // 2000 (scroll rápido hacia abajo) -> 100% de altura
    const heightPercent = useTransform(smoothVelocity, [-2000, 0, 2000], ["100%", "0%", "100%"]);

    return (
        <div
            className="fixed top-1/2 right-4 -translate-y-1/2 z-[999] hidden md:flex flex-col items-center gap-2 opacity-20 hover:opacity-100 transition-opacity duration-300 pointer-events-none group"
            aria-hidden="true"
        >
            <span className="text-[8px] font-mono text-foreground/40 uppercase tracking-[0.3em] [writing-mode:vertical-rl] rotate-180">
                V_METER
            </span>

            <div className="w-[2px] h-24 bg-foreground/5 rounded-full relative overflow-hidden">
                <motion.div
                    style={{ height: heightPercent }}
                    className="absolute bottom-0 w-full bg-accent rounded-full shadow-[0_0_8px_var(--accent)]"
                />
            </div>
        </div>
    );
}