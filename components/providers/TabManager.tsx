"use client";

import { useEffect } from "react";

/**
 * Componente de Gestión de Pestaña (Tab Manager) con Page Visibility API.
 * 
 * Este componente "fantasma" (renderiza `null`) mejora la experiencia de usuario (UX) 
 * y actúa como un "Easter egg" cuando el usuario cambia a otra pestaña del navegador.
 * Manipula el objeto document del navegador:
 *  - Cambia el texto que ves en la pestaña del navegador (document.title = "(1) Miss you...").
 *  - Busca o crea una etiqueta <link> dentro del <head> de tu página y le cambia el atributo href para mostrar un punto rojo como favicon.
 * 
 * Características principales:
 * - Utiliza la Page Visibility API (`document.hidden`) para detectar cuando la 
 *   pestaña pierde o gana el foco.
 * - Implementa un "debounce" (retraso) de 1 segundo para evitar cambios bruscos 
 *   (flickering) si el usuario cambia de pestaña muy rápidamente.
 * - Manipula el DOM de forma segura para actualizar el título y el favicon 
 *   usando un SVG en Data URI (evita peticiones de red adicionales).
 * - Limpieza exhaustiva de listeners y timeouts para prevenir memory leaks.
 */
export default function TabManager() {
  useEffect(() => {
    // Estado local del efecto para persistir valores entre invocaciones del listener
    let originalTitle = document.title;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 1. PESTAÑA OCULTA: El usuario ha cambiado a otra pestaña o minimizado la ventana.

        // Protegemos el título original: solo lo guardamos si no es ya el mensaje de "ausencia",
        // evitando sobrescribirlo si el evento se dispara múltiples veces mientras está oculta.
        if (document.title !== "(1) Miss you...") {
          originalTitle = document.title;
        }

        // Retraso intencional (1000ms): Si el usuario vuelve antes de 1 segundo, 
        // el timeout se cancela (ver bloque 'else'), evitando un cambio de título 
        // innecesario y molesto (jarring) en cambios rápidos de pestaña.
        timeoutId = setTimeout(() => {
          document.title = "(1) Miss you...";

          // Actualización del Favicon: Usamos un SVG codificado en Data URI.
          // Ventaja: No requiere petición HTTP, se renderiza instantáneamente.
          let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");

          if (!link) {
            // Si no existe, lo creamos (fallback para algunas configuraciones de Next.js)
            link = document.createElement('link');
            link.rel = 'shortcut icon';
            link.type = 'image/svg+xml';
            document.head.appendChild(link);
          }

          // Círculo rojo simple codificado en URL para simular una notificación no leída
          link.href = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%23ff0000%22/></svg>';

        }, 1000);

      } else {
        // 2. PESTAÑA VISIBLE: El usuario ha regresado a la pestaña.

        // Cancelamos el timeout pendiente inmediatamente. Si el usuario volvió 
        // antes de 1 segundo, el título y el favicon nunca llegarán a cambiar.
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        // Restauramos el estado original de la pestaña
        document.title = originalTitle;

        // Restauramos el favicon por defecto de Next.js
        let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
        if (link) {
          link.href = '/favicon.ico'; // Ruta estándar de Next.js
        }
      }
    };

    // Registro del listener de la Page Visibility API
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Función de limpieza (Cleanup): Crucial para prevenir memory leaks 
    // y comportamientos fantasma si el componente se desmonta.
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      // Opcional pero recomendado: Restaurar el estado por defecto al desmontar
      // por si el componente se elimina mientras la pestaña está oculta.
      document.title = originalTitle;
    };
  }, []); // Array de dependencias vacío: el efecto se configura una sola vez al montar

  // No renderiza nada en el árbol visual del DOM.
  return null;
}