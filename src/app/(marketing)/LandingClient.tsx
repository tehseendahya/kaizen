'use client';
import { Hero } from './_components/Hero';
import { Features } from './_components/Features';
import { Stats } from './_components/Stats';
import { FinalCTA } from './_components/FinalCTA';
import { SiteFooter } from './_components/SiteFooter';
import { OnboardingRoot } from './_components/OnboardingRoot';
import { LoginRoot } from './_components/LoginRoot';

export default function LandingClient() {
  return (
    <>
      <Hero />
      <Features />
      <Stats />
      <FinalCTA />
      <SiteFooter />
      <OnboardingRoot />
      <LoginRoot />
    </>
  );
}
