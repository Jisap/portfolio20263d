"use client";

import React from "react";
import { motion } from "framer-motion";

export default function WaveDivider() {
    return (
        <div className="relative w-full h-24 overflow-hidden -mt-12 z-20 pointer-events-none">
            <svg
                className="absolute bottom-0 w-[200%] h-full opacity-10"
                viewBox="0 0 1000 100"
                preserveAspectRatio="none"
            >
                <motion.path
                    initial={{ d: "M0,50 C250,100 500,0 750,50 C1000,100 1250,0 1500,50 L1500,100 L0,100 Z" }}
                    animate={{
                        d: [
                            "M0,50 C250,100 500,0 750,50 C1000,100 1250,0 1500,50 L1500,100 L0,100 Z",
                            "M0,50 C250,0 500,100 750,50 C1000,0 1250,100 1500,50 L1500,100 L0,100 Z",
                            "M0,50 C250,100 500,0 750,50 C1000,100 1250,0 1500,50 L1500,100 L0,100 Z"
                        ]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    fill="white"
                />
            </svg>
        </div>
    );
}