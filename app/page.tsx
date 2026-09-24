"use client";

import dynamic from "next/dynamic";
import Header from "@/components/Header";

const ScrollyCanvas = dynamic(() => import("@/components/ScrollyCanvas"), { ssr: false });

import ClientOnly from "@/components/ClientOnly";

import About from "@/components/About";
import XRayText from "@/components/XRayText";
import HorizontalProjects from "@/components/HorizontalProjects";
import Footer from "@/components/Footer";
import GlitchSection from "@/components/GlitchSection";
import Experience from "@/components/Experience";
import WaveDivider from "@/components/WaveDivider";
import { LabGrid, FAQ } from "@/components/AdditionalSections";
import { CalendarWidget, WeatherWidget } from "@/components/Widgets";
import GithubProfile from "@/components/GithubProfile";

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