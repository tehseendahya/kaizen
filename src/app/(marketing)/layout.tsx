import type { ReactNode } from 'react';
import { AxisNavbar } from '@/components/layout/AxisNavbar';
import AnnouncementBar from '@/components/layout/AnnouncementBar';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <AxisNavbar />
      <AnnouncementBar />
      {children}
    </div>
  );
}
