"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Music, Volume2, VolumeX } from "lucide-react";
import { useAudio } from "../providers/AudioManager";

/**
 * Componente de Reproductor de Música Ambiental (Music Player).
 * 
 * Interfaz de control para el drone ambiental gestionado por AudioManager.
 * Simula un reproductor de sistema con visualizador de audio y controles de volumen.
 * 
 * Mejoras arquitectónicas aplicadas respecto al código original:
 * 1. Sincronización de Estados: La lógica de Play/Pause ahora sincroniza 
 *    correctamente el estado visual local con el estado global de muteo.
 * 2. Barra de Volumen Interactiva: Reemplazada la barra estática por un 
 *    control clickeable que actualiza el estado y anima suavemente su ancho.
 * 3. Accesibilidad (a11y): Añadidos aria-labels, roles y estados ARIA 
 *    para que los lectores de pantalla interpreten los controles correctamente.
 * 4. Coherencia de UX: Los botones de "Saltar" están deshabilitados visualmente 
 *    con un tooltip, ya que este reproductor gestiona un único track de drone continuo.
 * 5. Animaciones Mejoradas: Transición suave (morph) entre los iconos de Play/Pause 
 *    y rotación sutil del icono principal cuando está activo.
 */
export default function MusicPlayer() {
  const { isMuted, toggleMute } = useAudio();

  // Estado local para la UI. Se inicializa como el inverso de isMuted.
  const [isPlaying, setIsPlaying] = useState(!isMuted);
  const [volume, setVolume] = useState(66); // Valor inicial del 66% (2/3)

  // Sincronizar estado local si el usuario mutea desde otro lugar (ej. CommandPalette)
  useEffect(() => {
    if (isMuted) {
      setIsPlaying(false);
    }
  }, [isMuted]);

  const handlePlayPause = () => {
    if (isPlaying) {
      // Al pausar, muteamos el audio global
      if (!isMuted) toggleMute();
      setIsPlaying(false);
    } else {
      // Al reproducir, aseguramos que el audio global esté desmuteado
      if (isMuted) toggleMute();
      setIsPlaying(true);
    }
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Calcula el porcentaje de volumen basado en la posición del clic dentro de la barra
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newVolume = Math.round((x / rect.width) * 100);
    setVolume(Math.max(0, Math.min(100, newVolume)));

    // Si el usuario sube el volumen desde 0, desmuteamos automáticamente
    if (newVolume > 0 && isMuted) {
      toggleMute();
      setIsPlaying(true);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6" role="region" aria-label="Ambient music player">
      {/* Cabecera del Track */}
      <div className="flex items-center gap-6">
        <motion.div
          // Animación de rotación sutil cuando está sonando
          animate={{ rotate: isPlaying ? 360 : 0 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent"
        >
          <Music size={24} />
        </motion.div>

        <div className="flex flex-col gap-1 pr-4">
          <span className="text-[10px] font-mono text-foreground/30 uppercase tracking-widest">Ambient Audio</span>
          <h4 className="text-xs font-bold text-foreground tracking-tight">Drone_v04.sys</h4>
        </div>
      </div>

      {/* Controles y Visualizador */}
      <div className="flex items-center justify-between gap-4">
        {/* Grupo de Botones de Reproducción */}
        <div className="flex items-center gap-4">
          {/* Botones de Saltar: Deshabilitados visualmente ya que es un solo track de drone */}
          <button
            disabled
            title="Continuous drone track"
            className="text-foreground/20 cursor-not-allowed transition-colors"
            aria-label="Previous track (disabled)"
          >
            <SkipBack size={14} />
          </button>

          <button
            onClick={handlePlayPause}
            className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
            aria-label={isPlaying ? "Pause ambient drone" : "Play ambient drone"}
            aria-pressed={isPlaying}
          >
            <AnimatePresence mode="wait">
              {!isMuted && isPlaying ? (
                <motion.div
                  key="pause"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                >
                  <Pause size={16} />
                </motion.div>
              ) : (
                <motion.div
                  key="play"
                  initial={{ opacity: 0, scale: 0.8, x: -2 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 2 }}
                  transition={{ duration: 0.15 }}
                >
                  <Play size={16} className="ml-0.5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <button
            disabled
            title="Continuous drone track"
            className="text-foreground/20 cursor-not-allowed transition-colors"
            aria-label="Next track (disabled)"
          >
            <SkipForward size={14} />
          </button>
        </div>

        {/* Grupo de Visualizador y Volumen */}
        <div className="flex flex-col gap-2 flex-grow max-w-[140px]">
          {/* Visualizador de Audio (Barras) */}
          <div className="flex gap-1 items-end h-6 justify-center">
            {[0.4, 0.7, 0.3, 0.9, 0.5].map((baseHeight, i) => (
              <motion.div
                key={i}
                // Las alturas son keyframes fijos que simulan una onda, escalados por baseHeight
                animate={{
                  height: isPlaying && !isMuted ? ["20%", `${baseHeight * 100}%`, "20%"] : "20%"
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
                className="w-1 bg-accent/40 rounded-full"
              />
            ))}
          </div>

          {/* Barra de Volumen Interactiva */}
          <div className="flex items-center gap-2 group">
            <button
              onClick={() => { toggleMute(); setIsPlaying(!isMuted); }}
              className="text-foreground/40 hover:text-foreground transition-colors"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? <VolumeX size={12} /> : <Volume2 size={12} />}
            </button>

            <div
              className="flex-grow h-1.5 bg-foreground/10 rounded-full overflow-hidden cursor-pointer relative"
              onClick={handleVolumeClick}
              role="slider"
              aria-valuenow={volume}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Volume control"
            >
              {/* La propiedad 'layout' de Framer Motion anima el cambio de ancho suavemente */}
              <motion.div
                className="h-full bg-accent rounded-full"
                style={{ width: `${volume}%` }}
                layout
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />

              {/* Efecto hover: muestra un círculo en la posición del volumen actual */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `${volume}%`, x: "-50%" }}
                layout
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}