"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid, X, Cpu, Globe, Cloud, Music, Calendar as CalendarIcon,
  Activity, Zap, Shield, HardDrive, Clock, MousePointer2, Type,
  Settings, RefreshCw, Terminal, Eye, Volume2, Database, Wifi
} from "lucide-react";
import { CalendarWidget, WeatherWidget } from "./Widgets";
import VisitorTracker from "./VisitorTracker";
import MusicPlayer from "./MusicPlayer";

/**
 * Componente de Panel de Control del Sistema (System Dashboard).
 * 
 * Actúa como el centro de comando de la aplicación, simulando un sistema 
 * operativo avanzado. Permite al usuario monitorear métricas en tiempo real,
 * ajustar configuraciones visuales/ambientales y acceder a herramientas útiles.
 * 
 * Mejoras arquitectónicas aplicadas:
 * 1. Corrección de Fuga de Memoria: Se añadió la limpieza del `setInterval` 
 *    en el useEffect de métricas.
 * 2. Lógica de Reloj Robusta: Se reemplazó la matemática de milisegundos 
 *    (propensa a errores con el horario de verano) por `Intl.DateTimeFormat`.
 * 3. Accesibilidad (a11y): Añadidos `role="dialog"`, `aria-modal` y 
 *    `aria-label` para cumplir con estándares WCAG en modales.
 * 4. Agrupación Lógica de Estados: Los estados se organizan por contexto 
 *    (UI, Simulación, Configuración Avanzada) para facilitar el mantenimiento.
 */
export default function SystemDashboard() {
  // --- 1. Estados de Interfaz de Usuario (UI) ---
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("core");

  // --- 2. Estados de Simulación de Métricas (Core) ---
  const [cpuLoad, setCpuLoad] = useState(42);
  const [ramLoad, setRamLoad] = useState(68);
  const [netSpeed, setNetSpeed] = useState(840);

  // --- 3. Estados de Configuración Ambiental (Env) ---
  const [rgbEnabled, setRgbEnabled] = useState(false);
  const [glitchIntensity, setGlitchIntensity] = useState(50);
  const [fontMode, setFontMode] = useState("modern");
  const [cursorMode, setCursorMode] = useState("default");

  // --- 4. Estados de Configuración Avanzada (Advanced) ---
  const [perfMode, setPerfMode] = useState("max");
  const [motionBlur, setMotionBlur] = useState(true);
  const [scanlines, setScanlines] = useState(false);
  const [particleDensity, setParticleDensity] = useState(40);
  const [soundProfile, setSoundProfile] = useState("cyber");
  const [autoSave, setAutoSave] = useState(true);
  const [firewallLevel, setFirewallLevel] = useState("strict");
  const [vramOptimized, setVramOptimized] = useState(true);
  const [kernelVersion, setKernelVersion] = useState("beta");

  // --- Efecto 1: Simulación de Métricas del Sistema ---
  useEffect(() => {
    const interval = setInterval(() => {
      // "Random Walk": Añade o resta un valor aleatorio, pero acotado por Math.max/min
      // para evitar que las métricas salgan de rangos realistas (ej. CPU entre 10% y 95%)
      setCpuLoad(prev => Math.max(10, Math.min(95, prev + (Math.random() * 10 - 5))));
      setRamLoad(prev => Math.max(30, Math.min(90, prev + (Math.random() * 4 - 2))));
      setNetSpeed(prev => Math.max(100, Math.min(1000, prev + (Math.random() * 100 - 50))));
    }, 2000);

    // CORRECCIÓN CRÍTICA: Limpieza del intervalo al desmontar el componente.
    // Sin esto, el intervalo seguiría ejecutándose en segundo plano indefinidamente.
    return () => clearInterval(interval);
  }, []);

  // --- Efecto 2: Escucha de Evento Global para Abrir el Dashboard ---
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-dashboard", handleOpen);

    return () => window.removeEventListener("open-dashboard", handleOpen);
  }, []);

  // --- Acciones del Sistema ---
  const handleSystemOptimize = () => {
    // Dispara una notificación global usando el componente <Notifications>
    window.dispatchEvent(new CustomEvent("notify", {
      detail: { message: "System Resources Optimized. Latency reduced by 14ms.", type: "success" }
    }));
    // Resetea visualmente las métricas para dar feedback inmediato al usuario
    setCpuLoad(15);
  };

  const menuItems = [
    { id: "core", icon: Cpu, label: "Core Metrics" },
    { id: "env", icon: Globe, label: "Environment" },
    { id: "advanced", icon: Zap, label: "Advanced" },
    { id: "tools", icon: Settings, label: "Tools" },
  ];

  // Función auxiliar para formatear horas de forma segura (respeta DST y zonas horarias reales)
  const getWorldTime = (timeZone: string) => {
    return new Date().toLocaleTimeString('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop: Cierra el modal al hacer clic fuera */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[10000] bg-background/40 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Contenedor Principal del Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            // La clase font-mono se aplica condicionalmente a todo el modal si el usuario lo selecciona
            className={`fixed inset-4 md:inset-10 z-[10001] glass rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row ${fontMode === "mono" ? "font-mono" : "font-sans"}`}

            // Accesibilidad para modales
            role="dialog"
            aria-modal="true"
            aria-label="System Dashboard"
          >
            {/* --- SIDEBAR DE NAVEGACIÓN --- */}
            <div className="w-full md:w-24 bg-white/5 border-r border-white/5 flex md:flex-col items-center py-4 md:py-12 gap-4 md:gap-8 justify-center md:justify-start">
              {/* Logo / Icono Principal */}
              <div className="hidden md:block mb-8">
                <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                  <Activity size={24} />
                </div>
              </div>

              {/* Botones de Pestañas */}
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`p-3 md:p-4 rounded-2xl transition-all duration-300 ${activeTab === item.id
                    ? "bg-accent text-black scale-110 shadow-lg shadow-accent/20"
                    : "text-foreground/40 hover:text-foreground hover:bg-white/5"
                    }`}
                  title={item.label}
                  aria-label={`Switch to ${item.label} tab`}
                  aria-pressed={activeTab === item.id}
                >
                  <item.icon size={20} />
                </button>
              ))}

              {/* Botón de Cierre (Solo visible en desktop en la sidebar) */}
              <button
                onClick={() => setIsOpen(false)}
                className="hidden md:block mt-auto p-4 text-foreground/40 hover:text-red-500 transition-colors"
                aria-label="Close dashboard"
              >
                <X size={20} />
              </button>
            </div>

            {/* --- ÁREA DE CONTENIDO PRINCIPAL --- */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12 scrollbar-hide">
              {/* Cabecera del Dashboard */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">
                    OS <span className="text-accent italic">DASHBOARD</span>
                  </h2>
                  <p className="text-[10px] opacity-30 mt-2 tracking-[0.4em]">
                    SYSTEM PROTOCOL v4.2.0 // HIGH_PRIORITY_INTERFACE
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {/* Indicador de Estado del Sistema */}
                  <div className="px-4 py-2 rounded-full bg-white/5 border border-white/5 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-mono opacity-50">STABLE</span>
                  </div>
                  {/* Botón de cierre para móvil */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="md:hidden p-2 text-foreground/40 hover:text-red-500 transition-colors"
                    aria-label="Close dashboard"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* ========================================== */}
              {/* PESTAÑA 1: CORE (Métricas y Optimización) */}
              {/* ========================================== */}
              {activeTab === "core" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* CPU Status */}
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono opacity-50 flex items-center gap-2">
                        <Cpu size={12} /> CPU LOAD
                      </span>
                      <span className="text-xs font-bold text-accent">{Math.round(cpuLoad)}%</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        layout // 'layout' anima suavemente los cambios de ancho
                        animate={{ width: `${cpuLoad}%` }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className="h-full bg-accent"
                      />
                    </div>
                  </div>

                  {/* RAM Status */}
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono opacity-50 flex items-center gap-2">
                        <Database size={12} /> RAM USAGE
                      </span>
                      <span className="text-xs font-bold text-blue-400">{Math.round(ramLoad)}%</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        layout
                        animate={{ width: `${ramLoad}%` }}
                        className="h-full bg-blue-400"
                      />
                    </div>
                  </div>

                  {/* Net Status */}
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono opacity-50 flex items-center gap-2">
                        <Wifi size={12} /> NETWORK
                      </span>
                      <span className="text-xs font-bold text-purple-400">{Math.round(netSpeed)} Mbps</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        layout
                        animate={{ width: `${(netSpeed / 1000) * 100}%` }}
                        className="h-full bg-purple-400"
                      />
                    </div>
                  </div>

                  {/* Security Status */}
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
                      <Shield size={24} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">FIREWALL ACTIVE</h4>
                      <p className="text-[10px] opacity-40">2,481 threats blocked</p>
                    </div>
                  </div>

                  {/* Storage */}
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                      <HardDrive size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold">DRIVE_MAIN</h4>
                      <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="w-[85%] h-full bg-orange-500 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Visitor Stats (Componente externo) */}
                  <div className="md:col-span-2 lg:col-span-1 p-6 rounded-3xl bg-white/5 border border-white/5">
                    <VisitorTracker />
                  </div>

                  {/* Quick Optimization Button */}
                  <button
                    onClick={handleSystemOptimize}
                    className="md:col-span-2 lg:col-span-3 p-6 md:p-8 rounded-3xl bg-accent text-black font-black uppercase text-lg md:text-xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all duration-200 group"
                  >
                    <RefreshCw size={24} className="group-hover:rotate-180 transition-transform duration-700" />
                    Run Global Optimization
                  </button>
                </div>
              )}

              {/* ========================================== */}
              {/* PESTAÑA 2: ENV (Configuración Visual)     */}
              {/* ========================================== */}
              {activeTab === "env" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/5 space-y-8">
                      <h3 className="text-xs font-mono opacity-30 flex items-center gap-2">
                        <Globe size={14} /> ENVIRONMENT_VARS
                      </h3>

                      {/* Toggle: RGB Sync */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm">RGB Peripheral Sync</span>
                        <button
                          onClick={() => setRgbEnabled(!rgbEnabled)}
                          className={`w-12 h-6 rounded-full transition-colors relative ${rgbEnabled ? "bg-accent" : "bg-white/10"}`}
                          role="switch"
                          aria-checked={rgbEnabled}
                        >
                          <motion.div
                            layout
                            animate={{ x: rgbEnabled ? 24 : 4 }}
                            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-xl"
                          />
                        </button>
                      </div>

                      {/* Slider: Glitch Intensity */}
                      <div className="space-y-4">
                        <div className="flex justify-between text-xs opacity-50">
                          <span>Glitch Intensity</span>
                          <span>{glitchIntensity}%</span>
                        </div>
                        <input
                          type="range"
                          min="0" max="100"
                          value={glitchIntensity}
                          onChange={(e) => setGlitchIntensity(parseInt(e.target.value))}
                          className="w-full accent-accent bg-white/10 rounded-lg appearance-none h-2 cursor-pointer"
                          aria-label="Glitch intensity slider"
                        />
                      </div>

                      {/* Segmented Control: Cursor Mode */}
                      <div className="space-y-4">
                        <span className="text-xs opacity-50">Cursor Manifestation</span>
                        <div className="grid grid-cols-2 gap-2">
                          {["default", "gravity", "invert", "ghost"].map((mode) => (
                            <button
                              key={mode}
                              onClick={() => setCursorMode(mode)}
                              className={`px-4 py-2 rounded-xl text-[10px] uppercase font-bold transition-all ${cursorMode === mode ? "bg-white text-black" : "bg-white/5 hover:bg-white/10"
                                }`}
                              aria-pressed={cursorMode === mode}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Typography Engine */}
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/5 space-y-6">
                      <h3 className="text-xs font-mono opacity-30 flex items-center gap-2">
                        <Type size={14} /> TYPOGRAPHY_ENGINE
                      </h3>
                      <div className="flex flex-col gap-2">
                        {["modern", "mono", "serif"].map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setFontMode(mode)}
                            className={`p-4 rounded-2xl flex justify-between items-center transition-all border ${fontMode === mode
                              ? "bg-white/10 border-white/20"
                              : "bg-transparent border-transparent opacity-40 hover:opacity-100 hover:border-white/10"
                              }`}
                            aria-pressed={fontMode === mode}
                          >
                            <span className="text-sm font-bold uppercase tracking-widest">{mode}</span>
                            <Eye size={16} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Widgets Grid (Componentes externos) */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex justify-center"><CalendarWidget /></div>
                      <div className="flex justify-center"><WeatherWidget /></div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* PESTAÑA 3: ADVANCED (Ajustes Profundos)   */}
              {/* ========================================== */}
              {activeTab === "advanced" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Performance Mode */}
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                    <span className="text-[10px] font-mono opacity-30">PERFORMANCE_MODE</span>
                    <div className="flex gap-2">
                      {["max", "eco", "safe"].map(m => (
                        <button
                          key={m}
                          onClick={() => setPerfMode(m)}
                          className={`flex-1 py-2 rounded-xl text-[10px] uppercase font-bold transition-all ${perfMode === m ? "bg-accent text-black" : "bg-white/5 hover:bg-white/10"
                            }`}
                          aria-pressed={perfMode === m}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggles Reutilizables (Motion Blur, Scanlines, Auto-Save, VRAM) */}
                  <ToggleSetting
                    label="MOTION_BLUR"
                    isActive={motionBlur}
                    onToggle={() => setMotionBlur(!motionBlur)}
                  />
                  <ToggleSetting
                    label="CRT_SCANLINES"
                    isActive={scanlines}
                    onToggle={() => setScanlines(!scanlines)}
                  />
                  <ToggleSetting
                    label="AUTO_SAVE_PROTOCOL"
                    isActive={autoSave}
                    onToggle={() => setAutoSave(!autoSave)}
                    activeColor="bg-green-500"
                  />
                  <ToggleSetting
                    label="VRAM_OPTIMIZED"
                    isActive={vramOptimized}
                    onToggle={() => setVramOptimized(!vramOptimized)}
                  />

                  {/* Particle Density Slider */}
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                    <div className="flex justify-between text-[10px] font-mono opacity-30">
                      <span>PARTICLE_DENSITY</span>
                      <span>{particleDensity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0" max="100"
                      value={particleDensity}
                      onChange={e => setParticleDensity(parseInt(e.target.value))}
                      className="w-full h-1 accent-accent bg-white/10 appearance-none rounded-full cursor-pointer"
                    />
                  </div>

                  {/* Sound Profile */}
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                    <span className="text-[10px] font-mono opacity-30">SOUND_PROFILE</span>
                    <div className="grid grid-cols-2 gap-2">
                      {["cyber", "clean", "mute", "retro"].map(s => (
                        <button
                          key={s}
                          onClick={() => setSoundProfile(s)}
                          className={`py-2 rounded-xl text-[10px] uppercase font-bold transition-all ${soundProfile === s ? "bg-accent text-black" : "bg-white/5 hover:bg-white/10"
                            }`}
                          aria-pressed={soundProfile === s}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Firewall Level */}
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                    <span className="text-[10px] font-mono opacity-30">FIREWALL_LEVEL</span>
                    <div className="flex gap-2">
                      {["strict", "open"].map(l => (
                        <button
                          key={l}
                          onClick={() => setFirewallLevel(l)}
                          className={`flex-1 py-2 rounded-xl text-[10px] uppercase font-bold transition-all ${firewallLevel === l ? "bg-red-500 text-white" : "bg-white/5 hover:bg-white/10"
                            }`}
                          aria-pressed={firewallLevel === l}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Kernel Version */}
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                    <span className="text-[10px] font-mono opacity-30">KERNEL_VERSION</span>
                    <div className="flex gap-2">
                      {["beta", "stable"].map(v => (
                        <button
                          key={v}
                          onClick={() => setKernelVersion(v)}
                          className={`flex-1 py-2 rounded-xl text-[10px] uppercase font-bold transition-all ${kernelVersion === v ? "bg-white text-black" : "bg-white/5 hover:bg-white/10"
                            }`}
                          aria-pressed={kernelVersion === v}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Experimental Feature */}
                  <div className="p-6 rounded-3xl bg-white/10 border border-accent/20 flex justify-between items-center group cursor-help" title="Experimental Feature: Not yet implemented">
                    <span className="text-[10px] font-mono text-accent">GRAVITY_PHYSICS</span>
                    <div className="w-4 h-4 rounded-full bg-accent animate-ping opacity-20" />
                  </div>

                  {/* Emergency Lockdown */}
                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("trigger-glitch"));
                      setIsOpen(false);
                    }}
                    className="p-6 rounded-3xl bg-red-500/20 border border-red-500/30 text-red-500 font-bold uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 group"
                  >
                    <Shield size={14} className="group-hover:scale-110 transition-transform" />
                    Emergency Lockdown
                  </button>

                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center">
                    <span className="text-[10px] font-mono opacity-20 italic">More protocols coming soon...</span>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* PESTAÑA 4: TOOLS (Utilidades)             */}
              {/* ========================================== */}
              {activeTab === "tools" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Media Player (Componente externo) */}
                  <div className="lg:col-span-2 p-8 rounded-3xl bg-white/5 border border-white/5">
                    <h3 className="text-xs font-mono opacity-30 flex items-center gap-2 mb-8">
                      <Music size={14} /> AUDIO_PROCESSING
                    </h3>
                    <MusicPlayer />
                  </div>

                  {/* Multi-Clock Utility */}
                  <div className="p-8 rounded-3xl bg-white/5 border border-white/5 space-y-6">
                    <h3 className="text-xs font-mono opacity-30 flex items-center gap-2">
                      <Clock size={14} /> MULTI_CLOCK
                    </h3>
                    <div className="space-y-4">
                      {/* MEJORA: Uso de Intl.DateTimeFormat en lugar de matemáticas de milisegundos, 
                          lo que garantiza que el horario de verano (DST) se calcule correctamente */}
                      <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <span className="text-[10px] opacity-40">UTC</span>
                        <span className="font-mono text-xl">{getWorldTime('UTC')}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <span className="text-[10px] opacity-40">TOKYO</span>
                        <span className="font-mono text-xl">{getWorldTime('Asia/Tokyo')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] opacity-40">NEW YORK</span>
                        <span className="font-mono text-xl">{getWorldTime('America/New_York')}</span>
                      </div>
                    </div>
                  </div>

                  {/* System Log Console */}
                  <div className="lg:col-span-3 p-6 rounded-3xl bg-black/40 border border-white/5 font-mono text-[10px] text-accent/60 h-48 overflow-hidden relative">
                    <div className="absolute top-4 right-6 flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500/50" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                      <div className="w-2 h-2 rounded-full bg-green-500/50" />
                    </div>
                    <div className="animate-pulse mb-2 tracking-[0.2em] text-accent">SYSTEM_CONSOLE [ACTIVE]</div>
                    <div className="space-y-1">
                      <p>{`> Initializing neural kernel... OK`}</p>
                      <p>{`> Checking network redundancy... [8 nodes found]`}</p>
                      <p>{`> Syncing viewport metrics to cloud_edge_v2`}</p>
                      <p>{`> Security protocols verified: 2048-bit AES`}</p>
                      <p>{`> Memory buffer flushed at 0x7FFF043A`}</p>
                      <p className="text-foreground/30">{`> Background worker #4 active (PID: 2841)`}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Componente Auxiliar: Toggle Setting
 * Extraído para evitar la repetición de código en la pestaña "Advanced".
 * Mantiene la consistencia visual y reduce el tamaño del archivo principal.
 */
function ToggleSetting({
  label,
  isActive,
  onToggle,
  activeColor = "bg-accent"
}: {
  label: string;
  isActive: boolean;
  onToggle: () => void;
  activeColor?: string;
}) {
  return (
    <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex justify-between items-center">
      <span className="text-[10px] font-mono opacity-30">{label}</span>
      <button
        onClick={onToggle}
        className={`w-10 h-5 rounded-full relative transition-colors ${isActive ? activeColor : "bg-white/10"}`}
        role="switch"
        aria-checked={isActive}
        aria-label={`Toggle ${label}`}
      >
        <motion.div
          layout
          animate={{ x: isActive ? 22 : 2 }}
          className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
        />
      </button>
    </div>
  );
}