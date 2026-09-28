"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Briefcase, User, Mail, Volume2, VolumeX, Terminal, Search } from "lucide-react";
import { useAudio } from "../providers/AudioManager";

/**
 * Componente de Menú Contextual Personalizado (Right-Click Menu).
 * 
 * Intercepta el menú contextual nativo del navegador para ofrecer una experiencia 
 * de "Sistema Operativo" (Jayanta OS). Proporciona navegación rápida y controles 
 * globales desde cualquier punto de la pantalla.
 * 
 * Mejoras arquitectónicas aplicadas:
 * - Lógica de "Click Outside": Solo se cierra si el clic ocurre fuera del menú.
 * - Boundary Check (Límites de pantalla): Evita que el menú se renderice fuera 
 *   de la ventana visible si el usuario hace clic derecho en los bordes.
 * - Accesibilidad (a11y): Atributos ARIA (role="menu", role="menuitem") para 
 *   lectores de pantalla.
 * - Origen de animación: Escala desde la esquina superior izquierda (cursor) 
 *   para una sensación orgánica de aparición.
 */
export default function ContextMenu() {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Ref para detectar si un clic ocurre dentro o fuera del menú
  const menuRef = useRef<HTMLDivElement>(null);
  const { isMuted, toggleMute } = useAudio();

  // --- Efecto 1: Gestión de Eventos Globales ---
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Bloquea el menú contextual por defecto del navegador

      // Boundary Check: Calcula la posición para evitar que el menú se salga de la pantalla.
      // Restamos un margen estimado (200px ancho, 300px alto) al tamaño de la ventana.
      const menuWidth = 200;
      const menuHeight = 300;
      const x = Math.min(e.clientX, window.innerWidth - menuWidth);
      const y = Math.min(e.clientY, window.innerHeight - menuHeight);

      setPosition({ x, y });
      setIsVisible(true);
    };

    const handleClick = (e: MouseEvent) => {
      // Lógica de "Click Outside": Solo cerramos el menú si el clic NO ocurrió 
      // dentro del propio menú. Esto permite interactuar con los botones del menú 
      // sin que se cierre prematuramente antes de ejecutar la acción.
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsVisible(false);
      }
    };

    // Usamos 'true' (fase de captura) para el contextmenu para asegurarnos de 
    // interceptarlo antes que cualquier otro listener anidado en la aplicación.
    window.addEventListener("contextmenu", handleContextMenu, true);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu, true);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  // --- Definición de Acciones del Menú ---
  const menuItems = [
    { label: "Home", icon: <Home size={14} />, action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
    { label: "Work", icon: <Briefcase size={14} />, action: () => document.getElementById("work")?.scrollIntoView({ behavior: "smooth" }) },
    { label: "About", icon: <User size={14} />, action: () => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }) },
    { label: "Contact", icon: <Mail size={14} />, action: () => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }) },
    { label: isMuted ? "Unmute Audio" : "Mute Audio", icon: isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />, action: toggleMute },

    // Hack de simulación de teclado: Disparamos eventos de teclado sintéticos para 
    // activar los listeners globales que ya existen en los componentes <Terminal> y <CommandPalette>.
    // Esto evita duplicar lógica y mantiene el principio DRY (Don't Repeat Yourself).
    { label: "Open Terminal", icon: <Terminal size={14} />, action: () => window.dispatchEvent(new KeyboardEvent('keydown', { key: '`' })) },
    { label: "Command Palette", icon: <Search size={14} />, action: () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, metaKey: true })) },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={menuRef}
          // transformOrigin: "top left" es CRUCIAL. Hace que la animación de escala 
          // (de 0.9 a 1) parezca originarse exactamente desde la posición del cursor, 
          // no desde el centro del div, lo que mejora drásticamente la UX.
          style={{ top: position.y, left: position.x, transformOrigin: "top left" }}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.15, ease: "easeOut" }} // Transición rápida y nítida

          // Atributos de accesibilidad para menús personalizados
          role="menu"
          aria-label="Context menu"
          className="fixed z-[10000] min-w-[180px] bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden p-1"
        >
          {menuItems.map((item, index) => (
            <button
              key={index}
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation(); // Evita que el clic burbujee y cierre el menú inmediatamente
                item.action();
                setIsVisible(false);
              }}
              // Clases para feedback visual claro en hover y foco (accesibilidad por teclado)
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors group focus:outline-none focus:bg-white/10 focus:text-white"
            >
              <span className="text-white/40 group-hover:text-white transition-colors">
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}

          {/* Separador visual */}
          <div className="h-[1px] bg-white/10 my-1 mx-2" />

          {/* Pie de menú decorativo (Branding) */}
          <div className="px-3 py-2 text-[10px] font-mono text-white/30 uppercase tracking-widest select-none">
            Jayanta OS v3.0
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}