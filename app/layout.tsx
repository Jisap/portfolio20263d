import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";
import CustomCursor from "@/components/CustomCursor";
import FilmGrain from "@/components/FilmGrain";
import Terminal from "@/components/Terminal";
import AudioManager from "@/components/AudioManager";
import CommandPalette from "@/components/CommandPallete";
import KonamiGravity from "@/components/KonamiGravity";
import ConsoleArt from "@/components/ConsoleArt";
import TabManager from "@/components/TabManager";
import BinaryScroll from "@/components/BinaryScroll";
import AmbientGlow from "@/components/AmbientGlow";
import ContextMenu from "@/components/ContextMenu";
import Scanlines from "@/components/Scanlines";
import ScrollIndicator from "@/components/ScrollIndicator";
import ScrollPath from "@/components/ScrollPath";
import MatrixRain from "@/components/MatrixRain";
import AmbientVisualizer from "@/components/AmbientVisualizer";
import ZenMode from "@/components/ZenMode";
import { ThemeProvider } from "@/components/ThemeContext";
import SettingsPanel from "@/components/SettingsPanel";
import Dock from "@/components/Dock";
import PageLoader from "@/components/PageLoader";
import PixelBackground from "@/components/PixelBackground";
import ClickParticles from "@/components/ClickParticles";
import WindowManager from "@/components/WindowManager";
import Notifications from "@/components/Notifications";
import SystemDashboard from "@/components/SystemDashboard";
import BrowserApp from "@/components/BrowserApp";
import ClientOnly from "@/components/ClientOnly";
import { CornerProgress, ScrollGauge } from "@/components/ScrollGauges";

import { FaviconProgress, RGBGlitch, Connectors } from "@/components/FinalDetails";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jayanta Mondal | BCA Student, Web Developer, AI & Cybersecurity Enthusiast",
  description: "Official portfolio of Jayanta Mondal — BCA student from Kolkata, India. Passionate about Web Development, App Development, AI, DevOps, Cybersecurity, and Cloud Computing. Explore projects, certifications, skills, and tech experiments built with modern technologies.",
  keywords: ["Jayanta Mondal", "Jayanta Dev", "JayantaCodes", "Jayanta Developer", "BCA Student India", "Web Developer Kolkata", "Frontend Developer", "Full Stack Developer", "React Developer", "Next.js Developer", "AI Developer", "Cybersecurity Student", "DevOps Learner", "Cloud Computing", "Portfolio Website", "Indian Student Developer", "Software Developer India"],
  authors: [{ name: "Jayanta Mondal" }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://jayantadev.in",
  },
  openGraph: {
    title: "Jayanta Mondal | Developer Portfolio",
    description: "Explore the portfolio of Jayanta Mondal — student developer building modern web apps, AI projects, cybersecurity experiments, and interactive tech experiences.",
    url: "https://jayantadev.in",
    siteName: "Jayanta Dev Portfolio",
    images: [
      {
        url: "public/Jayanta_Pic.jpg",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jayanta Mondal | Web Developer & Tech Creator",
    description: "BCA student passionate about Web Development, AI, DevOps, Cybersecurity, and modern tech innovation.",
    images: ["public\/Jayanta_Pic.jpg"],
  },
  other: {
    "revisit-after": "7 days",
    "language": "English",
  }
};

export const viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Jayanta Mondal",
              "url": "https://jayantadev.in",
              "image": "https://jayantadev.in/profile.jpg",
              "sameAs": [
                "https://www.linkedin.com/in/jayantadev",
                "https://github.com/jayantadev",
                "https://instagram.com/jayantacodes"
              ],
              "jobTitle": "Web Developer & Student",
              "alumniOf": {
                "@type": "CollegeOrUniversity",
                "name": "EIILM Kolkata"
              },
              "knowsAbout": [
                "Web Development",
                "React",
                "Next.js",
                "Cybersecurity",
                "Artificial Intelligence",
                "DevOps",
                "Cloud Computing"
              ]
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#121212] text-[#ededed]">
        <ThemeProvider>
          <AudioManager>
            <PageLoader />
            <ClientOnly>
              <ZenMode />
              <WindowManager />
              <Notifications />
              <SystemDashboard />
              <BrowserApp />
              <CornerProgress />
              <ScrollGauge />
              <FaviconProgress />
              <RGBGlitch />
              <Connectors />
              <Dock />
            </ClientOnly>
            <PixelBackground />
            <ClickParticles />
            <ConsoleArt />
            <TabManager />
            <AmbientGlow />
            <AmbientVisualizer />
            <FilmGrain />
            <Scanlines />
            <KonamiGravity />
            <BinaryScroll />
            <ScrollIndicator />
            <ScrollPath />
            <MatrixRain />
            <Terminal />
            <CommandPalette />
            <ContextMenu />
            <SettingsPanel />
            <LenisProvider>
              <CustomCursor />
              {children}
            </LenisProvider>
          </AudioManager>
        </ThemeProvider>



      </body>
    </html>
  );
}