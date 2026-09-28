"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "./ThemeContext";

/**
 * Componente de Efecto CRT / Scanlines (Líneas de Escaneo).
 * 
 * Superpone una capa visual que simula un monitor CRT antiguo, añadiendo 
 * líneas de escaneo horizontales, un ligero parpadeo (flicker) y ruido 
 * estático analógico. 
 * 
 * Características clave:
 * - Rendimiento optimizado: Usa solo CSS gradients y opacidad, evitando 
 *   animaciones costosas de JavaScript o canvas.
 * - No intrusivo: `pointer-events-none` asegura que la UI subyacente siga 
 *   siendo 100% interactiva.
 * - Cero dependencias externas: El ruido SVG está codificado en base64/Data URI.
 * - Z-Index estratégico: Se coloca en z-[9998], por debajo del menú contextual 
 *   (10000) y del loader (100000), pero por encima del contenido normal.
 */
export default function Scanlines() {
  // NOTA ARQUITECTÓNICA: En lugar de usar estado local, lo ideal es leer 
  // esto del ThemeContext: const { settings } = useTheme();
  // const isActive = settings.scanlines;
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Atajo: Ctrl+S o Cmd+S. 
      // ADVERTENCIA DE UX: Esto sobrescribe el atajo nativo del navegador 
      // "Guardar página como". Considera usar Ctrl+Shift+S para evitar 
      // frustrar a usuarios que intentan guardar la web.
      if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsActive(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Renderizado condicional: Si está desactivado, no existe en el DOM (ahorro de recursos).
  if (!isActive) return null;

  return (
    // Contenedor principal fijo que cubre toda la pantalla.
    // opacity-[0.03]: Mantiene el efecto extremadamente sutil. Subirlo a 0.1+ 
    // puede hacer que el texto sea difícil de leer.
    <div className="fixed inset-0 z-[9998] pointer-events-none overflow-hidden opacity-[0.03]">

      {/* CAPA 1: Patrón de Líneas de Escaneo (Scanlines) y Shift RGB */}
      <div
        className="absolute inset-0"
        style={{
          // Gradiente 1: Líneas horizontales. Transparente el 50% superior, 
          // negro semitransparente el 50% inferior. Se repite cada 2px de altura.
          // Gradiente 2: Simula la separación de subpíxeles RGB de un monitor CRT.
          // Se repite cada 3px de ancho.
          background: `
            linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%),
            linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))
          `,
          backgroundSize: "100% 2px, 3px 100%"
        }}
      />

      {/* CAPA 2: Efecto de Parpadeo (Flicker) */}
      {/* Simula la inestabilidad del voltaje en monitores antiguos. 
          animate-pulse de Tailwind es suficiente y está optimizado por CSS. */}
      <div className="absolute inset-0 animate-pulse bg-white/5" />

      {/* CAPA 3: Ruido Estático (Static Noise) */}
      {/* MEJORA CRÍTICA: Reemplazada la URL externa por un Data URI inline.
          Esto garantiza que el efecto funcione siempre, sin depender de 
          vercel.app, y evita una petición de red adicional. */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
}