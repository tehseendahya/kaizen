'use client';

import { useEffect } from 'react';
import { LoginRoot, openLogin } from '@/app/(marketing)/_components/LoginRoot';
import { AxisNavbar } from '@/components/layout/AxisNavbar';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import { Hero } from '@/app/(marketing)/_components/Hero';
import { Features } from '@/app/(marketing)/_components/Features';
import { Stats } from '@/app/(marketing)/_components/Stats';
import { FinalCTA } from '@/app/(marketing)/_components/FinalCTA';
import { SiteFooter } from '@/app/(marketing)/_components/SiteFooter';

export default function LoginPage() {
  useEffect(() => {
    // Open the login dialog when this page loads
    openLogin();
  }, []);

  // Show the landing page background with login dialog overlay
  return (
    <div className="min-h-screen bg-white">
      <AxisNavbar />
      <AnnouncementBar />
      <div className="min-h-screen">
        <Hero />
        <Features />
        <Stats />
        <FinalCTA />
        <SiteFooter />
      </div>
      <LoginRoot />
    </div>
  );
}

