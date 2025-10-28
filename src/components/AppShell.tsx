"use client";
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const onCourseRoute = pathname.startsWith("/courses/");
  if (onCourseRoute) {
    return <>{children}</>;
  }
  return (
    <div className="mx-auto max-w-[120rem]">
      <div className="flex">
        <Sidebar />
        <main className="min-h-screen flex-1 px-6 py-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

