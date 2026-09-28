"use client";

import React, { useEffect } from "react";
import Lenis from "lenis";

/**
 * Componente contenedor que activa el scroll suave (smooth scroll) en toda la aplicación mediante la librería Lenis. 
 * Crea una instancia de Lenis al montarse, la mantiene sincronizada con el ciclo de animación del navegador 
 * y la destruye al desmontarse.
 * 
 * Funcionamiento
 *  1º Montaje: el useEffect con array de dependencias vacío se ejecuta una sola vez en el cliente y crea la instancia de Lenis.
 *  2º Bucle de animación: la función raf llama a lenis.raf(time) en cada fotograma y se reprograma con requestAnimationFrame. Lenis necesita este bucle para calcular y aplicar la posición interpolada del scroll.
 *  3º Desmontaje: la función de limpieza llama a lenis.destroy(), que elimina los listeners y restaura el comportamiento de scroll nativo.
 *  4º Render: el componente devuelve children sin modificarlos.
 */

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({                                     // Instancia de lenis
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.2,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time: number) {                                  // Bucle de animación
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();                                            // Limpia la instancia de lenis
    };
  }, []);

  return <>{children}</>;                                         // Renderiza los hijos sin modificarlos
}