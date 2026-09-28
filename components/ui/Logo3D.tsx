"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

function LogoMesh() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;
        meshRef.current.rotation.x = state.mouse.y * 0.5;
        meshRef.current.rotation.y = state.mouse.x * 0.5;
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <mesh ref={meshRef}>
                <octahedronGeometry args={[1, 0]} />
                <MeshDistortMaterial
                    color="#ffffff"
                    speed={3}
                    distort={0.4}
                    radius={1}
                    wireframe
                />
            </mesh>
        </Float>
    );
}

export default function Logo3D() {
    return (
        <div className="w-8 h-8 md:w-12 md:h-12">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 3]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <LogoMesh />
            </Canvas>
        </div>
    );
}