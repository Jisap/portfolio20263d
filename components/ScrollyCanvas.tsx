"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, useVelocity, useSpring } from "framer-motion";
import { useTheme } from "./ThemeContext";
import Overlay from "./Overlay";
import Preloader from "./Preloader";

/** Número total de fotogramas de la secuencia (del 0 al 119). */
const FRAME_COUNT = 120; // 0 to 119

/**
 * Convierte el índice de un fotograma en su sufijo numérico de tres cifras.
 * Ejemplo: `getFrameString(7)` devuelve `"007"`.
 *
 * @param index Índice del fotograma (0 a `FRAME_COUNT - 1`).
 * @returns Índice rellenado con ceros a la izquierda.
 */
const getFrameString = (index: number) => {
    return index.toString().padStart(3, "0");
};

/**
 * Animación cinematográfica controlada por scroll ("scrollytelling").
 *
 * Reproduce una secuencia de 120 imágenes sobre un `<canvas>` a pantalla completa:
 * el fotograma que se dibuja depende de la posición del scroll, de modo que al bajar
 * la página la animación avanza y al subir retrocede.
 *
 * Funcionamiento:
 * 1. **Precarga:** al montar, se cargan los 120 fotogramas desde
 *    `/sequence/frame_XXX_delay-0.066s.webp` (carpeta `public/sequence`). Mientras tanto
 *    se muestra el `Preloader` con el porcentaje de carga.
 * 2. **Scroll a fotograma:** el contenedor mide `500vh` y contiene un bloque `sticky` de
 *    una pantalla. `useScroll` da el progreso (0 a 1) de todo el contenedor y
 *    `useTransform` lo convierte en un índice de fotograma (0 a 119).
 * 3. **Dibujo:** cuando cambia el índice, se dibuja la imagen correspondiente en el canvas
 *    con un ajuste tipo `object-fit: cover` (se escala para cubrir todo el canvas y se
 *    recorta lo que sobra, centrado).
 * 4. **Redimensionado:** el canvas se ajusta al tamaño de la ventana y se vuelve a
 *    dibujar el fotograma actual. Este mismo efecto dibuja el primer fotograma cuando
 *    terminan de cargarse las imágenes (se vuelve a ejecutar al cambiar `images`).
 * 5. **Efecto de textura reactivo:** una capa de fibra de carbono con `mix-blend-overlay`
 *    cambia de opacidad según la velocidad del scroll (suavizada con un muelle): es
 *    invisible con el scroll parado y aparece hasta un 30 % al desplazarse rápido.
 * 6. **Aparición:** al terminar la carga, el canvas hace un fundido de entrada y se lanza
 *    el evento global `notify`.
 *
 * Requisitos:
 * - Client Component (`"use client"`): usa canvas, `window` y hooks.
 * - Dependencias: `react` y `framer-motion`.
 * - Componentes locales: `Overlay` (recibe `scrollYProgress`), `Preloader`
 *   (recibe `progress` e `isLoading`) y `useTheme` de `ThemeContext`.
 * - Los 120 fotogramas en `public/sequence/`, con el nombre
 *   `frame_000_delay-0.066s.webp` ... `frame_119_delay-0.066s.webp`.
 * - Tailwind CSS con el color `background` definido.
 *
 * Acoplamiento con otros componentes:
 * - Emite `window.dispatchEvent(new CustomEvent("notify", { detail: { message, type } }))`
 *   al terminar la carga. Debe existir un componente que escuche `notify` para mostrarlo.
 * - La cabecera (`Header`) aparece tras 4,4 pantallas de scroll, es decir, poco después
 *   de que esta secuencia termine. Si cambias la altura de `500vh` o `FRAME_COUNT`,
 *   revisa ese umbral.
 *
 * Observaciones y posibles mejoras:
 * - **Variable sin usar:** `settings` de `useTheme()` se obtiene pero no se utiliza.
 * - **Estilo sin efecto:** la transición de `filter` no hace nada, porque no se aplica
 *   ningún filtro. Además, `object-cover` no afecta a un canvas (el recorte se calcula a mano).
 * - **Progreso de carga:** se calcula con el índice del último fotograma cargado, no con el
 *   número de fotogramas cargados. Como las cargas terminan en orden distinto, el porcentaje
 *   puede subir y bajar. Un contador incremental sería más fiable.
 * - **Fotogramas con error:** si uno falla, se sustituye por una imagen vacía y la secuencia
 *   sigue, pero ese punto de scroll puede quedar en blanco.
 * - **Nitidez:** el canvas usa `innerWidth`/`innerHeight` sin multiplicar por
 *   `devicePixelRatio`, por lo que en pantallas de alta densidad puede verse algo borroso.
 * - **Memoria y red:** se cargan y decodifican los 120 fotogramas antes de mostrar nada.
 *   En móviles o conexiones lentas puede pesar mucho.
 * - **Dependencia externa:** la textura de fibra de carbono se descarga de
 *   `transparenttextures.com`. Sin conexión o si el servicio cae, la capa no se verá.
 * - **Accesibilidad:** el canvas no tiene texto alternativo y no se respeta
 *   `prefers-reduced-motion`.
 *
 * @example
 * // app/page.tsx
 * import ScrollyCanvas from "@/components/ScrollyCanvas";
 *
 * export default function Home() {
 *   return (
 *     <main>
 *       <ScrollyCanvas />
 *       {/* ...resto de secciones *\/}
 *     </main>
 *   );
 * }
 *
 * @returns {JSX.Element} Contenedor de `500vh` con el canvas sticky, la textura, el `Overlay` y el `Preloader`.
 */
export default function ScrollyCanvas() {
    /** Contenedor de `500vh`; es el objetivo de `useScroll`. */
    const containerRef = useRef<HTMLDivElement>(null);

    /** Canvas donde se dibuja el fotograma actual. */
    const canvasRef = useRef<HTMLCanvasElement>(null);

    /** Fotogramas ya cargados, en orden (posición = índice del fotograma). */
    const [images, setImages] = useState<HTMLImageElement[]>([]);

    /** `true` cuando todos los fotogramas han terminado de cargar (con éxito o con error). */
    const [imagesLoaded, setImagesLoaded] = useState(false);

    /** Porcentaje de carga (0-100) que se pasa al `Preloader`. */
    const [loadingProgress, setLoadingProgress] = useState(0);

    /** Opacidad del canvas (0 o 1), para el fundido de entrada tras la carga. */
    const [canvasOpacity, setCanvasOpacity] = useState(0);

    /**
     * Progreso de scroll (0 a 1) de todo el contenedor: empieza cuando su borde superior
     * llega al borde superior de la pantalla y termina cuando su borde inferior llega al inferior.
     */
    const { scrollYProgress } = useScroll({

        target: containerRef,
        offset: ["start start", "end end"],
    });

    /** Ajustes del tema (actualmente sin uso en este componente). */
    const { settings } = useTheme();

    /** Índice de fotograma (0 a 119, con decimales) derivado del progreso de scroll. */
    const frameIndex = useTransform(scrollYProgress, [0, 1], [0, FRAME_COUNT - 1]);


    /** Velocidad de cambio del progreso de scroll (unidades de progreso por segundo). */
    const scrollVelocity = useVelocity(scrollYProgress);

    /** Velocidad suavizada con un muelle, para evitar saltos bruscos en el efecto visual. */
    const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });

    /**
     * Opacidad de la textura: 0 con el scroll parado y hasta 0,3 con velocidad ±2
     * (sube igual al bajar que al subir). Al aplicarse como `style`, prevalece sobre
     * la clase `opacity-20` del elemento.
     */
    const glitchOpacity = useTransform(smoothVelocity, [-2, 0, 2], [0.3, 0, 0.3]);

    /**
     * Precarga de la secuencia (solo al montar).
     * Carga los 120 fotogramas en paralelo con `Promise.all`; al terminar guarda las
     * imágenes, marca la carga como completa, hace aparecer el canvas y emite el
     * evento `notify`.
     */
    useEffect(() => {

        /**
         * Carga un fotograma. Nunca rechaza: si falla, registra el error y devuelve una
         * imagen vacía para no bloquear el resto de la carga.
         */
        const loadImage = (index: number): Promise<HTMLImageElement> => {

            return new Promise((resolve) => {
                const img = new Image();
                img.src = `/sequence/frame_${getFrameString(index)}_delay-0.066s.webp`;
                img.onload = () => {
                    setLoadingProgress(Math.round(((index + 1) / FRAME_COUNT) * 100));
                    resolve(img);
                };
                img.onerror = () => {
                    console.error(`Failed to load frame ${index}`);
                    resolve(new Image());
                };
            });
        };

        const loadAllImages = async () => {
            try {
                const loadedImages = await Promise.all(
                    Array.from({ length: FRAME_COUNT }).map((_, i) => loadImage(i))
                );
                setImages(loadedImages);
                setImagesLoaded(true);
                // Pequeño retraso para que el fundido de entrada sea visible
                setTimeout(() => setCanvasOpacity(1), 100);
                window.dispatchEvent(new CustomEvent("notify", {
                    detail: { message: "Cinematic Protocol Active", type: "success" }
                }));

            } catch (err) {
                console.error("Critical error loading cinematic frames:", err);
            }
        };

        loadAllImages();
    }, []);

    /**
     * Dibuja una imagen en el canvas ajustándola para cubrirlo por completo
     * (equivalente a `object-fit: cover`) y centrándola.
     *
     * - Si el canvas es más ancho que la imagen (proporción), se ajusta al ancho y se
     *   recorta arriba y abajo.
     * - En caso contrario, se ajusta al alto y se recorta a los lados.
     *
     * @param img Fotograma que se va a dibujar.
     */
    const renderCanvas = (img: HTMLImageElement) => {
        const canvas = canvasRef.current;
        if (!canvas || !img) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const canvasAspect = canvas.width / canvas.height;
        const imgAspect = img.width / img.height;
        let drawWidth, drawHeight, offsetX, offsetY;

        if (canvasAspect > imgAspect) {
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgAspect;
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
        } else {
            drawWidth = canvas.height * imgAspect;
            drawHeight = canvas.height;
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = 0;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    /**
     * Se ejecuta cada vez que cambia el índice de fotograma (es decir, al hacer scroll).
     * Redondea el valor y dibuja el fotograma correspondiente si ya está cargado.
     * Al usar un evento de `MotionValue`, no provoca re-renders de React.
     */
    useMotionValueEvent(frameIndex, "change", (latest) => {
        const index = Math.round(latest);
        if (images[index]) {
            renderCanvas(images[index]);
        }
    });

    /**
     * Ajusta el tamaño del canvas a la ventana y redibuja el fotograma actual.
     * Se ejecuta al montar, al redimensionar y cada vez que cambia `images`, lo que
     * también dibuja el primer fotograma cuando termina la precarga.
     */
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
                const index = Math.round(frameIndex.get());
                if (images[index]) renderCanvas(images[index]);
            }
        };
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, [images]);

    return (
        // Contenedor alto (500vh): su altura define cuánto scroll dura la animación
        <div ref={containerRef} className="relative h-[500vh] w-full bg-background">
            {/* Bloque sticky: se queda fijo en pantalla mientras se recorre el contenedor */}
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                {/* Canvas con fundido de entrada controlado por `canvasOpacity` */}
                <canvas
                    ref={canvasRef}
                    style={{
                        transition: "filter 0.5s ease, opacity 1s ease",
                        opacity: canvasOpacity
                    }}
                    className="block h-full w-full object-cover"
                />

                {/* Textura de fibra de carbono cuya opacidad depende de la velocidad del scroll */}
                <motion.div
                    style={{ opacity: glitchOpacity }}
                    className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay pointer-events-none"
                />

                {/* Contenido superpuesto que reacciona al progreso de scroll */}
                <Overlay scrollYProgress={scrollYProgress} />

                {/* Pantalla de carga: visible hasta que se cargan todos los fotogramas */}
                <Preloader progress={loadingProgress} isLoading={!imagesLoaded} />
            </div>
        </div>
    );
}