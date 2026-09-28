"use client";

// ============================================================================
// ParticleFooter.tsx
// ----------------------------------------------------------------------------
// Fondo animado de partículas para el Footer (canvas 2D puro, sin librerías).
//
// Qué hace:
// - Dibuja 100 partículas blancas tenues a la deriva.
// - Las partículas huyen suavemente del cursor en un radio de 100px
//   y se iluminan al acercarse.
// - Efecto wrap-around: al salir por un borde reaparecen por el opuesto.
// - Se adapta al tamaño del contenedor en `resize`.
//
// Rendimiento / ciclo de vida:
// - Un solo `useEffect` monta el loop `requestAnimationFrame`.
// - Escucha `mousemove` y `resize` en window y los limpia al desmontar.
// - El canvas es `pointer-events-none` para no bloquear clics del footer.
// ============================================================================

import React, { useEffect, useRef } from "react";

/**
 * ParticleFooter — canvas absoluto que cubre todo el footer.
 *
 * @returns Elemento `<canvas>` a pantalla del contenedor padre.
 */
export default function ParticleFooter() {
    // Referencia directa al canvas para dibujar con la API 2D.
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Montaje del sistema de partículas (solo una vez).
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Colección viva de partículas.
        let particles: Particle[] = [];
        // Número fijo de partículas en escena.
        const particleCount = 100;
        // Dimensiones internas = tamaño visual actual del canvas.
        let w = canvas.width = canvas.offsetWidth;
        let h = canvas.height = canvas.offsetHeight;

        // Representa un punto a la deriva con velocidad y brillo propios.
        class Particle {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            color: string;

            constructor() {
                // Posición inicial aleatoria dentro del canvas.
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                // Radio entre 0.5 y 2px.
                this.size = Math.random() * 1.5 + 0.5;
                // Velocidad lenta en cualquier dirección (-0.25 a 0.25).
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
                // Blanco muy tenue por defecto.
                this.color = "rgba(255, 255, 255, 0.1)";
            }

            // Mueve la partícula, aplica wrap de bordes y repulsión del ratón.
            update(mouseX: number, mouseY: number) {
                this.x += this.speedX;
                this.y += this.speedY;

                // Wrap-around toroidal: salir por un lado = entrar por el otro.
                if (this.x > w) this.x = 0;
                else if (this.x < 0) this.x = w;
                if (this.y > h) this.y = 0;
                else if (this.y < 0) this.y = h;

                // Mouse interaction
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 100) {
                    // Fuerza 0→1 según cercanía: empuja fuera y aumenta alpha.
                    const force = (100 - distance) / 100;
                    this.x -= dx * force * 0.05;
                    this.y -= dy * force * 0.05;
                    this.color = `rgba(255, 255, 255, ${0.1 + force * 0.3})`;
                } else {
                    this.color = "rgba(255, 255, 255, 0.1)";
                }
            }

            // Dibuja el punto como círculo relleno en el contexto 2D.
            draw() {
                if (!ctx) return;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // (Re)crea las N partículas desde cero.
        const init = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        // Posición del ratón en coordenadas del canvas.
        // Inicia fuera de pantalla para no atraer partículas al cargar.
        let mouseX = -1000;
        let mouseY = -1000;

        // Convierte coords de ventana a coords locales del canvas.
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        };

        // Bucle principal: limpia, actualiza y dibuja cada frame.
        const animate = () => {
            ctx.clearRect(0, 0, w, h);
            particles.forEach((p) => {
                p.update(mouseX, mouseY);
                p.draw();
            });
            requestAnimationFrame(animate);
        };

        // Suscripciones + arranque.
        window.addEventListener("mousemove", handleMouseMove);
        init();
        animate();

        // En resize: sincroniza resolución interna y regenera partículas
        // para redistribuirlas en el nuevo tamaño.
        const handleResize = () => {
            w = canvas.width = canvas.offsetWidth;
            h = canvas.height = canvas.offsetHeight;
            init();
        };
        window.addEventListener("resize", handleResize);

        // Cleanup: evita listeners duplicados en remontajes (StrictMode).
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // Canvas absoluto no interactivo detrás del contenido del footer.
    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}
