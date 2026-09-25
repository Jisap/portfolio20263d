
/**
 * 
 * Descripción
 *
 * Componente decorativo que superpone una textura de grano de película (ruido) sobre toda la ventana.
 * Usa un filtro SVG (feTurbulence) para generar el ruido de forma procedural, sin necesidad de ninguna imagen externa.
 * No recibe props ni tiene estado: es un componente puramente presentacional y estático.
 * 
 * Funcionamiento
 * 1º Contenedor: un <div> con fixed inset-0 cubre toda la ventana, pointer-events-none para no bloquear clics ni interacciones, 
 *    y z-[9999] para quedar por encima del resto del contenido.
 * 2º Ruido SVG: el <svg> usa viewBox="0 0 200 200" como lienzo de referencia, independiente del tamaño real en pantalla (que ocupa el 100 % gracias a h-full w-full).
 * 3º Filtro feTurbulence: genera el ruido con estos parámetros:
 *     - type="fractalNoise": tipo de ruido procedural basado en fractales.
 *     - baseFrequency="0.85": frecuencia base del ruido. Un valor más alto produce ruido más fino y denso.
 *     - numOctaves="3": número de capas (octavas) de ruido que se combinan para aumentar la riqueza y el detalle.
 *     - stitchTiles="stitch": asegura que el patrón se repita sin cortes bruscos en los bordes del SVG (aunque aquí no es crítico ya que el SVG siempre será menor o igual al viewport).
 * 4º Aplicación del filtro: un <rect> que ocupa todo el SVG recibe el filtro, generando ruido en escala de grises 
 *    (con algo de color, ya que feTurbulence produce cuatro canales).
 * 5º Capas de opacidad: hay dos opacidades combinadas: opacity-40 en el <svg> y opacity-30 en el <div> contenedor, 
 *    lo que da una opacidad efectiva del 12 % (0.4 × 0.3). Probablemente no sea intencionado tener ambas.
 * 6º Mezcla: mix-blend-overlay combina el ruido con el contenido de debajo, oscureciendo las zonas claras y aclarando las oscuras, 
 *    en lugar de superponer una capa plana de gris.
 * 
 */


export default function FilmGrain() {
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