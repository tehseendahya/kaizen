"use client";
import { getCourseBySlug } from "@/lib/courses";
import { axis } from "@/lib/theme";
import { usePathname } from "next/navigation";

export default function CourseSidebar({ slug }: { slug: string }) {
  const course = getCourseBySlug(slug);
  const pathname = usePathname() || "";
  const isCS201 = slug === "cs201";
  return (
    <nav className={isCS201 ? `${axis.card} p-3` : `p-3`}>
      <h3 className={isCS201 ? `${axis.label} px-2 pb-2` : `px-2 pb-2 text-xs font-semibold text-gray-500`}>Course Content</h3>
      <ul className="space-y-1">
        {course.units.map((u, idx) => (
          <li key={u.id} className="group">
            <details open={idx === 0} className="rounded-lg group">
              <summary className={`cursor-pointer px-2 py-2 rounded-lg ${isCS201 ? `hover:bg-gray-50 ${axis.item}` : 'text-sm font-medium'} flex items-center justify-between`}> 
                <span>{`Unit ${idx + 1}: ${u.title}`}</span>
                <span className="text-gray-400 transition group-open:rotate-90">›</span>
              </summary>
              <ul className="mt-1 pl-3">
                {u.items.map((it) => {
                  const href = `/courses/${slug}/modules/${it.id}`;
                  const active = pathname === href;
                  return (
                    <li key={it.id}>
                      <a
                        href={href}
                        className={
                          isCS201
                            ? `flex items-center gap-2 px-2 py-1.5 rounded-md ${axis.subitem} hover:bg-indigo-50 hover:text-indigo-700 ${active ? axis.active : ''}`.trim()
                            : `px-2 py-1.5 block text-sm ${active ? 'text-indigo-700' : ''}`
                        }
                      >
                        {isCS201 && <span className="h-2 w-2 rounded-full bg-indigo-400/70" />} {it.title}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </details>
          </li>
        ))}
      </ul>
    </nav>
  );
}
