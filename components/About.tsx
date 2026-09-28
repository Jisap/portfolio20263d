"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Lista de tecnologías y habilidades.
 * Se usa en dos sitios: las insignias estáticas y la marquesina con scroll.
 * Para añadir o quitar una habilidad basta con editar este array.
 */
const skills = [
  "HTML", "CSS", "JavaScript", "C", "C++", "JAVA", "Python", "SQL", "Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion", "Node.js", "Firebase", "UI/UX Design"
];

/**
 * Texto de la biografía que se escribe con el efecto máquina de escribir.
 */
const bioText = "Hi, I’m Jayanta Mondal — a BCA (Hons) student from Kolkata, India. I started with a simple curiosity about how websites and systems work behind the scenes, which evolved into a deep passion for programming and solving real-world problems. Right now, I’m building a strong foundation in Web Dev, AI, and DevOps, focusing on learning by building. My goal is to become a high-end software developer and contribute to impactful digital solutions.";

/**
 * Sección "Sobre mí" (About) del portfolio.
 *
 * Elementos que muestra:
 * 1. Panel lateral "Core_System_Process" con barras de métricas animadas y contadores.
 * 2. Biografía con efecto máquina de escribir, que arranca cuando el bloque es visible.
 * 3. Dos tarjetas de formación académica.
 * 4. Insignias estáticas de habilidades.
 * 5. Marquesina de habilidades (dos filas) cuyo desplazamiento depende del scroll.
 *
 * Requisitos:
 * - Es un Client Component (`"use client"`) porque usa hooks, refs e `IntersectionObserver`.
 * - Dependencias: `react` y `framer-motion`.
 * - Estilos con Tailwind CSS. Además necesita, definidos en `globals.css` o en
 *   `tailwind.config`: las clases `glass` e `interactive` y el color `accent`
 *   (usado en `bg-accent`, `text-accent`, `border-accent/30`, etc.).
 *
 * Datos que se pueden configurar:
 * - `skills` y `bioText` (constantes de este archivo).
 * - Las métricas (`label`, `val`, `color`), los contadores ("10+", "Kolkata") y los
 *   datos de formación están escritos directamente en el JSX.
 *
 * Accesibilidad (puntos pendientes):
 * - Un lector de pantalla leerá el texto incompleto mientras se escribe.
 * - No se respeta `prefers-reduced-motion`.
 * - Algunos textos (`text-[10px]`, `text-[8px]` con `text-white/30`) tienen poco
 *   contraste sobre `#121212`.
 *
 * @example
 * // app/page.tsx
 * import About from "@/components/About";
 *
 * export default function Home() {
 *   return (
 *     <main>
 *       <About />
 *     </main>
 *   );
 * }
 * // Se puede enlazar desde la navegación con href="#about".
 *
 * @returns {JSX.Element} Elemento `<section id="about">`.
 */
export default function About() {
  /** Referencia a la sección completa; es el objetivo de `useScroll`. */
  const containerRef = useRef<HTMLDivElement>(null);

  /** Referencia al bloque de la biografía; lo observa el `IntersectionObserver`. */
  const bioRef = useRef<HTMLDivElement>(null);

  /** Fragmento de `bioText` visible en cada momento. */
  const [displayedText, setDisplayedText] = useState("");

  /** Pasa a `true` cuando la biografía entra en pantalla y arranca la escritura. */
  const [isTyping, setIsTyping] = useState(false);

  /**
   * Progreso de scroll (0 a 1) mientras la sección cruza el viewport:
   * 0 cuando su borde superior toca el borde inferior de la pantalla,
   * 1 cuando su borde inferior toca el borde superior.
   */
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  /** Desplazamiento horizontal de la primera fila de la marquesina (hacia la izquierda). */
  const x1 = useTransform(scrollYProgress, [0, 1], [0, -500]);

  /** Desplazamiento horizontal de la segunda fila (hacia la derecha). */
  const x2 = useTransform(scrollYProgress, [0, 1], [-500, 0]);

  /**
   * Detecta cuándo la biografía es visible (al menos el 50 %) y activa `isTyping`.
   * No vuelve a `false`, así que la escritura solo arranca una vez.
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsTyping(true);
        }
      },
      { threshold: 0.5 }
    );

    if (bioRef.current) observer.observe(bioRef.current);
    return () => observer.disconnect();
  }, []);

  /**
   * Efecto máquina de escribir: cada 20 ms muestra un carácter más de `bioText`.
   * Se detiene al llegar al final y limpia el intervalo al desmontar.
   */
  useEffect(() => {
    let index = 0;
    if (isTyping) {
      const interval = setInterval(() => {
        setDisplayedText(bioText.substring(0, index));
        index++;
        if (index > bioText.length) {
          clearInterval(interval);
        }
      }, 20);
      return () => clearInterval(interval);
    }
  }, [isTyping]);

  return (
    <section id="about" ref={containerRef} className="relative w-full bg-[#121212] py-32 overflow-hidden border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-20 mb-32">
        {/* Grid de 12 columnas: 4 para el panel de métricas y 8 para la biografía */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">

          {/* Columna izquierda: métricas del sistema.
              En móvil va después de la biografía (order-2) y desde `lg` va primero (order-1). */}
          <div className="lg:col-span-4 order-2 lg:order-1">
            <div className="flex flex-col gap-6 p-8 glass rounded-3xl border border-white/10 relative overflow-hidden group">
              {/* Indicador pulsante decorativo */}
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              </div>
              <h3 className="text-[10px] font-mono text-white/30 uppercase tracking-[0.4em] mb-4">Core_System_Process</h3>

              {/* Barras de métricas: `val` es el porcentaje de ancho y `color` la clase Tailwind de fondo.
                  Se animan de 0 al valor cada vez que entran en pantalla (sin `once`). */}
              <div className="space-y-6">
                {[
                  { label: "CREATIVITY", val: 98, color: "bg-accent" },
                  { label: "LOGIC_CORE", val: 92, color: "bg-blue-400" },
                  { label: "ADAPTABILITY", val: 95, color: "bg-purple-400" },
                  { label: "SYSTEM_LEVEL", val: 88, color: "bg-orange-400" }
                ].map((stat, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-mono text-white/50 uppercase tracking-widest">
                      <span>{stat.label}</span>
                      <span>{stat.val}%</span>
                    </div>
                    <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${stat.val}%` }}
                        transition={{ duration: 1.5, delay: i * 0.1, ease: "circOut" }}
                        className={`h-full ${stat.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Contadores: proyectos realizados y ciudad de origen */}
              <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-white italic">10+</span>
                  <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">Projects_Built</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-white italic">Kolkata</span>
                  <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">System_Origin</span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha: biografía con efecto máquina de escribir */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <div className="flex flex-col gap-8">
              {/* Título de la sección; aparece una sola vez al hacerse visible */}
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="text-sm font-bold tracking-widest text-white/50 uppercase"
              >
                // The Story
              </motion.h2>

              {/* `bioRef` es el bloque que observa el IntersectionObserver.
                  `min-h-[200px]` reserva un mínimo de altura, pero el bloque crece mientras se escribe. */}
              <div ref={bioRef} className="min-h-[200px]">
                <p className="text-2xl md:text-4xl text-white font-medium leading-relaxed tracking-tight font-mono">
                  {displayedText}
                  {/* Cursor parpadeante (nota: sigue parpadeando cuando termina la escritura) */}
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="inline-block w-2 h-8 md:h-10 bg-accent ml-2 align-middle shadow-[0_0_15px_rgba(0,255,136,0.5)]"
                  />
                </p>
              </div>

              {/* Subsección de formación: dos tarjetas con aparición vertical (la segunda con retraso) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="p-6 bg-white/5 border border-white/10 rounded-2xl group hover:border-accent/30 transition-colors duration-500"
                >
                  <h3 className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] mb-4">Academic Protocol 01</h3>
                  <div className="flex flex-col gap-2">
                    <span className="text-lg font-bold text-white uppercase tracking-tighter group-hover:text-accent transition-colors">BCA(H) @ EIILM-Kolkata</span>
                    <span className="text-xs text-white/50 font-mono italic">2026 — 2030</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="p-6 bg-white/5 border border-white/10 rounded-2xl group hover:border-accent/30 transition-colors duration-500"
                >
                  <h3 className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] mb-4">Academic Protocol 02</h3>
                  <div className="flex flex-col gap-2">
                    <span className="text-lg font-bold text-white uppercase tracking-tighter group-hover:text-accent transition-colors">Higher Secondary @ TSBS</span>
                    <span className="text-xs text-white/50 font-mono italic">2024 — 2026</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

        </div>

        {/* Insignias de habilidades (estáticas): aparecen escalonadas con `delay: index * 0.05` */}
        <div className="mt-24 flex flex-wrap gap-4 justify-center md:justify-start">
          {skills.map((skill, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="px-6 py-3 rounded-full border border-white/10 bg-white/5 text-white/70 text-sm font-mono hover:border-accent/50 hover:bg-accent/5 hover:text-accent transition-all duration-300 interactive cursor-default"
            >
              {skill}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Marquesina de habilidades: dos filas de texto con contorno que se mueven en sentidos
          opuestos según el scroll. Cada fila repite `skills` tres veces para cubrir el ancho.
          En escritorio el contenedor se inclina (-2°) y se amplía (110 %). */}
      <div className="relative w-full flex flex-col gap-6 py-10 bg-white/5 md:rotate-[-2deg] md:scale-110 pointer-events-none select-none overflow-hidden">
        {/* Fila 1: se desplaza hacia la izquierda (`x1`) */}
        <motion.div style={{ x: x1 }} className="flex whitespace-nowrap gap-8 w-max">
          {[...skills, ...skills, ...skills].map((skill, i) => (
            <div key={i} className="text-4xl md:text-7xl font-bold text-transparent opacity-80" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.5)" }}>
              {skill}
            </div>
          ))}
        </motion.div>

        {/* Fila 2: orden invertido y se desplaza hacia la derecha (`x2`) */}
        <motion.div style={{ x: x2 }} className="flex whitespace-nowrap gap-8 w-max">
          {[...skills, ...skills, ...skills].reverse().map((skill, i) => (
            <div key={i} className="text-4xl md:text-7xl font-bold text-transparent opacity-80" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.5)" }}>
              {skill}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}