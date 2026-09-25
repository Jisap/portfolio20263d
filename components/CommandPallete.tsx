"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "./AudioManager";
import { Search, Command, Briefcase, User, Mail, VolumeX, Volume2, Monitor } from "lucide-react";

/**
 * Componente de Paleta de Comandos (estilo Spotlight/Alfred).
 * 
 * Proporciona una interfaz rápida y accesible por teclado para navegar por 
 * las secciones principales del sitio, cambiar configuraciones (como el audio)
 * y activar efectos visuales.
 * 
 * Características principales:
 * - Atajo global `Cmd/Ctrl + K` para abrir/cerrar.
 * - Navegación completa por teclado (Flechas arriba/abajo, Enter, Escape).
 * - Navegación circular (wrapping): bajar desde el último elemento vuelve al primero.
 * - Sincronización entre hover del ratón y selección por teclado.
 * - Animaciones suaves de entrada y salida con Framer Motion.
 */
export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  // Índice del elemento actualmente resaltado (para navegación por teclado)
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const { isMuted, toggleMute } = useAudio();

  // Lista de acciones disponibles. 
  // Nota: Al estar dentro del componente, se recrea en cada render, lo cual es 
  // aceptable para listas pequeñas. Las funciones 'action' manipulan el DOM o 
  // el estado global directamente.
  const actions = [
    {
      id: "work",
      title: "Go to Selected Work",
      icon: <Briefcase size={16} />,
      action: () => document.getElementById("work")?.scrollIntoView({ behavior: "smooth" })
    },
    {
      id: "about",
      title: "Go to About",
      icon: <User size={16} />,
      action: () => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })
    },
    {
      id: "contact",
      title: "Go to Contact",
      icon: <Mail size={16} />,
      action: () => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
    },
    {
      id: "mute",
      title: isMuted ? "Unmute Audio" : "Mute Audio",
      icon: isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />,
      action: () => toggleMute()
    },
    {
      id: "matrix",
      title: "Run Matrix Theme",
      icon: <Monitor size={16} />,
      action: () => {
        // Efecto visual temporal: rota el matiz y satura los colores de toda la página
        document.documentElement.style.filter = "hue-rotate(90deg) saturate(200%)";
        setTimeout(() => { document.documentElement.style.filter = "none"; }, 5000);
      }
    },
  ];

  // Filtrado en tiempo real, insensible a mayúsculas/minúsculas
  const filteredActions = actions.filter((a) => a.title.toLowerCase().includes(query.toLowerCase()));

  // --- Efecto 1: Atajos de teclado globales ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detecta Cmd+K (Mac) o Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault(); // Evita que el navegador abra su propia barra de búsqueda
        setIsOpen((prev) => !prev);
      }
      // Escape cierra la paleta desde cualquier lugar
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // --- Efecto 2: Gestión del foco y reinicio de selección ---
  useEffect(() => {
    if (isOpen) {
      // Pequeño retraso para asegurar que el input existe en el DOM tras la animación de entrada
      setTimeout(() => inputRef.current?.focus(), 100);
      // Reinicia la selección al primer elemento cada vez que se abre o cambia la búsqueda
      setSelectedIndex(0);
    }
  }, [isOpen, query]);

  // --- Lógica de navegación interna por teclado ---
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Protección: si no hay resultados, ignorar navegación
    if (filteredActions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      // Operador módulo (%) para crear un bucle circular: 
      // si estás en el último, (last + 1) % length = 0 (vuelve al principio)
      setSelectedIndex((prev) => (prev + 1) % filteredActions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      // (prev - 1 + length) % length: Se suma 'length' antes del módulo para 
      // evitar números negativos en JavaScript, logrando un bucle circular hacia arriba.
      setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selectedAction = filteredActions[selectedIndex];
      if (selectedAction) {
        selectedAction.action();
        setIsOpen(false); // Cierra la paleta tras ejecutar la acción
      }
    }
  };

  return (
    // AnimatePresence permite que las animaciones de 'exit' se completen 
    // antes de desmontar los elementos del DOM.
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (Fondo oscurecido) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // z-[9999] asegura que esté por encima de casi todo, pero por debajo de la paleta (z-[10000])
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)} // Cierra al hacer clic fuera (patrón modal estándar)
          />

          {/* Contenedor principal de la Paleta */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }} // Animación con rebote sutil y rápido
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-[90%] max-w-[600px] z-[10000] bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Área de búsqueda */}
            <div className="flex items-center px-4 py-4 border-b border-white/10">
              <Search className="text-white/50 mr-3" size={20} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search..."
                // bg-transparent y outline-none para que se integre visualmente sin bordes nativos del navegador
                className="bg-transparent flex-1 outline-none text-lg text-white placeholder-white/30 font-medium"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
              {/* Indicador visual del atajo de teclado */}
              <div className="flex items-center gap-1 text-white/30 text-xs font-mono bg-white/5 px-2 py-1 rounded border border-white/5">
                <Command size={12} />
                <span>K</span>
              </div>
            </div>

            {/* Lista de resultados */}
            <div className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
              {filteredActions.length === 0 ? (
                <div className="py-8 text-center text-white/40 text-sm">No results found.</div>
              ) : (
                filteredActions.map((action, i) => (
                  <button
                    key={action.id}
                    onClick={() => {
                      action.action();
                      setIsOpen(false);
                    }}
                    // Sincroniza el estado de selección del teclado con el hover del ratón
                    onMouseEnter={() => setSelectedIndex(i)}
                    // Clases dinámicas: fondo y texto más brillantes si el índice coincide con la selección actual
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150 ${selectedIndex === i
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-white/60 hover:bg-white/5"
                      }`}
                  >
                    <div className={selectedIndex === i ? "text-white" : "text-white/40"}>
                      {action.icon}
                    </div>
                    <span className="font-medium text-sm">{action.title}</span>
                  </button>
                ))
              )}
            </div>

            {/* Pie de página con instrucciones de accesibilidad */}
            <div className="px-4 py-3 bg-white/5 border-t border-white/10 text-xs text-white/40 flex items-center justify-between font-mono">
              <span className="flex items-center gap-2">
                <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">↑↓</span>
                <span>to navigate</span>
                <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] ml-2">↵</span>
                <span>to select</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">esc</span>
                <span>to close</span>
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}