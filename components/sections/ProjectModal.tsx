"use client";
// 👆 Next.js: marca el archivo como Client Component.
// Necesario por AnimatePresence (manipula el DOM tras mount),
// el icono X y los handlers onClick que usan estado del padre.

import React from "react";
// 👆 React es suficiente: este componente NO usa hooks propios,
// todo el estado del modal vive en el padre (HorizontalProjects).

import { motion, AnimatePresence } from "framer-motion";
// 👆 - motion: componente animable (lo usamos para el overlay y la card).
//   - AnimatePresence: habilita animaciones de SALIDA (exit) cuando
//     el elemento se desmonta. Sin esto, al poner project = null
//     React quitaría la modal de golpe y no verías el fade-out.

import { X } from "lucide-react";
// 👆 Icono de cierre (la "X" en la esquina superior derecha).
// lucide-react es una colección de iconos SVG tree-shakeable.

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// - Project: la forma que debe tener cualquier objeto de proyecto.
//   Coincide con los items del array `projects` en HorizontalProjects.tsx.
// - ProjectModalProps: lo que el padre le pasa al modal:
//   · project: Project | null  → si es null, el modal no se renderiza.
//   · onClose: () => void      → callback para cerrar (limpia el state).
// ─────────────────────────────────────────────────────────────────────────────
interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  color: string;
  link: string;
}

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

/**
 * ProjectModal
 * ---------------------------------------------------------------------------
 * Modal centrado que muestra el detalle de un proyecto al hacer click
 * sobre una card en `HorizontalProjects`.
 *
 * Cómo funciona:
 * - El componente SIEMPRE está montado (lo decide el padre).
 * - Si `project` es `null`, no renderiza nada gracias a `{project && (...)}`.
 * - Cuando `project` pasa de null → objeto, AnimatePresence detecta la
 *   entrada y aplica initial/animate.
 * - Cuando `project` pasa de objeto → null, AnimatePresence detecta la
 *   salida, aplica `exit` y luego desmonta.
 *
 * Estructura visual:
 * - Overlay (z-100000): fondo negro semi-transparente con blur.
 *   Cubre toda la pantalla y cierra el modal al hacer click.
 * - Card (z-100001): cuadro centrado con grid 2 columnas:
 *   · Izquierda: imagen del proyecto.
 *   · Derecha: título, descripción, tag y CTA "View Live Site".
 */
export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  return (
    // AnimatePresence escucha el mount/unmount de sus hijos.
    // Solo renderizamos algo si hay un proyecto seleccionado.
    <AnimatePresence>
      {project && (
        // Fragment (<>): agrupamos overlay + card sin meter un <div>
        // extra,
        // porque ambos son fixed y se posicionan independientes.
        <>
          {/* ─────────────────────────────────────────────────────────────
              OVERLAY
              - fixed inset-0: cubre toda la pantalla.
              - z-[100000]: capa alta pero MENOR que la card (100001)
                para que la card quede por encima.
              - bg-black/80 + backdrop-blur-md: oscurece + difumina
                lo que hay detrás (efecto "vidrio esmerilado").
              - onClick={onClose}: click en el overlay cierra el modal.
              - cursor-pointer: feedback visual de que el overlay es clickeable.
              - Animación: fade in/out puro (opacity 0 ↔ 1).
             ───────────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* ─────────────────────────────────────────────────────────────
              CARD CENTRADA
              - top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2:
                truco clásico de centrado absoluto (top:50% + transform: -50%).
              - z-[100001]: por encima del overlay.
              - w-[90vw] max-w-4xl: ancho responsivo, tope en 4xl (≈896px).
              - bg-[#121212] + border-white/10 + rounded-2xl: estilo
                "tarjeta oscura" consistente con el resto del portfolio.
              - Animación: combina fade (opacity), escala y leve slide-up
                para que entre/salga con un feel suave y "premium".
             ───────────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100001] w-[90vw] max-w-4xl bg-[#121212] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Grid 2 columnas en desktop, 1 columna en móvil. */}
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* ─────────────────────────────────────────────────────────
                  COLUMNA IZQUIERDA: imagen
                  - aspect-video en móvil / aspect-auto en desktop (se estira
                    para acompañar el alto de la columna derecha).
                  - object-cover: la imagen llena el contenedor sin deformarse.
                  - Gradiente inferior para que, si la imagen es muy clara,
                    el borde inferior se funda con el fondo de la card.
                 ───────────────────────────────────────────────────────── */}
              <div className="relative aspect-video md:aspect-auto">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />

              </div>



              {/* ─────────────────────────────────────────────────────────
                  COLUMNA DERECHA: contenido textual
                  - flex-col justify-center: texto verticalmente centrado.
                  - p-8 en móvil / p-12 en desktop.
                 ───────────────────────────────────────────────────────── */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                {/* Botón cerrar (X):
                    - absolute top-6 right-6: esquina superior derecha
                      del CONTENEDOR PADRE (la card), no de esta columna.
                      Funciona porque `relative` lo hereda el grid, y el
                      botón se posiciona respecto a él.
                    - hover:text-white: ilumina la X al pasar el mouse. */}
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>

                {/* Título del proyecto */}
                <h3 className="text-4xl font-bold text-white mb-4">
                  {project.title}
                </h3>

                {/* Descripción */}
                <p className="text-white/60 text-lg leading-relaxed mb-8">
                  {project.description}
                </p>

                {/* Tag decorativo "Live Demo":
                    Solo informativo, sin onClick. Sirve para indicar
                    visualmente que la card es interactiva. */}
                <div className="flex gap-4">
                  <div className="px-4 py-2 rounded-full border border-white/10 text-xs font-mono text-white/40 uppercase tracking-widest">
                    Live Demo

                  </div>


                </div>

                {/* CTA principal: link al demo en vivo.
                    - target="_blank": abre en pestaña nueva.
                    - rel="noopener noreferrer": buena práctica de seguridad
                      y privacidad cuando abres enlaces externos con
                      target=_blank (evita acceso a window.opener y oculta
                      el referrer).
                    - bg-white text-black: contraste alto, destaca como botón
                      principal de la card. */}
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-10 px-8 py-3 bg-white text-black text-center font-bold rounded-full hover:bg-white/90 transition-colors"
                >
                  View Live Site
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}