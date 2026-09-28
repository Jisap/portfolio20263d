"use client";
// Directiva de Next.js: marca el archivo como Client Component.
// Necesario por hooks (useRef, useState, useEffect), animaciones de Framer Motion y listeners.

import React, { useRef, useState, useEffect } from "react";
// Hooks de React:
//   - useRef: referencia al <section> contenedor para vincular useScroll.
//   - useState: estado del modal (proyecto seleccionado) y del breakpoint responsive.
//   - useEffect: detectar el ancho de pantalla al montar el componente.

import { motion, useScroll, useTransform } from "framer-motion";
// Framer Motion:
//   - motion: componentes con capacidades de animación.
//   - useScroll: devuelve el progreso de scroll (0 a 1) relativo a un elemento objetivo.
//   - useTransform: mapea el progreso de scroll a valores CSS (translateX).

import ProjectModal from "./ProjectModal";
// Modal que se muestra al hacer clic en una tarjeta de proyecto.
// Recibe `project` y la función `onClose`.

// ─────────────────────────────────────────────────────────────────────────────
// DATA: lista estática de proyectos que se renderizan como tarjetas horizontales.
// Cada ítem contiene:
//   - id: identificador único para React keys.
//   - title: nombre visible del proyecto.
//   - description: descripción breve.
//   - color: color de acento para el halo de luz (glow).
//   - image: ruta de la imagen de portada.
//   - link: enlace a la demo o despliegue en vivo.
// ─────────────────────────────────────────────────────────────────────────────
const projects = [
    {
        id: 1,
        title: "GameGlide",
        description: "High-performance gaming interface with smooth interactions.",
        color: "#ff3e00",
        image: "/projects/img/8.png",
        link: "/projects/live/GameGlide/index.html",
    },
    {
        id: 2,
        title: "SocialBook",
        description: "A comprehensive social platform for connecting with peers.",
        color: "#00e5ff",
        image: "/projects/img/4.png",
        link: "/projects/live/SocialBook/index.html",
    },
    {
        id: 3,
        title: "Note App",
        description: "Elegant and efficient workspace for your thoughts.",
        color: "#ff00e5",
        image: "/projects/img/6.png",
        link: "/projects/live/Note App/index.html",
    },
    {
        id: 4,
        title: "Text to Voice",
        description: "High-fidelity AI voice synthesis for clear communication.",
        color: "#00ff88",
        image: "/projects/img/5.png",
        link: "/projects/live/Text To Voice/index.html",
    },
    {
        id: 5,
        title: "Weather App",
        description: "Hyper-accurate real-time weather analytics and forecasts.",
        color: "#ffffff",
        image: "/projects/img/2.png",
        link: "/projects/live/WeatherApp/index.html",
    },
];

/**
 * HorizontalProjects
 * ---------------------------------------------------------------------------
 * Sección que muestra los proyectos en formato de carrusel horizontal controlado por scroll:
 *
 *   - En DESKTOP: el <section> mide 400vh. Mientras el usuario hace scroll vertical,
 *     el contenedor interior (`position: sticky`) se traslada horizontalmente con
 *     `useScroll` + `useTransform`, creando el efecto de desplazamiento horizontal continuo.
 *
 *   - En MÓVIL (<768px): se renderiza como una lista vertical estándar (`flex-col`)
 *     sin animación horizontal para brindar una experiencia táctil natural y accesible.
 *
 * Al hacer clic en cualquier tarjeta, se abre `ProjectModal` con el detalle del proyecto.
 */
export default function HorizontalProjects() {
    // Referencia al <section> contenedor para calcular el progreso de scroll local.
    const targetRef = useRef<HTMLDivElement>(null);

    // Proyecto actualmente seleccionado (null = modal cerrado).
    const [selectedProject, setSelectedProject] = useState<any>(null);

    // Bandera para alternar entre layout horizontal (desktop) y vertical (móvil).
    const [isMobile, setIsMobile] = useState(false);

    // Detección de breakpoint responsive al montar.
    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 768px)");
        setIsMobile(mediaQuery.matches);

        const handleResize = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mediaQuery.addEventListener("change", handleResize);
        return () => mediaQuery.removeEventListener("change", handleResize);
    }, []);

    // Progreso de scroll de 0 a 1 dentro del contenedor de la sección.
    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    // Mapeo del progreso vertical a desplazamiento horizontal (translateX):
    //   - scrollYProgress = 0 -> x = "0%"   (inicio)
    //   - scrollYProgress = 1 -> x = "-80%" (desplazado a la izquierda)
    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-80%"]);

    return (
        // Contenedor principal: 400vh en desktop para el recorrido de scroll; h-auto en móvil.
        <section
            id="work"
            ref={targetRef}
            className={`relative ${isMobile ? "h-auto py-20" : "h-[400vh]"} bg-background`}
        >
            {/* Wrapper sticky: se fija en la parte superior en desktop durante el scroll */}
            <div
                className={`${isMobile
                    ? "relative"
                    : "sticky top-0 flex h-screen items-center"
                    } overflow-hidden`}
            >
                {/* Contenedor con animación horizontal en desktop o lista vertical en móvil */}
                <motion.div
                    style={{ x: isMobile ? 0 : x }}
                    className={`${isMobile
                        ? "flex flex-col px-6 gap-10"
                        : "flex gap-20 px-20"
                        }`}
                >
                    {/* Encabezado / Introducción a la izquierda del carrusel */}
                    <div
                        className={`flex flex-col justify-center ${isMobile ? "mb-10" : "h-[60vh] w-[400px]"
                            }`}
                    >
                        <h2 className="text-sm font-bold tracking-widest text-foreground/50 uppercase mb-4">
                            // Collection
                        </h2>
                        <h3
                            className={`${isMobile ? "text-5xl" : "text-7xl"
                                } font-black text-foreground leading-none uppercase tracking-tighter`}
                        >
                            Selected<br />
                            <span className="text-foreground/20 italic">Works</span>
                        </h3>
                        <p className="mt-8 text-foreground/40 max-w-[280px] font-mono text-xs uppercase tracking-widest">
                            A curated selection of digital experiments and high-end software
                            solutions.
                        </p>
                    </div>

                    {/* Renderizado de tarjetas de proyectos */}
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            onClick={() => setSelectedProject(project)}
                            className={`group relative ${isMobile ? "h-[50vh] w-full" : "h-[60vh] w-[80vw] md:w-[600px]"
                                } overflow-hidden rounded-2xl glass cursor-pointer flex-shrink-0`}
                        >
                            {/* Imagen de fondo con efecto zoom suave al hover */}
                            <div
                                className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-110"
                                style={{
                                    backgroundImage: `url(${project.image})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                }}
                            />

                            {/* Gradiente de superposición para contraste del texto */}
                            <div className="absolute inset-0 z-10 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />

                            {/* Información textual del proyecto */}
                            <div className="absolute bottom-10 left-10 z-20">
                                <h4 className="text-3xl font-bold text-foreground mb-2">
                                    {project.title}
                                </h4>
                                <p className="text-foreground/60 font-mono text-xs uppercase tracking-widest">
                                    {project.description}
                                </p>
                                <div className="mt-6 flex items-center gap-4 text-xs font-bold text-foreground/40 group-hover:text-foreground transition-colors">
                                    EXPLORE CASE STUDY <span>→</span>
                                </div>
                            </div>

                            {/* Halo difuso de luz (glow accent) basado en el color del proyecto */}
                            <div
                                className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 pointer-events-none transition-opacity group-hover:opacity-60"
                                style={{ backgroundColor: project.color }}
                            />
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Modal de detalle del proyecto seleccionado */}
            <ProjectModal
                project={selectedProject}
                onClose={() => setSelectedProject(null)}
            />
        </section>
    );
}