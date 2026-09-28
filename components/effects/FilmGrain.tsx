/**
 * Textura de grano de película superpuesta sobre toda la ventana.
 *
 * Genera el ruido con un filtro SVG (`feTurbulence`), sin imágenes externas.
 * Estático, no bloquea clics y se monta una sola vez (normalmente en el layout raíz).
 */
export default function FilmGrain() {
    // Funcionamiento:
    // 1. Contenedor: <div fixed inset-0> cubre toda la ventana. pointer-events-none
    //    evita que bloquee clics; z-[9999] lo mantiene por encima del resto del contenido.
    // 2. Ruido SVG: viewBox="0 0 200 200" es el lienzo de referencia, independiente
    //    del tamaño real en pantalla (h-full w-full lo estira al 100%).
    // 3. Filtro feTurbulence:
    //    - type="fractalNoise": ruido procedural basado en fractales.
    //    - baseFrequency="0.85": a mayor valor, grano más fino y denso.
    //    - numOctaves="3": capas de ruido combinadas para más detalle.
    //    - stitchTiles="stitch": evita costuras en los bordes del patrón.
    // 4. Aplicación: un <rect> a pantalla completa recibe el filtro.
    // 5. Opacidad: opacity-40 (svg) x opacity-30 (div) = 12% efectivo.
    //    Probablemente no sea intencionado tener ambas por separado.
    // 6. Mezcla: mix-blend-overlay oscurece zonas claras y aclara zonas oscuras
    //    en vez de superponer una capa plana de gris.

    return (
        <div className="pointer-events-none fixed inset-0 z-[9999] h-full w-full opacity-30 mix-blend-overlay">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="h-full w-full opacity-40">
                <filter id="noiseFilter">
                    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
                </filter>
                <rect width="100%" height="100%" filter="url(#noiseFilter)" />
            </svg>
        </div>
    );
}