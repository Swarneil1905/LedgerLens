import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { LogoStrip } from "@/components/landing/LogoStrip";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { DataSourcesSection } from "@/components/landing/DataSourcesSection";
import { DemoSection } from "@/components/landing/DemoSection";
import { PrinciplesSection } from "@/components/landing/PrinciplesSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <LogoStrip />
        <FeaturesSection />
        <HowItWorksSection />
        <DataSourcesSection />
        <DemoSection />
        <PrinciplesSection />
        <StatsSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
