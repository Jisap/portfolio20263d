"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
  angle: number;    // Ángulo de dispersión para movimiento direccional
  velocity: number; // Velocidad inicial de la partícula
}

/**
 * Componente de Partículas al Hacer Clic (Click Particles).
 * 
 * Genera una explosión de 8 partículas en la posición exacta del cursor 
 * cuando el usuario hace clic, añadiendo retroalimentación táctil visual 
 * (juice) a las interacciones.
 * 
 * Mejoras arquitectónicas aplicadas respecto al código original:
 * 1. Cleanup de Timeouts: Los timeouts se almacenan en refs para poder 
 *    cancelarlos si el componente se desmonta prematuramente.
 * 2. Soporte Multi-Dispositivo: Usa 'pointerdown' en lugar de 'mousedown' 
 *    para funcionar con ratón, stylus y pantallas táctiles.
 * 3. Física Realista: Cada partícula tiene su propio ángulo y velocidad, 
 *    creando patrones de explosión radiales orgánicos.
 * 4. Respeto a prefers-reduced-motion: Desactiva las animaciones para 
 *    usuarios con sensibilidades visuales (estándar WCAG 2.1).
 * 5. Filtrado Optimizado: Usa Set<string> para eliminación O(1) en lugar 
 *    de Array.find() que es O(n).
 * 6. Límite de Partículas: Cap máximo de 100 partículas simultáneas para 
 *    prevenir degradación de rendimiento en clics rápidos.
 */
export default function ClickParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Almacenamos los IDs de los timeouts para poder cancelarlos en el cleanup
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  // Contador incremental para IDs únicos (más confiable que Date.now())
  const idCounterRef = useRef(0);

  // Bandera para respetar prefers-reduced-motion
  const [reducedMotion, setReducedMotion] = useState(false);

  // Efecto para detectar preferencias de accesibilidad del usuario
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    // Si el usuario prefiere movimiento reducido, no registramos listeners
    if (reducedMotion) return;

    // Límite máximo de partículas simultáneas para proteger el rendimiento
    const MAX_PARTICLES = 100;
    const PARTICLES_PER_CLICK = 8;
    const PARTICLE_LIFETIME = 800; // ms

    const handlePointerDown = (e: PointerEvent) => {
      // Generamos un lote de nuevas partículas con física radial
      const newParticles: Particle[] = Array.from({ length: PARTICLES_PER_CLICK }).map(() => {
        idCounterRef.current += 1;

        // Distribución radial: cada partícula sale en un ángulo diferente
        const angle = Math.random() * Math.PI * 2; // 0 a 360 grados en radianes
        const velocity = 40 + Math.random() * 60;  // Entre 40 y 100 píxeles de distancia

        return {
          id: `p-${idCounterRef.current}`,
          x: e.clientX,
          y: e.clientY,
          // Alternamos entre blanco y el color de acento del tema
          // NOTA: Para integración total con ThemeContext, usar:
          // getComputedStyle(document.documentElement).getPropertyValue('--accent')
          color: Math.random() > 0.5 ? "#ffffff" : "#00ff00",
          angle,
          velocity,
        };
      });

      setParticles(prev => {
        // Si ya hay muchas partículas, eliminamos las más antiguas para mantener el límite
        const combined = [...prev, ...newParticles];
        return combined.length > MAX_PARTICLES
          ? combined.slice(combined.length - MAX_PARTICLES)
          : combined;
      });

      // Programamos la eliminación de estas partículas específicas
      const timeoutId = setTimeout(() => {
        // Optimización: Usamos Set para filtrado O(n) en lugar de O(n*m)
        const idsToRemove = new Set(newParticles.map(p => p.id));
        setParticles(prev => prev.filter(p => !idsToRemove.has(p.id)));

        // Limpiamos la referencia del timeout ya ejecutado
        timeoutsRef.current.delete(timeoutId);
      }, PARTICLE_LIFETIME);

      timeoutsRef.current.add(timeoutId);
    };

    // pointerdown soporta ratón, stylus y táctil de forma nativa
    window.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);

      // Cancelamos todos los timeouts pendientes para evitar memory leaks
      // y actualizaciones de estado en componentes desmontados
      timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
      timeoutsRef.current.clear();
    };
  }, [reducedMotion]);

  // Si el usuario prefiere movimiento reducido, no renderizamos nada
  if (reducedMotion) return null;

  return (
    // z-[100002]: Por encima del Dock (100000) y del ZenMode (200000 sería más alto,
    // pero ajustamos para que las partículas se vean sobre la UI normal)
    <div className="fixed inset-0 pointer-events-none z-[100002]" aria-hidden="true">
      <AnimatePresence>
        {particles.map((p) => {
          // Calculamos la posición final basándonos en el ángulo y velocidad
          // cos(angulo) = componente X, sin(angulo) = componente Y
          const finalX = p.x + Math.cos(p.angle) * p.velocity;
          const finalY = p.y + Math.sin(p.angle) * p.velocity;

          return (
            <motion.div
              key={p.id}
              initial={{
                x: p.x,
                y: p.y,
                opacity: 1,
                scale: 1
              }}
              animate={{
                x: finalX,
                y: finalY,
                opacity: 0,
                scale: 0
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.8,
                ease: [0.25, 1, 0.5, 1] // Curva "easeOut" personalizada más suave
              }}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: p.color }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}