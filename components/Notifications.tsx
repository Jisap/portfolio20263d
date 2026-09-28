"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Info, CheckCircle, AlertTriangle, X } from "lucide-react";

interface Notification {
  id: string;
  message: string;
  type: "info" | "success" | "warning";
  duration: number; // Duración personalizada en ms
}

// Tipado correcto para el evento personalizado
interface NotifyEvent extends CustomEvent {
  detail: {
    message: string;
    type?: "info" | "success" | "warning";
    duration?: number; // Opcional: permite notificaciones persistentes
  };
}

/**
 * Componente de Sistema de Notificaciones (Toast Notifications).
 * 
 * Gestiona un sistema de notificaciones flotantes que aparecen en la esquina 
 * superior derecha. Se activa mediante eventos personalizados 'notify' desde 
 * cualquier parte de la aplicación.
 * 
 * Mejoras arquitectónicas aplicadas respecto al código original:
 * 1. Cleanup de Timeouts: Los timeouts se almacenan en un Map para poder 
 *    cancelarlos si el componente se desmonta o si el usuario cierra manualmente.
 * 2. Cierre Manual: Añadido botón X para cerrar notificaciones antes del timeout.
 * 3. Límite de Notificaciones: Máximo 5 notificaciones simultáneas para evitar 
 *    saturación visual y problemas de rendimiento.
 * 4. Duración Personalizable: Permite notificaciones persistentes (duration: 0).
 * 5. Accesibilidad: role="alert" y aria-live para lectores de pantalla.
 * 6. Tipado Estricto: Eliminados todos los 'any' con interfaces correctas.
 */
export default function Notifications() {
  const [items, setItems] = useState<Notification[]>([]);

  // Map para almacenar timeouts y poder cancelarlos individualmente
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Contador para IDs únicos (más confiable que Date.now())
  const idCounterRef = useRef(0);

  useEffect(() => {
    const MAX_NOTIFICATIONS = 5;
    const DEFAULT_DURATION = 5000;

    const handleNotify = (e: Event) => {
      const customEvent = e as NotifyEvent;
      const { message, type = "info", duration = DEFAULT_DURATION } = customEvent.detail;

      // Generamos ID único incremental
      idCounterRef.current += 1;
      const id = `notif-${idCounterRef.current}`;

      const newNotification: Notification = { id, message, type, duration };

      setItems(prev => {
        // Si ya hay muchas notificaciones, eliminamos las más antiguas
        const combined = [...prev, newNotification];
        return combined.length > MAX_NOTIFICATIONS
          ? combined.slice(combined.length - MAX_NOTIFICATIONS)
          : combined;
      });

      // Solo programamos timeout si la duración es mayor a 0
      if (duration > 0) {
        const timeoutId = setTimeout(() => {
          removeNotification(id);
        }, duration);

        timeoutsRef.current.set(id, timeoutId);
      }
    };

    window.addEventListener("notify", handleNotify);

    return () => {
      window.removeEventListener("notify", handleNotify);

      // Cancelamos todos los timeouts pendientes para evitar memory leaks
      timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
      timeoutsRef.current.clear();
    };
  }, []);

  const removeNotification = (id: string) => {
    // Cancelamos el timeout si existe
    const timeoutId = timeoutsRef.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }

    setItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    // pointer-events-none en el contenedor permite que los clics pasen a través
    // de las áreas vacías, pero las notificaciones individuales tienen pointer-events-auto
    <div
      className="fixed top-24 right-6 z-[10000] flex flex-col gap-4 pointer-events-none max-w-sm"
      aria-live="polite" // Los lectores de pantalla anunciarán nuevas notificaciones
      aria-label="Notifications"
    >
      <AnimatePresence>
        {items.map(item => (
          <motion.div
            key={item.id}
            initial={{ x: 100, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 100, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            // pointer-events-auto: Esta notificación específica sí recibe clics
            className="glass p-4 rounded-xl flex items-start gap-4 pointer-events-auto shadow-2xl border border-white/10"
            role="alert" // Indica a lectores de pantalla que es un mensaje importante
          >
            {/* Icono con color dinámico basado en el tipo */}
            <div className={`p-2 rounded-lg flex-shrink-0 ${item.type === "success" ? "bg-green-500/20 text-green-500" :
                item.type === "warning" ? "bg-yellow-500/20 text-yellow-500" :
                  "bg-blue-500/20 text-blue-500"
              }`}>
              {item.type === "success" ? <CheckCircle size={18} /> :
                item.type === "warning" ? <AlertTriangle size={18} /> :
                  <Info size={18} />}
            </div>

            {/* Contenido de la notificación */}
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <span className="text-[10px] font-mono text-foreground/30 uppercase tracking-widest">
                System Alert
              </span>
              <p className="text-xs text-foreground/80 leading-relaxed font-medium break-words">
                {item.message}
              </p>
            </div>

            {/* Botón de cierre manual */}
            <button
              onClick={() => removeNotification(item.id)}
              className="flex-shrink-0 text-foreground/30 hover:text-foreground/60 transition-colors"
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}