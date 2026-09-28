"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Definición centralizada de las secciones. 
// Facilita la modificación del orden o adición de nuevas secciones en un solo lugar.
const sections = [
  { id: "hero", label: "Intro" },
  { id: "about", label: "Story" },
  { id: "work", label: "Work" },
  { id: "contact", label: "Contact" },
];

/**
 * Componente de Indicador de Scroll Lateral (Navigation Dots).
 * 
 * Muestra la sección actual de la página y permite la navegación rápida.
 * 
 * Mejoras arquitectónicas aplicadas respecto al código original:
 * 1. Intersection Observer: Reemplaza el listener de 'scroll'. Es mucho más 
 *    eficiente para la CPU, ya que el navegador gestiona las intersecciones 
 *    de forma asíncrona, evitando cálculos de 'getBoundingClientRect' en cada frame.
 * 2. Accesibilidad (a11y): Añadidos atributos ARIA (aria-current, aria-label) 
 *    para que los lectores de pantalla entiendan la navegación.
 * 3. Theming: Reemplazados los colores 'white' hardcodeados por variables 
 *    de tema ('foreground'/'accent') para respetar el ThemeContext.
 * 4. Estabilidad de layoutId: El motion.div del indicador ahora se renderiza 
 *    de forma más predecible para garantizar una animación fluida entre puntos.
 */
export default function ScrollIndicator() {
  const [activeSection, setActiveSection] = useState("hero");

  // --- Efecto 1: Detección de sección activa con Intersection Observer ---
  useEffect(() => {
    // Configuración del Observer:
    // rootMargin: "-45% 0px -45% 0px" crea una "zona de activación" horizontal 
    // muy delgada en el centro exacto de la pantalla (el 10% central).
    // Cuando una sección cruza esa línea central, se dispara el callback.
    const observerOptions = {
      root: null, // null significa el viewport del navegador
      rootMargin: "-45% 0px -45% 0px",
      threshold: 0, // Se dispara en el momento exacto en que el borde cruza la línea
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        // isIntersecting es true cuando el elemento entra en la zona central
        if (entry.isIntersecting && entry.target.id) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    // Observar cada sección definida en el array
    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    // Limpieza: desconectar el observer al desmontar el componente
    return () => {
      observer.disconnect();
    };
  }, []); // Array de dependencias vacío: el observer se configura una sola vez

  // --- Función de navegación suave ---
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // block: "start" asegura que la sección se alinee con la parte superior,
      // lo cual es consistente con la mayoría de diseños de landing pages.
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    // Oculto en móviles/tablets (hidden), visible solo en pantallas extra grandes (xl:flex)
    // para no obstruir el contenido en pantallas pequeñas.
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-8" role="navigation" aria-label="Page sections">
      {sections.map((section) => {
        const isActive = activeSection === section.id;

        return (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            // Accesibilidad: indica a los lectores de pantalla si este es el elemento actual
            aria-current={isActive ? "true" : "false"}
            aria-label={`Go to ${section.label} section`}
            className="group flex items-center gap-4 text-left focus:outline-none"
          >
            <div className="relative flex items-center justify-center w-4 h-4">
              {/* Punto central: Crece y cambia de color cuando está activo */}
              <div
                className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ease-out ${isActive ? "bg-foreground scale-100" : "bg-foreground/20 group-hover:bg-foreground/40"
                  }`}
              />

              {/* Anillo animado con Framer Motion */}
              {/* layoutId es la magia de Framer: anima automáticamente la posición 
                  de este elemento cuando se desmonta de un padre y se monta en otro. */}
              {isActive && (
                <motion.div
                  layoutId="active-section-indicator"
                  className="absolute w-4 h-4 border border-foreground/40 rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </div>

            {/* Etiqueta de texto: Aparece con un deslizamiento suave */}
            <span
              className={`text-[10px] font-mono uppercase tracking-[0.2em] transition-all duration-500 ease-out whitespace-nowrap ${isActive
                  ? "text-foreground opacity-100 translate-x-0"
                  : "text-foreground/40 opacity-0 -translate-x-4 group-hover:opacity-70 group-hover:-translate-x-2"
                }`}
            >
              {section.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}