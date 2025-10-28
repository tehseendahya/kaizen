import { getCourseBySlug } from "@/lib/courses";
import { axis } from "@/lib/theme";

export default function CourseHome({ params }: { params: { slug: string } }) {
  const course = getCourseBySlug(params.slug);
  const firstUnit = course.units[0];
  const isCS201 = params.slug === "cs201";
  return (
    <section className="space-y-6">
      {/* Up next */}
      <div className={isCS201 ? `${axis.card} ${axis.cardHover} p-5 mb-6` : `rounded-xl border bg-white p-5 mb-6`}>
        <div className="flex items-start gap-3">
          <div className={isCS201 ? `h-9 w-9 rounded-xl bg-indigo-50 grid place-items-center text-indigo-700` : `h-9 w-9 rounded-xl bg-blue-50 grid place-items-center text-blue-700`}>✓</div>
          <div className="flex-1 min-w-0">
            <div className={isCS201 ? axis.meta : `text-xs text-gray-500`}>Up next</div>
            <div className={isCS201 ? axis.h1 : `text-lg font-semibold text-gray-900 truncate`}>{firstUnit.title}</div>
            <p className={isCS201 ? axis.body : `text-sm text-gray-700 mt-1`}>Continue where you left off.</p>
          </div>
          {firstUnit && firstUnit.items.length > 0 && (
            <a href={`/courses/${course.slug}/modules/${firstUnit.items[0].id}`} className="inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-white">Resume</a>
          )}
        </div>
      </div>

      {/* About this unit */}
      <div className={isCS201 ? `${axis.card} p-5 mb-6` : `rounded-xl border bg-white p-5 mb-6`}>
        <div className={isCS201 ? `${axis.h2} mb-2` : `text-base font-semibold text-gray-900 mb-2`}>About this unit</div>
        <ul className="list-disc pl-5 space-y-1">
          <li className={isCS201 ? axis.body : `text-sm text-gray-700`}>Core concepts and key operations</li>
          <li className={isCS201 ? axis.body : `text-sm text-gray-700`}>Practice problems to build fluency</li>
          <li className={isCS201 ? axis.body : `text-sm text-gray-700`}>Estimated time: ~40 minutes</li>
        </ul>
      </div>

      <div>
        <div className={isCS201 ? `${axis.h2} mb-2` : `text-base font-semibold text-gray-900 mb-2`}>Topics in this unit</div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {firstUnit.items.map((it, i) => (
            <a key={it.id} href={`/courses/${course.slug}/modules/${it.id}`} className={isCS201 ? `${axis.card} ${axis.cardHover} p-5 block` : `rounded-xl border bg-white p-4 block`}>
              <span className={isCS201 ? axis.pill : `inline-flex h-6 min-w-6 px-2 items-center justify-center rounded-lg bg-blue-50 text-[12px] font-semibold text-blue-700`}>{i + 1}</span>
              <div className={isCS201 ? `mt-2 text-[15px] font-semibold text-gray-900` : `mt-2 font-semibold text-gray-900`}>{it.title}</div>
              <div className={isCS201 ? `mt-1 text-[13px] text-gray-600` : `mt-1 text-sm text-gray-600`}>Quick overview and examples to get you started.</div>
              <span className={isCS201 ? `${axis.link} inline-flex items-center gap-1 mt-3` : `text-blue-600 inline-flex items-center gap-1 mt-3`}>Start learning →</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
