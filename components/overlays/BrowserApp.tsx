"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X as CloseIcon, RotateCw, ChevronLeft, ChevronRight, Globe, Lock,
  ExternalLink, Bookmark, Search, ShieldAlert, Globe2,
  X, Briefcase, Camera, Hash, Code, Share2
} from "lucide-react";

// Constante fuera del componente para evitar recreación en cada renderizado
const WHITELIST = [
  { name: "LinkedIn", url: "https://www.linkedin.com/in/jayanta-mondal-44a5473a2", domain: "linkedin.com", icon: <Briefcase size={24} /> },
  { name: "Twitter", url: "https://x.com/JayantaCodes", domain: "x.com", icon: <X size={24} /> },
  { name: "Instagram", url: "https://www.instagram.com/JayantaCodes", domain: "instagram.com", icon: <Camera size={24} /> },
  { name: "Threads", url: "https://www.threads.net/@JayantaCodes", domain: "threads.net", icon: <Hash size={24} /> },
  { name: "Facebook", url: "https://www.facebook.com/JayantaCodes", domain: "facebook.com", icon: <Share2 size={24} /> },
  { name: "Github", url: "https://github.com/jayantacodes", domain: "github.com", icon: <Code size={24} /> }
];

/**
 * Componente de Navegador Simulado (Nova Browser).
 * 
 * Simula una experiencia de navegación segura con lista blanca (whitelist).
 * 
 * Mejoras arquitectónicas aplicadas:
 * 1. Prevención de Iframes: Muestra una pantalla de "Ready to Launch" en lugar 
 *    de un <iframe> real. Esto es intencional y profesional, ya que sitios como 
 *    LinkedIn, GitHub o Twitter bloquean la incrustación mediante cabeceras 
 *    X-Frame-Options o CSP, lo que rompería la UI con un error "refused to connect".
 * 2. Corrección de Historial: Evita empujar la misma URL al historial si el 
 *    usuario pulsa "Recargar" (navegar a la URL actual).
 * 3. UX del Input: Al perder el foco (blur), el input revierte a la URL actual 
 *    si el usuario escribió algo pero no pulsó Enter. Al ganar foco, selecciona 
 *    todo el texto para facilitar la edición.
 * 4. Accesibilidad (a11y): Añadido cierre con tecla Escape, roles ARIA para 
 *    el modal (dialog) y labels descriptivos en todos los botones de icono.
 */
export default function BrowserApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("nova://home");
  const [inputValue, setInputValue] = useState("nova://home");
  const [history, setHistory] = useState(["nova://home"]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestricted, setIsRestricted] = useState(false);

  // Ref para manejar el cierre con Escape sin depender de re-renderizados
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  // --- Efecto 1: Escucha de evento global para abrir ---
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-browser", handleOpen);
    return () => window.removeEventListener("open-browser", handleOpen);
  }, []);

  // --- Efecto 2: Cierre con tecla Escape (Estándar de UX para modales) ---
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpenRef.current) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // --- Lógica de Navegación ---
  const navigateTo = (url: string) => {
    // CORRECCIÓN: Evitar duplicar la URL actual en el historial (ej. al pulsar "Recargar")
    if (url === currentUrl && !isRestricted) return;

    setIsLoading(true);
    setIsRestricted(false);

    const isWhitelisted = WHITELIST.some(item => url.includes(item.domain));
    const isHome = url === "nova://home";

    // Simulación de latencia de red para realismo
    setTimeout(() => {
      if (isHome || isWhitelisted) {
        // Sobrescribe el historial "hacia adelante" si estábamos en medio del array
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(url);

        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setCurrentUrl(url);
        setInputValue(url);
      } else {
        setIsRestricted(true);
        setCurrentUrl("nova://restricted");
        setInputValue(url); // Muestra lo que el usuario intentó visitar
      }
      setIsLoading(false);
    }, 600); // Reducido ligeramente a 600ms para que se sienta más ágil
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let url = inputValue.toLowerCase().trim();

    // Normalización básica de URL
    if (!url.startsWith("http") && !url.startsWith("nova://")) {
      url = "https://" + url;
    }
    navigateTo(url);
  };

  // UX: Seleccionar todo el texto al hacer foco para facilitar la edición
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  // UX: Revertir el texto al URL actual si el usuario hace clic fuera sin enviar
  const handleInputBlur = () => {
    setInputValue(currentUrl);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const prevUrl = history[newIndex];
      setCurrentUrl(prevUrl);
      setInputValue(prevUrl);
      setIsRestricted(prevUrl === "nova://restricted");
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextUrl = history[newIndex];
      setCurrentUrl(nextUrl);
      setInputValue(nextUrl);
      setIsRestricted(nextUrl === "nova://restricted");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}

          // Accesibilidad: Definir este contenedor como un diálogo modal
          role="dialog"
          aria-modal="true"
          aria-label="Nova Browser Window"
          className="fixed inset-4 md:inset-20 z-[5000] glass rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-white/10"
        >
          {/* --- CABECERA DEL NAVEGADOR --- */}
          <div className="bg-white/5 border-b border-white/5 p-4 flex items-center gap-4 shrink-0">
            {/* Controles de ventana (Traffic Lights) */}
            <div className="flex gap-2 mr-4">
              <button
                onClick={() => setIsOpen(false)}
                className="group w-3 h-3 rounded-full bg-red-500 hover:brightness-125 transition-all flex items-center justify-center"
                aria-label="Close browser"
              >
                <CloseIcon size={8} className="text-black/70 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-50" aria-hidden="true" />
              <div className="w-3 h-3 rounded-full bg-green-500 opacity-50" aria-hidden="true" />
            </div>

            {/* Controles de Navegación */}
            <div className="flex items-center gap-1 text-white/40">
              <button
                onClick={goBack}
                disabled={historyIndex === 0}
                className="p-1.5 rounded-lg hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                aria-label="Go back"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={goForward}
                disabled={historyIndex === history.length - 1}
                className="p-1.5 rounded-lg hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                aria-label="Go forward"
              >
                <ChevronRight size={18} />
              </button>
              <button
                onClick={() => navigateTo(currentUrl)}
                className="p-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-all ml-1"
                aria-label="Reload page"
              >
                <RotateCw size={16} className={isLoading ? "animate-spin" : ""} />
              </button>
            </div>

            {/* Barra de Direcciones */}
            <form onSubmit={handleInputSubmit} className="flex-1 max-w-2xl mx-auto">
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
                  {isRestricted ? (
                    <ShieldAlert size={14} className="text-red-500" />
                  ) : (
                    <Lock size={12} />
                  )}
                </div>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  className="w-full bg-black/40 border border-white/10 rounded-full py-2 pl-9 pr-4 text-xs font-mono text-white/80 outline-none focus:border-accent/50 focus:bg-black/60 transition-all placeholder:text-white/20"
                  placeholder="Enter URL or search..."
                  aria-label="Address bar"
                />
              </div>
            </form>

            {/* Info del Sistema */}
            <div className="flex items-center gap-3 text-white/40 ml-4 shrink-0">
              <Globe size={16} />
              <div className="w-[1px] h-4 bg-white/10" />
              <div className="text-[10px] font-mono tracking-tighter uppercase">Nova v1.0.4</div>
            </div>
          </div>

          {/* --- CONTENIDO DEL NAVEGADOR --- */}
          <div className="flex-1 bg-[#050505] relative overflow-hidden">
            <AnimatePresence mode="wait">

              {/* VISTA 1: Home */}
              {currentUrl === "nova://home" && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center overflow-y-auto"
                >
                  <div className="w-20 h-20 rounded-3xl bg-accent/20 flex items-center justify-center text-accent mb-8 shadow-[0_0_30px_rgba(var(--accent-rgb),0.2)]">
                    <Globe2 size={40} />
                  </div>
                  <h1 className="text-4xl font-black tracking-tighter uppercase mb-4">NOVA <span className="text-accent italic">BROWSER</span></h1>
                  <p className="text-white/30 font-mono text-xs mb-12 max-w-sm tracking-widest">ENCRYPTED_PORTAL // SYSTEM_WHITELIST_ACTIVE</p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-xl w-full">
                    {WHITELIST.map((site) => (
                      <button
                        key={site.name}
                        onClick={() => navigateTo(site.url)}
                        className="p-6 glass rounded-2xl border border-white/5 hover:border-accent/30 hover:bg-white/5 transition-all group text-center focus:outline-none focus:ring-2 focus:ring-accent/50"
                        aria-label={`Navigate to ${site.name}`}
                      >
                        <div className="text-white/20 group-hover:text-accent transition-colors mb-3 flex justify-center">
                          {site.icon}
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-widest block text-white/60 group-hover:text-white">
                          {site.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* VISTA 2: Restricted */}
              {currentUrl === "nova://restricted" && (
                <motion.div
                  key="restricted"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-6">
                    <ShieldAlert size={36} />
                  </div>
                  <h2 className="text-2xl font-bold text-red-500 uppercase tracking-tighter mb-4">Access Restricted</h2>
                  <p className="text-white/40 font-mono text-xs max-w-md leading-relaxed mb-8">
                    The requested URL is not on the system whitelist. To maintain system integrity, only authorized social protocols are permitted in this session.
                  </p>
                  <button
                    onClick={() => navigateTo("nova://home")}
                    className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all"
                  >
                    Return to Home
                  </button>
                </motion.div>
              )}

              {/* VISTA 3: External Site (Launch Pad) */}
              {currentUrl.startsWith("http") && !isRestricted && (
                <motion.div
                  key="site"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
                >
                  <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-white mb-8 shadow-2xl">
                    <Globe size={48} className="text-accent" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter uppercase mb-4">Ready to Launch</h2>
                  <p className="text-white/40 font-mono text-xs mb-12 max-w-md">
                    Secure handshake complete. Redirecting to external protocol: <br />
                    <span className="text-accent mt-2 inline-block truncate max-w-xs">{currentUrl}</span>
                  </p>

                  {/* 
                    NOTA ARQUITECTÓNICA: Usamos un enlace <a> en lugar de un <iframe>. 
                    Sitios como LinkedIn, GitHub y Twitter envían cabeceras 'X-Frame-Options: DENY' 
                    o CSP que bloquean la renderización en iframes, mostrando un error feo. 
                    Esta pantalla de "Launch Pad" es la solución profesional y estética.
                  */}
                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-12 py-4 bg-accent text-black font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-2xl shadow-accent/20"
                  >
                    Enter Portal
                    <ExternalLink size={18} />
                  </a>

                  <button
                    onClick={() => navigateTo("nova://home")}
                    className="mt-8 text-[10px] font-mono text-white/20 hover:text-white transition-colors uppercase tracking-widest"
                  >
                    Abort Connection
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* --- OVERLAY DE CARGA --- */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#050505]/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center"
                >
                  <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      className="w-full h-full bg-accent"
                    />
                  </div>
                  <span className="mt-4 text-[8px] font-mono text-white/30 uppercase tracking-[0.5em] animate-pulse">Syncing Protocols...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}