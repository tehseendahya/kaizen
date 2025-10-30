'use client';
import * as React from 'react';
import { OnboardingDialog } from '@/components/OnboardingDialog';

type OpenOptions = { prefillUniversity?: string };

export function openOnboarding(opts?: OpenOptions) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('axis:openOnboarding', { detail: opts ?? {} }));
  }
}

export function OnboardingRoot() {
  const [open, setOpen] = React.useState(false);
  const [prefill, setPrefill] = React.useState<string | undefined>(undefined);
  React.useEffect(() => {
    const h = (e: Event) => {
      const ev = e as CustomEvent<OpenOptions>;
      setPrefill(ev.detail?.prefillUniversity);
      setOpen(true);
    };
    window.addEventListener('axis:openOnboarding', h as EventListener);
    return () => window.removeEventListener('axis:openOnboarding', h as EventListener);
  }, []);
  return <OnboardingDialog open={open} onOpenChange={setOpen} prefillSchool={prefill} />;
}
