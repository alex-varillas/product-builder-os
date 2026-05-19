import "./landing.css";

import { LanguageProvider } from "@/components/landing/LanguageContext";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { Modules } from "@/components/landing/Modules";
import { Steps } from "@/components/landing/Steps";
import { OpenSource } from "@/components/landing/OpenSource";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";
import { ScrollReveal } from "@/components/landing/ScrollReveal";

export default function LandingPage() {
  return (
    <LanguageProvider>
      <ScrollReveal />
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Modules />
        <Steps />
        <OpenSource />
        <FinalCta />
      </main>
      <Footer />
    </LanguageProvider>
  );
}
