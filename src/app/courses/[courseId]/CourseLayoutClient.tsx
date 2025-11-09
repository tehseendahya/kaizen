"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import type { Course } from "@/lib/courses/unified-loader";

export default function CourseLayoutClient({
  children,
  course,
}: {
  children: React.ReactNode;
  course: Course;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedUnits, setExpandedUnits] = useState<Set<number>>(
    new Set([1]) // First unit expanded by default
  );

  const toggleUnit = (unitNumber: number) => {
    const newExpanded = new Set(expandedUnits);
    if (newExpanded.has(unitNumber)) {
      newExpanded.delete(unitNumber);
    } else {
      newExpanded.add(unitNumber);
    }
    setExpandedUnits(newExpanded);
  };

  const isActive = (slug: string) => {
    return pathname?.includes(`/${slug}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href={`/courses/${course.id}`} className="font-semibold text-gray-900">
            {course.title}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-0 left-0 z-40 h-screen w-80 bg-white border-r border-gray-200 
            transform transition-transform duration-200 ease-in-out overflow-y-auto
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="p-6">
            {/* Course Title */}
            <div className="mb-6">
              <Link 
                href={`/courses/${course.id}`}
                className="text-sm text-gray-500 hover:text-gray-700 mb-1 block"
              >
                ← Back to Course
              </Link>
              <h2 className="text-xl font-bold text-gray-900">Course Content</h2>
            </div>

            {/* Units List */}
            <nav className="space-y-2">
              {course.units?.map((unit) => {
                const isExpanded = expandedUnits.has(unit.number);
                
                return (
                  <div key={unit.number} className="border-b border-gray-100 pb-2">
                    <button
                      onClick={() => toggleUnit(unit.number)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <span className="font-semibold text-gray-900 text-sm">
                        Unit {unit.number}: {unit.title}
                      </span>
                      {isExpanded ? (
                        <ChevronDown size={18} className="text-gray-400" />
                      ) : (
                        <ChevronRight size={18} className="text-gray-400" />
                      )}
                    </button>

                    {/* Sections/Lessons */}
                    {isExpanded && unit.sections && (
                      <div className="mt-1 ml-3 space-y-1">
                        {unit.sections.map((section) => (
                          <Link
                            key={section.id}
                            href={`/courses/${course.id}/${section.slug}`}
                            className={`
                              block px-3 py-2 rounded-lg text-sm transition-colors
                              ${
                                isActive(section.slug)
                                  ? 'bg-blue-50 text-blue-700 font-medium'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }
                            `}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <div className="font-medium mb-1">
                              {section.id} {section.title}
                            </div>
                            {section.intro && (
                              <div className="text-xs text-gray-500 line-clamp-2">
                                {section.intro.substring(0, 80)}...
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 lg:ml-0">
          {children}
        </main>
      </div>
    </div>
  );
}

