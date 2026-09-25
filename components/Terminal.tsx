"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useAudio } from "./AudioManager";

/**
 * Componente de Terminal Interactiva.
 * 
 * Simula una terminal de sistema operativo estilo "hacker/developer" que se 
 * despliega desde la parte superior. Proporciona comandos divertidos y útiles,
 * integra efectos de sonido (vía AudioManager) y desencadena eventos globales
 * para interactuar con otros componentes de la aplicación (ej. modo Zen, Matrix).
 * 
 * Características principales:
 * - Lectura de APIs del navegador (Batería y Red) para el comando 'status'.
 * - Atajo de teclado global (`~` o `` ` ``) para abrir/cerrar.
 * - Animaciones de entrada/salida con Framer Motion.
 * - Retroalimentación auditiva en cada pulsación de tecla.
 */
export default function Terminal() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { playTypeSound } = useAudio();

  // Historial de comandos y respuestas. Se inicializa con un mensaje de bienvenida.
  const [history, setHistory] = useState<string[]>([
    "JAYANTA_OS v3.0.0 (Ultimate Edition)",
    "Type 'help' to see all cool commands.",
  ]);

  // Estados para la información del sistema (se llenan en el useEffect inicial)
  const [batteryInfo, setBatteryInfo] = useState<string>("Detecting battery...");
  const [networkInfo, setNetworkInfo] = useState<string>("Detecting network...");

  // Referencia al input para poder enfocar el cursor programáticamente cuando se abre la terminal
  const inputRef = useRef<HTMLInputElement>(null);

  // --- Efecto 1: Inicialización de APIs del navegador y Listener global de teclado ---
  useEffect(() => {
    // Verificamos que estamos en el cliente (navegador)
    if (typeof navigator !== "undefined") {
      // 1. API de Batería (Experimental, pero ampliamente soportada en Chrome/Edge)
      // Usamos @ts-ignore porque TypeScript no incluye esta API en la interfaz Navigator por defecto.
      // @ts-ignore
      if (navigator.getBattery) {
        // @ts-ignore
        navigator.getBattery().then((battery: any) => {
          setBatteryInfo(`Battery: ${Math.round(battery.level * 100)}% (${battery.charging ? "Charging" : "Discharging"})`);
        });
      }

      // 2. API de Información de Red (Network Information API)
      // @ts-ignore
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection && connection.effectiveType) {
        setNetworkInfo(`Network: ${connection.effectiveType.toUpperCase()} (${connection.downlink || 0}Mbps)`);
      } else {
        setNetworkInfo("Network: Stable (Online)");
      }
    }

    // 3. Listener global para el atajo de teclado (Tecla tilde `` ` `` o `~`)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "`" || e.key === "~") {
        e.preventDefault(); // Evita que se escriba el carácter en inputs externos
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Limpieza: remover el listener al desmontar para evitar fugas de memoria o comportamientos duplicados
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // --- Efecto 2: Auto-enfoque del input ---
  useEffect(() => {
    if (isOpen) {
      // Usamos un pequeño setTimeout para asegurar que el DOM ya ha renderizado 
      // el elemento <input> después de que Framer Motion inicia la animación de entrada.
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // --- Lógica principal de procesamiento de comandos ---
  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return; // Ignorar entradas vacías

    // Añadimos el comando escrito por el usuario al historial
    const newHistory = [...history, `> ${input}`];
    const cmd = input.trim().toLowerCase();

    // Enrutamiento simple de comandos
    if (cmd === "help") {
      newHistory.push("Available: help, status, diag, me, matrix-rain, zen, sudo hire, clear, exit");
    } else if (cmd === "status") {
      newHistory.push(batteryInfo);
      newHistory.push(networkInfo);
    } else if (cmd === "zen") {
      newHistory.push("INITIATING ZEN MODE... FOCUSING...");
      // Desencadena un evento personalizado que otro componente (ej. un Layout o Page) puede escuchar
      window.dispatchEvent(new CustomEvent("trigger-zen"));
      setTimeout(() => setIsOpen(false), 500); // Cierra la terminal automáticamente
    } else if (cmd === "diag") {
      newHistory.push("RUNNING SYSTEM DIAGNOSTICS...");
      newHistory.push("CPU: OK [8-Core Creative Processor]");
      newHistory.push("RAM: OK [16GB Interactive Memory]");
      newHistory.push("GPU: OK [RTX 4090 Scrollytelling Engine]");
      newHistory.push("UPTIME: 100% RELIABILITY");
    } else if (cmd === "me") {
      newHistory.push("LOADING ASCII AVATAR...");
      newHistory.push("      _.-'''''-._");
      newHistory.push("    .'  _     _  '.");
      newHistory.push("   /   (o)   (o)   \\");
      newHistory.push("  |                 |");
      newHistory.push("  |  \\           /  |");
      newHistory.push("   \\  '.       .'  /");
      newHistory.push("    '.  '-----'  .'");
      newHistory.push("      '-._____.-'");
      newHistory.push("JAYANTA - CREATIVE DEVELOPER");
    } else if (cmd === "matrix-rain") {
      newHistory.push("INITIATING MATRIX PROTOCOL...");
      window.dispatchEvent(new CustomEvent("trigger-matrix"));
      setTimeout(() => setIsOpen(false), 500);
    } else if (cmd.startsWith("sudo hire")) {
      newHistory.push("ACCESS GRANTED. REDIRECTING...");
      // Efecto visual de celebración
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      // Redirección retardada para permitir que el usuario vea el mensaje y el confeti
      setTimeout(() => { window.location.href = "mailto:hello@jayanta.dev"; }, 2000);
    } else if (cmd === "clear") {
      setHistory([]); // Limpia el historial visualmente
      setInput("");
      return; // Salimos temprano para no añadir el input vacío al historial nuevo
    } else if (cmd === "exit") {
      setIsOpen(false);
    } else {
      newHistory.push(`Unknown command: ${cmd}`); // Fallback para comandos no reconocidos
    }

    // Actualizamos el estado con el nuevo historial y limpiamos el input
    setHistory(newHistory);
    setInput("");
  };

  // --- Manejador de entrada de texto ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    // Integra el sistema de audio: reproduce un sonido en cada pulsación de tecla
    playTypeSound();
  };

  return (
    // AnimatePresence es crucial aquí: permite que la animación de "exit" (salida) 
    // se reproduzca completamente antes de que el componente se desmonte del DOM.
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }} // Añadido para suavizar el movimiento
          className="fixed top-0 left-0 w-full md:w-[600px] md:left-1/2 md:-translate-x-1/2 md:top-20 z-[9999] bg-background/95 glass p-6 rounded-b-2xl md:rounded-2xl shadow-2xl font-mono text-sm overflow-hidden"
        >
          {/* Cabecera estilo macOS */}
          <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2 relative z-10">
            <span className="text-foreground/40">jayanta@os: ~</span>
            <div className="flex gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="w-2 h-2 rounded-full bg-red-500 hover:scale-125 transition-transform"
                title="Close Terminal"
                aria-label="Close terminal"
              />
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
          </div>

          {/* Área de historial con scroll */}
          <div className="h-64 overflow-y-auto flex flex-col gap-1 text-accent/90 relative z-10 scrollbar-hide">
            {history.map((line, i) => (
              <div
                key={i}
                // Diferenciamos visualmente los comandos del usuario (empiezan con ">") de las respuestas del sistema
                className={line.startsWith(">") ? "text-foreground/80 font-bold" : "text-foreground/60"}
              >
                {line}
              </div>
            ))}
          </div>

          {/* Formulario de entrada */}
          <form onSubmit={handleCommand} className="mt-4 flex gap-2 text-foreground relative z-10">
            <span className="text-accent animate-pulse">λ</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              className="bg-transparent outline-none flex-1 font-mono text-foreground placeholder-foreground/20"
              placeholder="type command..."
              autoComplete="off" // Evita que el navegador muestre sugerencias de autocompletado sobre la terminal
              spellCheck={false}  // Evita el subrayado rojo de corrector ortográfico en comandos
            />
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}