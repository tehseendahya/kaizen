import type { ReactNode } from "react";
import TopBar from "@/components/course/TopBar";
import CourseSidebar from "@/components/course/CourseSidebar";
import { axis } from "@/lib/theme";

export default async function CourseLayout({ children, params }: { children: ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const isCS201 = slug === "cs201";
  return (
    <div className={isCS201 ? `${axis.pageBg} min-h-screen` : `min-h-screen`}>
      <TopBar slug={slug} />
      <div
        className={
          isCS201
            ? `${axis.container} py-6 grid grid-cols-[280px_1fr] ${axis.gutter} md:grid-cols-1`
            : `py-6 grid grid-cols-[280px_1fr] gap-6 md:grid-cols-1`
        }
        data-course={slug}
      >
        <aside className="hidden md:block sticky top-[72px] self-start">
          <CourseSidebar slug={slug} />
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
