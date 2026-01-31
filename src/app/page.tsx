"use client";

import { useEffect } from "react";
import { Header } from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";
import { WhyVerity } from "@/components/landing/why-verity";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { Footer } from "@/components/landing/footer";
import { useAuth } from "@/contexts/auth-context";

export default function HomePage() {
  const { openLoginModal } = useAuth();

  useEffect(() => {
    const handleOpenModal = () => openLoginModal();
    document.addEventListener('open-login-modal', handleOpenModal);
    return () => document.removeEventListener('open-login-modal', handleOpenModal);
  }, [openLoginModal]);

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
