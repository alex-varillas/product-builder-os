import "./landing.css";

import { LanguageProvider } from "@/components/landing/LanguageContext";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { EverythingYouNeed } from "@/components/landing/EverythingYouNeed";
import { Workspace } from "@/components/landing/Workspace";
import { PerProject } from "@/components/landing/PerProject";
import { Steps } from "@/components/landing/Steps";
import { OpenSource } from "@/components/landing/OpenSource";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { LanguageToggle } from "@/components/landing/LanguageToggle";

export default function LandingPage() {
  return (
    <LanguageProvider>
      <ScrollReveal />
      <Navbar />
      <main>
        <Hero />
        <EverythingYouNeed />
        <Workspace />
        <PerProject />
        <Steps />
        <OpenSource />
        <FinalCta />
      </main>
      <Footer />
      <div className="lang-float">
        <LanguageToggle />
      </div>
    </LanguageProvider>
  );
}
