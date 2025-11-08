import { AxisNavbar } from '@/components/layout/AxisNavbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AxisNavbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
