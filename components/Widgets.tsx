"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Cloud, Sun, CloudRain, Wind } from "lucide-react";

export function CalendarWidget() {
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    return (
        <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="glass p-4 rounded-2xl flex flex-col items-center gap-2 shadow-2xl w-32"
        >
            <span className="text-[10px] font-mono text-red-500 uppercase tracking-widest font-bold">
                {date.toLocaleDateString("en-US", { month: 'short' })}
            </span>
            <span className="text-4xl font-black text-foreground leading-none">
                {date.getDate()}
            </span>
            <span className="text-[10px] font-mono text-foreground/30 uppercase tracking-tighter">
                {date.toLocaleDateString("en-US", { weekday: 'long' })}
            </span>
        </motion.div>
    );
}

export function WeatherWidget() {
    return (
        <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="glass p-4 rounded-2xl flex flex-col items-center gap-2 shadow-2xl w-32"
        >
            <div className="text-accent">
                <Cloud size={24} className="animate-bounce" />
            </div>
            <span className="text-2xl font-black text-foreground leading-none">
                24°C
            </span>
            <div className="flex items-center gap-1 text-[10px] font-mono text-foreground/30 uppercase tracking-tighter">
                <Wind size={10} />
                <span>Kolkata</span>
            </div>
        </motion.div>
    );
}