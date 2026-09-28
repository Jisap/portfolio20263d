"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, MotionValue } from "framer-motion";
import { Home, User, Briefcase, Mail, Terminal, Settings, Globe, LayoutGrid } from "lucide-react";
import { useTheme } from "./ThemeContext";

// Definición centralizada de los elementos del Dock.
// Facilita la adición o reordenación de iconos sin tocar la lógica de renderizado.
const items = [
  { id: "hero", icon: <Home size={24} />, label: "Home" },
  { id: "about", icon: <User size={24} />, label: "Story" },
  { id: "work", icon: <Briefcase size={24} />, label: "Work" },
  { id: "browser", icon: <Globe size={24} />, label: "Nova Browser" },
  { id: "contact", icon: <Mail size={24} />, label: "Contact" },
  { id: "terminal", icon: <Terminal size={24} />, label: "Terminal" },
  { id: "dashboard", icon: <LayoutGrid size={24} />, label: "Dashboard" },
];

/**
 * Componente Dock (Barra de Tareas estilo macOS).
 * 
 * Proporciona navegación global con un efecto de magnificación orgánico 
 * basado en la proximidad del cursor. 
 * 
 * Mejoras arquitectónicas aplicadas:
 * 1. Optimización de Rendimiento (CRÍTICO): Se eliminó getBoundingClientRect() 
 *    del bucle de animación. Ahora se cachea en una ref y solo se actualiza 
 *    en el evento 'resize', evitando recálculos de layout por frame (60+ veces/segundo).
 * 2. Elevación de Estado Móvil: La detección de 'isMobile' se hace una sola vez 
 *    en el padre, evitando 7 listeners de matchMedia redundantes.
 * 3. Type Safety: Se tipó correctamente mouseX como MotionValue<number>.
 * 4. Accesibilidad (a11y): Añadidos roles, aria-labels y soporte completo 
 *    de navegación por teclado (Tab, Enter, Space).
 */
export default function Dock() {
  const { isLoading } = useTheme();

  // MotionValue que rastrea la posición X del ratón en la página.
  // Infinity indica que el ratón está fuera del dock.
  const mouseX = useMotionValue(Infinity);

  // Detección de móvil realizada UNA sola vez en el componente padre
  // para evitar renderizados y listeners redundantes en cada icono.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    setIsMobile(mediaQuery.matches);

    // Listener para actualizar si el usuario redimensiona la ventana a modo escritorio
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <AnimatePresence>
      {/* El dock solo aparece cuando la carga inicial de la página ha terminado */}
      {!isLoading && (
        <motion.nav
          role="navigation"
          aria-label="Main navigation dock"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          // Curva de easing "Expo Out" para una entrada suave y premium
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
          className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-[100000] w-[95%] max-w-max"
        >
          <motion.div
            // Actualizamos el MotionValue global del ratón. 
            // Framer Motion maneja esto de forma altamente optimizada fuera del ciclo de render de React.
            onMouseMove={(e) => mouseX.set(e.pageX)}
            onMouseLeave={() => mouseX.set(Infinity)}
            // no-scrollbar: Asume una utilidad CSS global (.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; })
            // md:overflow-visible: En escritorio, permitimos que los iconos agrandados se salgan del contenedor sin scroll.
            className="flex h-14 md:h-16 items-end gap-2 md:gap-4 rounded-2xl glass px-3 md:px-4 pb-2 md:pb-3 overflow-x-auto no-scrollbar md:overflow-visible"
          >
            {items.map((item) => (
              <DockIcon
                key={item.id}
                mouseX={mouseX}
                isMobile={isMobile}
                {...item}
              />
            ))}
          </motion.div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

/**
 * Componente hijo que representa un solo icono del Dock.
 * Calcula su propio tamaño basándose en la distancia al cursor.
 */
function DockIcon({
  mouseX,
  isMobile,
  id,
  icon,
  label
}: {
  mouseX: MotionValue<number>;
  isMobile: boolean;
  id: string;
  icon: React.ReactNode;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // OPTIMIZACIÓN CRÍTICA: Cacheamos los límites del elemento.
  // getBoundingClientRect es una operación costosa (synchronous layout). 
  // No debe llamarse dentro de useTransform. Lo llamamos solo al montar y al redimensionar.
  const boundsRef = useRef({ x: 0, width: 0 });

  useEffect(() => {
    const updateBounds = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        boundsRef.current = { x: rect.x, width: rect.width };
      }
    };

    updateBounds();
    window.addEventListener("resize", updateBounds);
    return () => window.removeEventListener("resize", updateBounds);
  }, []);

  // Calculamos la distancia del cursor al centro de este icono específico.
  // Al usar boundsRef.current, evitamos forzar recálculos de layout en cada frame.
  const distance = useTransform(mouseX, (val: number) => {
    return val - boundsRef.current.x - boundsRef.current.width / 2;
  });

  // Mapeamos la distancia a un ancho: 
  // A -150px de distancia: 40px de ancho.
  // A 0px de distancia (centro): 80px de ancho (máxima magnificación).
  // A +150px de distancia: 40px de ancho.
  const widthSync = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

  // Aplicamos un resorte (spring) para que el cambio de tamaño tenga peso, 
  // inercia y amortiguación, imitando la física real del Dock de macOS.
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  const handleClick = () => {
    // Patrón de bajo acoplamiento: Disparamos eventos en lugar de importar componentes.
    if (id === "terminal") {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '`' }));
    } else if (id === "browser") {
      window.dispatchEvent(new CustomEvent("open-browser"));
    } else if (id === "dashboard") {
      window.dispatchEvent(new CustomEvent("open-dashboard"));
    } else {
      // Navegación estándar por ancla
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // Soporte de teclado para accesibilidad
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <motion.div
      ref={ref}
      // En móvil, desactivamos la física de magnificación y usamos un ancho estático 
      // para mejorar el rendimiento y la usabilidad táctil.
      style={{ width: isMobile ? 40 : width }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      // tabIndex={0} permite que el elemento sea enfocable con la tecla Tab
      tabIndex={0}
      role="button"
      aria-label={`Navigate to ${label}`}
      className="relative aspect-square flex items-center justify-center rounded-xl bg-white/10 border border-white/10 text-white/50 hover:text-white hover:bg-white/20 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/50 group"
    >
      <AnimatePresence>
        {isHovered && !isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            // pointer-events-none asegura que el tooltip no interfiera con el evento mouseLeave del icono
            className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-md text-[10px] font-mono uppercase tracking-widest text-white border border-white/10 pointer-events-none whitespace-nowrap"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Escala ligeramente el icono para que se asiente visualmente mejor dentro del contenedor en expansión */}
      <div className="scale-[0.85] transition-transform duration-200 group-hover:scale-100">
        {icon}
      </div>
    </motion.div>
  );
}