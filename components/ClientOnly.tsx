"use client";

import { useEffect, useState } from "react";

// En este comonente su uso principal es evitar errores de hidratación (hydration mismatch) 
// cuando un fragmento de la interfaz depende de APIs o datos que solo existen en el navegador.

// Funcionamiento
//  1º En el primer render (servidor y cliente), hasMounted es false y el componente devuelve null. El HTML generado por el servidor coincide con el de la hidratación, así que no hay desajustes.
//  2º Tras el montaje, useEffect se ejecuta (los efectos nunca se ejecutan en el servidor) y cambia hasMounted a true.
//  3º Se produce un segundo render que sí devuelve children dentro de un fragmento.

export default function ClientOnly({ children }: { children: React.ReactNode }) {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) return null;

    return <>{children}</>;
}