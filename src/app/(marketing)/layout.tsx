import type { ReactNode } from 'react';
import { AxisNavbar } from '@/components/layout/AxisNavbar';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <AxisNavbar isAuthenticated={false} />
      {children}
    </div>
  );
}
