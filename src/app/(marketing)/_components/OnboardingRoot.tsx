'use client';
import * as React from 'react';
import { OnboardingDialog } from '@/components/OnboardingDialog';

export function openOnboarding() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('axis:openOnboarding'));
  }
}

export function OnboardingRoot() {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const h = () => setOpen(true);
    window.addEventListener('axis:openOnboarding', h);
    return () => window.removeEventListener('axis:openOnboarding', h);
  }, []);
  return <OnboardingDialog open={open} onOpenChange={setOpen} />;
}

