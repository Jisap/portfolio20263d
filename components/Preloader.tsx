"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PreloaderProps {
  progress: number; // 0 to 100
  isLoading: boolean;
}

export default function Preloader({ progress, isLoading }: PreloaderProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="preloader"
          initial={{ y: 0 }}
          exit={{ y: "-100vh" }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#0a0a0a] text-white"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex flex-col items-center">

            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-[10vw] md:text-[8rem] font-bold tracking-tighter leading-none"
              >
                {Math.round(progress)}%
              </motion.h1>
            </div>

            <div className="w-48 md:w-64 h-[2px] bg-white/20 mt-8 overflow-hidden">
              <motion.div
                className="h-full bg-white"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            <p className="mt-6 text-white/50 text-sm tracking-[0.3em] uppercase">
              Initializing Experience
            </p>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}