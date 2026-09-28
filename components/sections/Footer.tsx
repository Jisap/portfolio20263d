"use client";

// ============================================================================
// Footer.tsx
// ----------------------------------------------------------------------------
// Componente de pie de página / sección de contacto del portfolio.
//
// Qué hace:
// - Muestra el CTA gigante "LET'S TALK." con animación letra por letra.
// - Muestra email de contacto, botón de descarga de CV y redes sociales.
// - Muestra barra inferior de estado (System_Online + hora local de Kolkata).
// - Renderiza el fondo de partículas y el botón DestructButton.
//
// Dependencias:
// - framer-motion: animaciones de entrada (whileInView).
// - lucide-react: iconos de redes sociales y acciones.
// - ./ParticleFooter: canvas de partículas de fondo.
// - ./DestructButton: easter-egg / acción final del footer.
// - Clases globales `bg-background`, `text-foreground`, `glass`, `interactive`
//   (vienen del sistema de tema / CSS del proyecto).
// ============================================================================

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    X, Briefcase, Camera, Share2, Hash, Code, Mail,
    ArrowRight, Download, Globe
} from "lucide-react";
import DestructButton from "./DestructButton";
import ParticleFooter from "./ParticleFooter";

// Texto del titular principal. Se divide por caracteres más abajo para
// animar cada letra con un `delay` escalonado.
const titleText = "LET'S TALK.";

/**
 * Footer — sección final de contacto (`<footer id="contact">`).
 *
 * Estructura:
 * 1. Fondo: `ParticleFooter` + glow radial inferior.
 * 2. Contenido principal: titular + email + CV (izquierda) y redes (derecha).
 * 3. Barra inferior: estado del sistema + hora + copyright.
 * 4. `DestructButton` al final.
 *
 * @returns JSX del pie de página de contacto.
 */
export default function Footer() {
    // Hora actual formateada para Asia/Kolkata. Se actualiza cada segundo.
    // Inicia como string vacío para evitar mismatch de hidratación.
    const [time, setTime] = useState("");

    // Reloj en vivo:
    // - Calcula la hora con `toLocaleTimeString` forzando timeZone Kolkata.
    // - Crea un intervalo de 1s y lo limpia al desmontar (evita fugas).
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        // `id="contact"` permite anclar navegación (ej. href="#contact").
        // `min-h-[80vh]` hace que el footer ocupe casi toda la pantalla como cierre.
        <footer id="contact" className="relative w-full bg-background py-32 px-6 md:px-20 overflow-hidden text-foreground flex flex-col justify-between min-h-[80vh]">
            {/* Fondo animado de partículas (canvas absoluto detrás del contenido). */}
            <ParticleFooter />

            {/* Resplandor elíptico inferior: luz tenue centrada, sin interacción. */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-foreground/5 blur-[150px] rounded-t-[100%] pointer-events-none" />

            {/* Bloque principal: dos columnas en desktop, apilado en móvil. */}
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end flex-grow gap-20 md:gap-0">
                {/* Columna izquierda: titular + email + descarga CV. */}
                <div className="max-w-3xl">
                    {/* Titular animado letra por letra con efecto 3D (rotateX). */}
                    <h2 className="text-6xl md:text-[8rem] font-bold tracking-tighter leading-none mb-10 flex flex-wrap">
                        {titleText.split("").map((char, index) => (
                            <motion.span
                                key={index}
                                initial={{ opacity: 0, y: 50, rotateX: 90 }}
                                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                // `delay: index * 0.05` crea el efecto cascada.
                                transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
                                // Si el carácter es espacio, añade margen para no colapsarlo.
                                className={char === " " ? "mr-4 md:mr-8" : ""}
                            >
                                {char}
                            </motion.span>
                        ))}
                    </h2>

                    {/* Enlace de email con revelado tipo "wipe" vía clipPath. */}
                    <motion.a
                        initial={{ opacity: 0, clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)" }}
                        whileInView={{ opacity: 1, clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5, ease: "circOut" }}
                        href="mailto:coderjayanta@gmail.com"
                        className="inline-flex items-center gap-4 text-2xl md:text-4xl border-b border-foreground/30 pb-2 hover:border-foreground transition-colors interactive group w-max"
                    >
                        coderjayanta@gmail.com
                        {/* Flecha que se desplaza a la derecha en hover (group-hover). */}
                        <span className="group-hover:translate-x-2 transition-transform"><ArrowRight size={32} /></span>
                    </motion.a>

                    {/* Botón de descarga del CV en PDF (archivo en /public). */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                        className="mt-12"
                    >
                        <a
                            href="/JayantaMondalResume.pdf"
                            download="JayantaMondalResume.pdf"
                            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-foreground text-background font-bold uppercase tracking-widest rounded-full hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-foreground/20"
                        >
                            Download CV
                            <Download size={20} />
                        </a>
                    </motion.div>
                </div>

                {/* Columna derecha: lista de redes sociales con entrada desde la derecha. */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="flex flex-col gap-6 md:text-right"
                >
                    {/* Array inline de links: nombre + URL externa + icono lucide. */}
                    {[
                        { name: "LinkedIn", url: "https://www.linkedin.com/in/jayanta-mondal-44a5473a2", icon: <Briefcase size={18} /> },
                        { name: "Twitter", url: "https://x.com/JayantaCodes", icon: <X size={18} /> },
                        { name: "Instagram", url: "https://www.instagram.com/JayantaCodes", icon: <Camera size={18} /> },
                        { name: "Threads", url: "https://www.threads.net/@JayantaCodes", icon: <Hash size={18} /> },
                        { name: "Facebook", url: "https://www.facebook.com/JayantaCodes", icon: <Share2 size={18} /> },
                        { name: "Github", url: "https://github.com/jayantacodes", icon: <Code size={18} /> }
                    ].map((link, i) => (
                        <a
                            key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center md:justify-end gap-3 text-foreground/60 hover:text-foreground transition-all group interactive"
                        >
                            <span className="text-sm font-mono uppercase tracking-widest">{link.name}</span>
                            {/* Icono tenue que se ilumina con `text-accent` en hover. */}
                            <span className="text-foreground/20 group-hover:text-accent transition-colors">{link.icon}</span>
                        </a>
                    ))}
                </motion.div>
            </div>

            {/* Barra inferior: píldora de estado + copyright, separada por borde superior. */}
            <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-center mt-32 pt-8 border-t border-foreground/10 text-foreground/40 text-sm gap-6 md:gap-0">
                {/* Píldora glass con indicador online y hora de Kolkata. */}
                <div className="flex items-center gap-6 glass px-6 py-3 rounded-full border border-foreground/10 relative z-20">
                    <div className="flex items-center gap-2">
                        {/* Punto verde con anillo pulsante (ping) = "sistema en línea". */}
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-widest">System_Online</span>
                    </div>
                    {/* Separador vertical fino. */}
                    <div className="w-[1px] h-4 bg-foreground/20"></div>
                    {/* Hora viva actualizada por el `useEffect` de arriba. */}
                    <div className="font-mono tracking-widest text-[10px] uppercase">
                        KOLKATA // {time}
                    </div>
                </div>

                {/* Copyright con año dinámico. */}
                <p className="relative z-20 text-[10px] font-mono uppercase tracking-widest">© {new Date().getFullYear()} Jayanta Mondal. All rights reserved.</p>
            </div>


            {/* Acción final / easter-egg: botón destructivo bajo la barra inferior. */}
            <div className="relative z-20">
                <DestructButton />
            </div>
        </footer>
    );
}
