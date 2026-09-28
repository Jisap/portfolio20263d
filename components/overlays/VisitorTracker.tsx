"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Monitor, MapPin, Globe, Shield } from "lucide-react";

// Tipado estricto para los datos del visitante
interface VisitorData {
  ip: string;
  browser: string;
  os: string;
  loc: string;
  isLoading: boolean;
}

// Datos de fallback por defecto (se muestran si la API falla o está bloqueada por ad-blockers)
const DEFAULT_DATA: VisitorData = {
  ip: "127.0.0.1 (Protected)",
  browser: "Secure Browser",
  os: "Unknown OS",
  loc: "Local Network",
  isLoading: true,
};

/**
 * Componente de Rastreador de Visitantes (Visitor Tracker).
 * 
 * Muestra información de la sesión actual del usuario (IP, Sistema Operativo, 
 * Navegador y Ubicación aproximada) para reforzar la estética de "Sistema Operativo".
 * 
 * Mejoras arquitectónicas aplicadas respecto al código original:
 * 1. Geolocalización Real por IP: La API `navigator` no puede obtener IP o ciudad. 
 *    Se ha añadido una llamada a una API pública y gratuita (ipwho.is) para obtener 
 *    estos datos de forma pasiva (sin pedir permisos de geolocalización al usuario).
 * 2. Manejo de Errores Robusto: Si la API falla o es bloqueada (ej. por uBlock Origin), 
 *    el componente no se rompe; mantiene los datos de fallback de forma elegante.
 * 3. Detección de Navegador Mejorada: Se usa una heurística más fiable que 
 *    `userAgent.split(" ").pop()` para identificar Chrome, Safari, Firefox, etc.
 * 4. Privacidad: Todo el procesamiento es 100% del lado del cliente. No se envía 
 *    esta información a ningún backend propio, solo se consulta la API de IP.
 */
export default function VisitorTracker() {
  const [data, setData] = useState<VisitorData>(DEFAULT_DATA);

  useEffect(() => {
    // 1. Detección básica de Sistema Operativo y Navegador desde el cliente
    const userAgent = navigator.userAgent;
    let detectedBrowser = "Unknown Browser";

    // Heurística simple pero más fiable que split().pop()
    if (userAgent.includes("Firefox")) detectedBrowser = "Mozilla Firefox";
    else if (userAgent.includes("SamsungBrowser")) detectedBrowser = "Samsung Internet";
    else if (userAgent.includes("Opera") || userAgent.includes("OPR")) detectedBrowser = "Opera";
    else if (userAgent.includes("Trident")) detectedBrowser = "Internet Explorer";
    else if (userAgent.includes("Edge")) detectedBrowser = "Microsoft Edge";
    else if (userAgent.includes("Chrome")) detectedBrowser = "Google Chrome";
    else if (userAgent.includes("Safari")) detectedBrowser = "Apple Safari";

    // Normalización básica del nombre del OS
    let detectedOs = navigator.platform || "Unknown OS";
    if (userAgent.includes("Windows")) detectedOs = "Windows";
    else if (userAgent.includes("Mac")) detectedOs = "macOS";
    else if (userAgent.includes("Linux")) detectedOs = "Linux";
    else if (userAgent.includes("Android")) detectedOs = "Android";
    else if (userAgent.includes("like Mac OS X")) detectedOs = "iOS";

    setData(prev => ({ ...prev, browser: detectedBrowser, os: detectedOs }));

    // 2. Obtención de IP y Ubicación mediante API externa
    // Usamos ipwho.is porque es gratuita, no requiere API Key y tiene CORS habilitado.
    const fetchLocationData = async () => {
      try {
        const response = await fetch("https://ipwho.is/");
        if (!response.ok) throw new Error("Network response was not ok");

        const jsonData = await response.json();

        if (jsonData.success) {
          setData(prev => ({
            ...prev,
            ip: jsonData.ip,
            loc: `${jsonData.city}, ${jsonData.country_code}`,
            isLoading: false,
          }));
        } else {
          throw new Error("API reported failure");
        }
      } catch (error) {
        // Fallo silencioso: es común que bloqueadores de anuncios (AdBlockers) 
        // bloqueen llamadas a APIs de geolocalización. Volvemos al fallback.
        console.warn("VisitorTracker: Could not fetch IP/Location data. Using fallback.", error);
        setData(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchLocationData();
  }, []);

  return (
    <div className="w-full flex flex-col gap-4" role="region" aria-label="Session identity information">
      {/* Cabecera del Widget */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-foreground/30 uppercase tracking-[0.2em] flex items-center gap-2">
          <Shield size={10} /> Session Identity
        </span>
        {/* Indicador de estado: parpadea mientras carga, se queda fijo cuando termina */}
        <div
          className={`w-2 h-2 rounded-full transition-colors duration-500 ${data.isLoading ? "bg-yellow-500 animate-pulse" : "bg-green-500"
            }`}
          aria-label={data.isLoading ? "Loading session data" : "Session data loaded"}
        />
      </div>

      {/* Lista de Datos */}
      <div className="grid grid-cols-1 gap-3">
        {/* IP Address */}
        <div className="flex items-center gap-3 group">
          <Globe size={14} className="text-accent/60 group-hover:text-accent transition-colors" />
          <div className="flex flex-col">
            <span className="text-[8px] font-mono text-foreground/30 uppercase">Protocol IP</span>
            <span className="text-[10px] font-mono text-foreground/80 truncate max-w-[150px]" title={data.ip}>
              {data.ip}
            </span>
          </div>
        </div>

        {/* Operating System */}
        <div className="flex items-center gap-3 group">
          <Monitor size={14} className="text-accent/60 group-hover:text-accent transition-colors" />
          <div className="flex flex-col">
            <span className="text-[8px] font-mono text-foreground/30 uppercase">System OS</span>
            <span className="text-[10px] font-mono text-foreground/80 truncate max-w-[150px]" title={data.os}>
              {data.os}
            </span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-3 group">
          <MapPin size={14} className="text-accent/60 group-hover:text-accent transition-colors" />
          <div className="flex flex-col">
            <span className="text-[8px] font-mono text-foreground/30 uppercase">Location</span>
            <span className="text-[10px] font-mono text-foreground/80 truncate max-w-[150px]" title={data.loc}>
              {data.loc}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}