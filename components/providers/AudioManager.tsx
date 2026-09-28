"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

interface AudioContextType {
  /** `true` si el audio está silenciado (estado inicial por defecto). */
  isMuted: boolean;
  /** Alterna el silencio y reanuda el AudioContext si estaba suspendido. */
  toggleMute: () => void;
  /** Pitido corto ascendente (800→1200 Hz), pensado para hover. */
  playHoverSound: () => void;
  /** Golpe grave descendente (400→50 Hz), pensado para clic. */
  playClickSound: () => void;
  /** Clic corto y agudo (150 Hz), pensado para tecleo. No se dispara solo. */
  playTypeSound: () => void;
}

const AudioContext = createContext<AudioContextType>({
  isMuted: true,
  toggleMute: () => { },
  playHoverSound: () => { },
  playClickSound: () => { },
  playTypeSound: () => { },
});

/** Da acceso al estado de silencio y a los reproductores de sonido de `AudioManager`. */
export const useAudio = () => useContext(AudioContext);

/**
 * Proveedor global de audio: gestiona un drone ambiental y expone sonidos
 * de hover, clic y tecleo mediante `useAudio`.
 * 
 * Utiliza la Web Audio API para sintetizar sonidos en tiempo real, evitando
 * la carga de archivos de audio externos. 
 * 
 * Añade automáticamente sonido a enlaces, botones y elementos `.interactive`
 * mediante delegación de eventos en la ventana.
 * Silenciado por defecto para cumplir con las políticas de autoplay de los navegadores;
 * el usuario debe activarlo explícitamente con `toggleMute`.
 */
export default function AudioManager({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(true);

  // Referencias para persistir instancias de la Web Audio API entre renderizados
  // sin provocar re-renderizados de React.
  const audioCtxRef = useRef<AudioContext | null>(null);
  const droneOscillatorRef = useRef<OscillatorNode | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);

  // --- Efecto 1: Inicialización del AudioContext ---
  useEffect(() => {
    // Inicializa el contexto de audio del navegador.
    // Se incluye fallback (webkitAudioContext) para compatibilidad con versiones antiguas de Safari.
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtxRef.current = new AudioContextClass();

    // Limpieza: Cierra el contexto de audio al desmontar el componente para liberar recursos del sistema.
    return () => {
      audioCtxRef.current?.close();
    };
  }, []);

  // --- Efecto 2: Gestión del Drone Ambiental ---
  useEffect(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;

    if (!isMuted) {
      // Los navegadores suspenden el AudioContext hasta que hay interacción del usuario.
      // Lo reanudamos aquí para asegurar que el audio suene.
      if (ctx.state === "suspended") ctx.resume();

      // 1. Oscilador base del drone (tono grave fundamental)
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(55, ctx.currentTime); // 55 Hz (Nota La1)

      // 2. LFO (Low Frequency Oscillator) para modular la frecuencia del drone.
      // Esto crea un ligero efecto de "wobble" o vibración orgánica, evitando que suene estático.
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(0.1, ctx.currentTime); // 0.1 Hz (muy lento)

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(5, ctx.currentTime); // Modula la frecuencia en ±5 Hz
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency); // Conecta la salida del LFO a la frecuencia del oscilador base

      // 3. Nodo de ganancia para el Fade-In (entrada gradual del volumen)
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      // linearRampToValueAtTime crea un fade-in suave de 3 segundos hasta un volumen bajo (0.05)
      gainNode.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 3);

      // Conexión de la cadena de audio: Oscilador -> Ganancia -> Destino (Altavoces)
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      lfo.start();

      // Guardamos en las refs para poder detenerlos más tarde
      droneOscillatorRef.current = osc;
      droneGainRef.current = gainNode;
    } else {
      // Si se silencia, hacemos un Fade-Out y luego limpiamos los nodos
      if (droneGainRef.current && droneOscillatorRef.current) {
        // Fade-out de 1 segundo
        droneGainRef.current.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 1);

        // Esperamos a que termine el fade-out para detener y desconectar los nodos
        // y evitar clics de audio (pops) o fugas de memoria.
        setTimeout(() => {
          droneOscillatorRef.current?.stop();
          droneOscillatorRef.current?.disconnect();
          droneGainRef.current?.disconnect();
        }, 1000);
      }
    }
  }, [isMuted]);

  // --- Funciones de síntesis de sonidos cortos (SFX) ---
  // Cada función crea un oscilador y un nodo de ganancia con una envolvente rápida.
  // Se usa exponentialRampToValueAtTime para el volumen (gain) porque el oído humano
  // percibe los cambios de volumen de forma exponencial, sonando más natural que un cambio lineal.

  const playHoverSound = () => {
    if (isMuted || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square"; // Onda cuadrada para un sonido más "digital" o "arcade"
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05); // Barrido ascendente rápido

    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05); // Envolvente de decaimiento rápido

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05); // Duración total: 50ms
  };

  const playClickSound = () => {
    if (isMuted || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine"; // Onda senoidal para un sonido más suave y orgánico
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1); // Barrido descendente (efecto "thump" o golpe)

    gain.gain.setValueAtTime(0.1, ctx.currentTime); // Volumen inicial más alto que el hover
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1); // Duración total: 100ms
  };

  const playTypeSound = () => {
    if (isMuted || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(150, ctx.currentTime); // Frecuencia fija y grave
    // No hay barrido de frecuencia, es un "tick" seco.

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02); // Decaimiento extremadamente rápido

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.02); // Duración total: 20ms
  };

  const toggleMute = () => {
    // Reanuda el contexto si el navegador lo había suspendido por falta de interacción previa.
    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume();
    }
    setIsMuted((prev) => !prev);
  };

  // --- Efecto 3: Delegación de eventos globales ---
  useEffect(() => {
    // En lugar de añadir event listeners a cada botón/enlace individualmente (lo cual sería costoso),
    // usamos delegación de eventos escuchando en el objeto `window`.

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Verificamos si el elemento o alguno de sus ancestros es interactivo
      if (target.tagName === "A" || target.tagName === "BUTTON" || target.closest("a") || target.closest("button") || target.classList.contains("interactive")) {
        playHoverSound();
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "A" || target.tagName === "BUTTON" || target.closest("a") || target.closest("button") || target.classList.contains("interactive")) {
        playClickSound();
      }
    };

    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("click", handleClick);

    // Limpieza de listeners al desmontar o cuando cambia 'isMuted'
    return () => {
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("click", handleClick);
    };
  }, [isMuted]); // Se incluye isMuted en las dependencias para asegurar que las closures de los listeners tengan el estado actualizado, aunque las funciones internas ya validan el mute.

  return (
    <AudioContext.Provider value={{ isMuted, toggleMute, playHoverSound, playClickSound, playTypeSound }}>
      {children}
    </AudioContext.Provider>
  );
}