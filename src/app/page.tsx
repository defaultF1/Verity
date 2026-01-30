"use client";

import { Header } from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";
import { WhyVerity } from "@/components/landing/why-verity";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--color-background-dark)]">
      <Header />
      <HeroSection />
      <WhyVerity />
      <HowItWorks />
      <FeatureGrid />
      <Footer />
    </main>
  );
}
