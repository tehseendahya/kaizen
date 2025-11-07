'use client';
import * as React from 'react';
import { openOnboarding } from '@/app/(marketing)/_components/OnboardingRoot';

export default function AnnouncementBar() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    try {
      const dismissed = localStorage.getItem('axis.announcement.dismissed');
      setVisible(dismissed !== '1');
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function close() {
    try {
      localStorage.setItem('axis.announcement.dismissed', '1');
    } catch {}
    setVisible(false);
  }

  return (
    <div role="region" aria-label="Launch announcement" className="w-full bg-white/90 border-b">
      <div className="mx-auto max-w-6xl px-6">
        <div className="my-2 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <div className="flex items-center gap-2 text-[14px] text-slate-700">
            <span className="text-[16px]">🎓</span>
            <span className="font-medium">Launching at Duke University — Fall 2025</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => openOnboardingWithDuke()}
              className="text-[14px] rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
              aria-label="Join the Duke beta"
            >
              Join the Duke beta →
            </button>
            <button onClick={close} aria-label="Dismiss announcement" className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100">
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// helper wrapper so we don’t import hooks here
function openOnboardingWithDuke() {
  try {
    // same opener used elsewhere
    openOnboarding({ prefillUniversity: 'Duke University' });
  } catch {
    // fallback: dispatch event with detail
    window.dispatchEvent(
      new CustomEvent('axis:openOnboarding', { detail: { prefillUniversity: 'Duke University' } })
    );
  }
}
