"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// --- Definición de Tipos ---
// Centralizar los tipos permite una refactorización segura y autocompletado en todo el proyecto.
export type Theme = "cyberpunk" | "forest" | "mono";

export interface ThemeSettings {
  theme: Theme;
  scanlines: boolean;   // Efecto visual de líneas de escaneo (estilo CRT)
  grain: boolean;       // Efecto visual de ruido/grano de película
  audioEnabled: boolean; // Controla si el AudioManager debe emitir sonidos
  performanceMode: boolean; // Desactiva animaciones pesadas si es true
}

export interface ThemeContextType {
  settings: ThemeSettings;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setTheme: (theme: Theme) => void;
  toggleScanlines: () => void;
  toggleGrain: () => void;
  toggleAudio: () => void;
  togglePerformance: () => void;
}

// Configuración por defecto. Se usa como fallback y estado inicial.
const defaultSettings: ThemeSettings = {
  theme: "cyberpunk",
  scanlines: false,
  grain: true,
  audioEnabled: false,
  performanceMode: false,
};

// El contexto se inicializa como 'undefined' intencionalmente.
// Esto permite que el hook 'useTheme' lance un error si se usa fuera del Provider.
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Hook personalizado para consumir el contexto del tema.
 * Incluye una "Guard Clause" (cláusula de guarda) que lanza un error descriptivo
 * si un componente intenta usarlo sin estar envuelto por <ThemeProvider>.
 * Esto previene errores silenciosos y difíciles de depurar.
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

/**
 * Proveedor Global de Tema y Configuración.
 * 
 * Gestiona el estado visual y funcional de toda la aplicación.
 * Sincroniza el estado de React con el DOM real (clases del <body>) 
 * y persiste las preferencias del usuario en localStorage.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicializamos el estado. (Nota: en una app real, podríamos leer de localStorage aquí,
  // pero para evitar hydration mismatch en Next.js, es más seguro hacerlo dentro de useEffect).
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);

  // Estado de carga global. Componentes como <PageLoader> leerán esto 
  // y lo cambiarán a 'false' cuando la app esté lista.
  const [isLoading, setIsLoading] = useState(true);

  // --- Funciones actualizadoras (Updaters) ---
  // Usamos la forma funcional de setState (s => ...) para garantizar que siempre 
  // trabajamos con el estado más reciente, evitando condiciones de carrera (race conditions).
  const setTheme = (theme: Theme) => setSettings(s => ({ ...s, theme }));
  const toggleScanlines = () => setSettings(s => ({ ...s, scanlines: !s.scanlines }));
  const toggleGrain = () => setSettings(s => ({ ...s, grain: !s.grain }));
  const toggleAudio = () => setSettings(s => ({ ...s, audioEnabled: !s.audioEnabled }));
  const togglePerformance = () => setSettings(s => ({ ...s, performanceMode: !s.performanceMode }));

  // --- Efecto 1: Sincronización con el DOM (Body Classes / Data Attributes) ---
  useEffect(() => {
    const body = document.body;

    // 1. Limpieza de clases de temas anteriores para evitar conflictos de CSS
    body.classList.remove("theme-cyberpunk", "theme-forest", "theme-mono");

    // 2. Aplicación del tema actual. Tus archivos CSS globales pueden usar 
    // '.theme-cyberpunk { --bg-color: #000; }' para cambiar variables CSS.
    body.classList.add(`theme-${settings.theme}`);

    // 3. (Opcional pero recomendado) Sincronizar efectos visuales como data-attributes.
    // Esto permite que CSS haga: 'body[data-grain="true"] { /* estilos de grano */ }'
    body.setAttribute("data-scanlines", settings.scanlines.toString());
    body.setAttribute("data-grain", settings.grain.toString());
    body.setAttribute("data-performance", settings.performanceMode.toString());

  }, [settings.theme, settings.scanlines, settings.grain, settings.performanceMode]);

  // --- Efecto 2: Persistencia en LocalStorage (Solo en cliente) ---
  useEffect(() => {
    // Guardamos la configuración cada vez que cambia.
    // JSON.stringify es necesario porque localStorage solo guarda strings.
    localStorage.setItem("jayanta_theme_settings", JSON.stringify(settings));
  }, [settings]);

  // --- Efecto 3: Carga inicial desde LocalStorage ---
  useEffect(() => {
    const savedSettings = localStorage.getItem("jayanta_theme_settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings) as ThemeSettings;
        // Fusionamos con los defaults por si añadimos nuevas propiedades en el futuro
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.warn("Error parsing theme settings from localStorage", error);
      }
    }
    // Nota: El setIsLoading(false) lo maneja externamente (ej. al terminar el PageLoader),
    // o podrías ponerlo aquí si la carga depende solo de leer el localStorage.
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        settings,
        isLoading,
        setIsLoading,
        setTheme,
        toggleScanlines,
        toggleGrain,
        toggleAudio,
        togglePerformance
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};