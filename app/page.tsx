"use client";

import dynamic from "next/dynamic";
import Header from "@/components/ui/Header";

const ScrollyCanvas = dynamic(() => import("@/components/sections/ScrollyCanvas"), { ssr: false });

import ClientOnly from "@/components/providers/ClientOnly";

import About from "@/components/sections/About";
import XRayText from "@/components/sections/XRayText";
import HorizontalProjects from "@/components/sections/HorizontalProjects";
import Footer from "@/components/sections/Footer";
import GlitchSection from "@/components/ui/GlitchSection";
//import Experience from "@/components/Experience";
import WaveDivider from "@/components/ui/WaveDivider";
import { LabGrid, FAQ } from "@/components/sections/AdditionalSections";
import { CalendarWidget, WeatherWidget } from "@/components/ui/Widgets";
import GithubProfile from "@/components/sections/GithubProfile";

export default function Home() {
  return (
    <main className="w-full bg-[#121212]">
      <div id="hero" className="relative min-h-screen">
        <Header />
        <ClientOnly>
          <ScrollyCanvas />
        </ClientOnly>
      </div>



      <ClientOnly>
        <div className="relative z-10">
          <GlitchSection>
            <About />
          </GlitchSection>

          <WaveDivider />

          <GlitchSection delay={200}>
            <XRayText />
          </GlitchSection>

          <WaveDivider />



          <HorizontalProjects />

          <WaveDivider />

          <GithubProfile />

          <WaveDivider />

          <FAQ />

          <WaveDivider />

          <GlitchSection>
            <Footer />
          </GlitchSection>
        </div>
      </ClientOnly>
    </main>
  );
}