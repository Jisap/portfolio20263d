"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlitchText from "./GlitchText";
import Logo3D from "./Logo3D";
import { useAudio } from "../providers/AudioManager";
import { Volume2, VolumeX, Terminal as TerminalIcon, Wifi, Battery } from "lucide-react";

/**
 * Enlaces de navegación (anclas internas de la página).
 * Cada `href` debe coincidir con el `id` de una sección (`#work`, `#about`, `#contact`).
 */
const links = [
    { title: "Work", href: "#work" },
    { title: "About", href: "#about" },
    { title: "Contact", href: "#contact" },
];

/**
 * Cabecera fija del portfolio, con estética de "barra de sistema".
 *
 * Elementos que muestra:
 * 1. Marca: logo 3D, nombre con efecto glitch y un saludo con la hora en directo.
 * 2. Navegación con enlaces magnéticos (solo desde el breakpoint `lg`).
 * 3. Bandeja del sistema: estado de conexión, batería, visualizador de audio,
 *    botón de silencio y botón para abrir el terminal.
 *
 * Comportamiento:
 * - Está oculta al cargar y aparece con una animación de entrada cuando el usuario
 *   ha hecho scroll más de 4,4 alturas de pantalla, es decir, cuando termina la
 *   animación del modelo 3D del hero. Al volver hacia arriba se oculta de nuevo.
 * - El saludo ("Good Morning", "Good Afternoon" o "Good Evening") se calcula una sola
 *   vez al montar, según la hora local. No se actualiza si la página queda abierta
 *   durante horas.
 * - La hora se actualiza cada segundo con formato de 24 h.
 * - El nivel de batería usa la Battery Status API (`navigator.getBattery`), que solo
 *   está disponible en navegadores basados en Chromium. Si no existe, se muestra "100%".
 *
 * Requisitos:
 * - Client Component (`"use client"`): usa hooks, `window` y `navigator`.
 * - Dependencias: `react`, `framer-motion` y `lucide-react`.
 * - Componentes locales: `GlitchText`, `Logo3D` y el hook `useAudio` de `AudioManager`
 *   (debe devolver `{ isMuted, toggleMute }`, y el componente debe estar dentro de su
 *   proveedor de contexto).
 * - Tailwind CSS, con las clases personalizadas `glass` e `interactive` y los colores
 *   `accent` y `foreground` definidos en `globals.css` o en `tailwind.config`.
 *
 * Acoplamiento con otros componentes:
 * - El botón del terminal no abre nada por sí mismo: dispara un `KeyboardEvent` global
 *   con `key: "`"`. Debe existir un componente de terminal que escuche ese evento.
 *
 * @example
 * // app/layout.tsx
  * import Header from "@/components/ui/Header";
 *
 * export default function Layout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <AudioProvider>
 *       <Header />
 *       {children}
 *     </AudioProvider>
 *   );
 * }
 *
 * @returns {JSX.Element} `<AnimatePresence>` que envuelve el `<motion.header>` cuando es visible.
 */
export default function Header() {
    /** Estado de silencio del audio ambiental y función para alternarlo (contexto de `AudioManager`). */
    const { isMuted, toggleMute } = useAudio();

    /** Texto del saludo según la hora del día. */
    const [greeting, setGreeting] = useState("Hello");

    /** Hora actual formateada como `HH:MM:SS` (24 h). Vacía hasta el primer montaje. */
    const [time, setTime] = useState("");

    /** Nivel de batería (0-100), o `null` si el navegador no soporta la API. */
    const [battery, setBattery] = useState<number | null>(null);

    /** Controla si la cabecera está visible (según el scroll). */
    const [isVisible, setIsVisible] = useState(false);

    /**
     * Configuración inicial (solo al montar):
     * - Listener de scroll que decide la visibilidad.
     * - Reloj que se actualiza cada segundo.
     * - Cálculo del saludo.
     * - Lectura y seguimiento del nivel de batería, si la API existe.
     * Al desmontar limpia el intervalo y el listener de scroll.
     */
    useEffect(() => {
        const handleScroll = () => {
            // Appear after the hero face model animation is fully complete (approx 4.5 screens)
            setIsVisible(window.scrollY > window.innerHeight * 4.4);
        };
        window.addEventListener("scroll", handleScroll);

        const updateTime = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);

        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 18) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");

        // La Battery API no está en los tipos estándar de TypeScript, de ahí los @ts-ignore
        // @ts-ignore
        if (navigator.getBattery) {
            // @ts-ignore
            navigator.getBattery().then((bat: any) => {
                setBattery(Math.round(bat.level * 100));
                bat.addEventListener("levelchange", () => setBattery(Math.round(bat.level * 100)));
            });
        }

        return () => {
            clearInterval(timer);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        // AnimatePresence permite ejecutar la animación de salida (`exit`) al ocultarse
        <AnimatePresence>
            {isVisible && (
                <motion.header
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="fixed top-0 left-0 w-full z-50 px-6 md:px-20 py-4 flex items-center justify-between glass border-b border-white/5 pointer-events-auto shadow-2xl"
                >
                    {/* Marca y saludo: el saludo con la hora solo se ve desde `sm` */}
                    <div className="flex items-center gap-4">
                        <Logo3D />
                        <div className="flex flex-col">
                            <div className="text-white font-bold text-xl tracking-tighter cursor-pointer interactive">
                                <GlitchText text="JAYANTA" />
                                <span className="text-white/50 ml-1">®</span>
                            </div>
                            <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] mt-1 hidden sm:block">
                                {greeting} // {time}
                            </span>
                        </div>
                    </div>

                    {/* Navegación */}
                    <nav className="flex items-center gap-4 md:gap-12">
                        {/* Los enlaces solo aparecen desde `lg`; en pantallas menores no hay menú alternativo */}
                        <div className="hidden lg:flex items-center gap-8">
                            {links.map((link) => (
                                <MagneticLink key={link.title} href={link.href}>
                                    {link.title}
                                </MagneticLink>
                            ))}
                        </div>

                        {/* Bandeja del sistema */}
                        <div className="flex items-center gap-2 md:gap-6 px-3 md:px-6 py-2 bg-white/10 backdrop-blur-xl rounded-full">
                            {/* Indicador de conexión (decorativo: siempre muestra "ONLINE", no mide la red) */}
                            <div className="flex items-center gap-2 text-foreground/40">
                                <Wifi size={14} className="text-accent/50" />
                                <span className="text-[10px] font-mono uppercase tracking-widest hidden md:block">ONLINE</span>
                            </div>

                            {/* Batería: valor real si la API existe; "100%" como valor por defecto */}
                            <div className="flex items-center gap-2 text-foreground/40">
                                <Battery size={14} />
                                <span className="text-[10px] font-mono uppercase tracking-widest hidden md:block">{battery !== null ? `${battery}%` : "100%"}</span>
                            </div>

                            {/* Separador vertical */}
                            <div className="w-[1px] h-3 bg-white/10" />

                            <div className="flex items-center gap-4">
                                {/* Ecualizador animado: solo se muestra si el audio no está silenciado.
                    Cada barra oscila entre el 20 % y el 100 % de altura, con retraso escalonado.
                    (El valor `h` del array no se usa; solo determina cuántas barras hay: 3). */}
                                {!isMuted && (
                                    <div className="flex items-end gap-[1px] h-3">
                                        {[0.6, 0.4, 0.8].map((h, i) => (
                                            <motion.div
                                                key={i}
                                                animate={{ height: ["20%", "100%", "20%"] }}
                                                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                                className="w-[1.5px] bg-white"
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Botón de silencio: alterna el audio ambiental */}
                                <button
                                    onClick={toggleMute}
                                    className="text-white/50 hover:text-white transition-colors interactive"
                                    title="Toggle Ambient Audio"
                                >
                                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                </button>
                            </div>

                            {/* Botón del terminal: simula la pulsación de la tecla "`" para que el
                  componente de terminal (que escucha `keydown` en `window`) se abra o cierre.
                  Nota: el `title` menciona "~", pero la tecla enviada es "`". */}
                            <button
                                className="text-white/50 hover:text-white transition-colors interactive"
                                title="Toggle Terminal (~)"
                                onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { 'key': '`' }))}
                            >
                                <TerminalIcon size={16} />
                            </button>
                        </div>
                    </nav>
                </motion.header>
            )}
        </AnimatePresence>
    );
}

/**
 * Enlace con efecto "magnético": al pasar el ratón, el enlace se desplaza
 * suavemente hacia el cursor y vuelve a su sitio al salir.
 *
 * Funcionamiento:
 * - `handleMouse` calcula la distancia entre el cursor y el centro del enlace
 *   (usando `getBoundingClientRect`) y aplica un 20 % de esa distancia como desplazamiento.
 * - `reset` devuelve el enlace a `{ x: 0, y: 0 }` cuando el cursor sale.
 * - El movimiento se anima con un muelle (`spring`) de Framer Motion.
 *
 * Solo tiene sentido con ratón; en pantallas táctiles no se dispara.
 *
 * @param props.children Contenido del enlace (normalmente el texto).
 * @param props.href Destino del enlace (por ejemplo, `#about`).
 *
 * @example
 * <MagneticLink href="#about">About</MagneticLink>
 */
function MagneticLink({ children, href }: { children: React.ReactNode; href: string }) {
    /** Referencia al `<a>` para medir su posición y tamaño. */
    const ref = useRef<HTMLAnchorElement>(null);

    /** Desplazamiento actual (en px) respecto a la posición original. */
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!ref.current) return;
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current.getBoundingClientRect();
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
    };

    const reset = () => setPosition({ x: 0, y: 0 });

    return (
        <motion.a
            ref={ref}
            href={href}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className="text-white/80 hover:text-white font-medium text-xs uppercase tracking-[0.2em] transition-colors interactive py-2"
        >
            {children}
        </motion.a>
    );
}