"use client";

import { useEffect } from "react";

/**
 * Componente de Arte en Consola (Console Art).
 * 
 * Este es un componente "fantasma" (renderiza `null`) cuyo único propósito es 
 * ejecutar un efecto secundario: imprimir un mensaje de bienvenida y arte ASCII 
 * en la consola del desarrollador del navegador.
 * 
 * Es una práctica común de branding y "easter egg" para desarrolladores curiosos 
 * que inspeccionan el código fuente del sitio ("Looking under the hood").
 * 
 * Características clave:
 * - Protección contra ejecución en el servidor (SSR guard).
 * - Prevención de duplicados en modo desarrollo (React 18 Strict Mode).
 * - Uso de formato `%c` de la consola para aplicar estilos CSS a la salida de texto.
 */
export default function ConsoleArt() {
    useEffect(() => {
        // 1. Protección SSR (Server-Side Rendering):
        // Next.js renderiza los componentes en el servidor primero, donde el objeto 
        // `window` no existe. Esta guardia evita errores de "window is not defined".
        if (typeof window === "undefined") return;

        // 2. Protección contra duplicados (Idempotencia):
        // En React 18+, cuando el Strict Mode está activado en desarrollo, los efectos 
        // se ejecutan dos veces (montaje -> desmontaje -> montaje). Esta bandera en el 
        // objeto global `window` garantiza que el mensaje solo se imprima una vez por 
        // sesión de carga, evitando ruido innecesario y duplicado en la consola.
        if ((window as any)._consoleArtLogged) return;
        (window as any)._consoleArtLogged = true;

        // Arte ASCII. Las barras invertidas y espacios deben mantenerse exactos para 
        // que la alineación visual sea correcta en la fuente monoespaciada de la consola.
        const ascii = `
      ██╗ █████╗ ██╗   ██╗███████╗███╗   ██╗████████╗ █████╗ 
      ██║██╔══██╗╚██╗ ██╔╝██╔════╝████╗  ██║╚══██╔══╝██╔══██╗
      ██║███████║ ╚████╔╝ █████╗  ██╔██╗ ██║   ██║   ███████║
 ██   ██║██╔══██║  ╚██╔╝  ██╔══╝  ██║╚██╗██║   ██║   ██╔══██║
 ╚█████╔╝██║  ██║   ██║   ███████╗██║ ╚████║   ██║   ██║  ██║
  ╚════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝
    `;

        // Cadenas de estilo CSS compatibles con la API de console.log del navegador.
        // Nota: No todas las propiedades CSS son soportadas en la consola, pero 
        // color, font-weight, font-family, font-size y padding funcionan en la mayoría.
        const style1 = "color: #00ff00; font-weight: bold; font-family: monospace;"; // Estilo "hacker/terminal" para el ASCII
        const style2 = "color: #fff; font-size: 14px; font-family: sans-serif;";     // Estilo limpio y legible para el email
        const style3 = "color: #00e5ff; font-size: 16px; font-weight: bold; padding: 10px 0;"; // Estilo destacado para el mensaje principal

        // El prefijo "%c" le indica a la consola del navegador que aplique la cadena 
        // de estilo proporcionada como segundo argumento a ese segmento específico del texto.
        console.log("%c" + ascii, style1);
        console.log("%cLooking under the hood? Let's build something amazing together.", style3);
        console.log("%cDrop me an email: hello@jayanta.dev", style2);

        // Tip adicional: Algunos navegadores (Chrome/Firefox) permiten enlaces clickeables 
        // en la consola usando formato %c con text-decoration: underline.
        // console.log("%cVisit: %chttps://jayanta.dev", "color: #fff;", "color: #00e5ff; text-decoration: underline; cursor: pointer;");

    }, []); // Array de dependencias vacío: el efecto solo se ejecuta una vez al montar el componente

    // Este componente no renderiza nada en el DOM. Actúa puramente como un contenedor 
    // limpio para aislar el hook `useEffect` y su lógica de efectos secundarios.
    return null;
}