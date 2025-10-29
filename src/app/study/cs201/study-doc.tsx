"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import Link from "next/link";
import "katex/dist/katex.min.css";

type TOCItem = { id: string; text: string; level: 2 | 3 };

function extractTOC(md: string): TOCItem[] {
  // Simple, robust scan of ## and ### lines
  const lines = md.split("\n");
  const items: TOCItem[] = [];
  for (const line of lines) {
    const m2 = /^##\s+(.+)$/.exec(line);
    const m3 = /^###\s+(.+)$/.exec(line);
    if (m2) {
      const text = m2[1].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      items.push({ id, text, level: 2 });
    } else if (m3) {
      const text = m3[1].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      items.push({ id, text, level: 3 });
    }
  }
  return items;
}

export default function StudyDoc({ markdown }: { markdown: string }) {
  const toc = useMemo(() => extractTOC(markdown), [markdown]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const headings = Array.from(
      document.querySelectorAll("h2[id], h3[id]"),
    ) as HTMLElement[];

    // Observe heading intersections to highlight TOC
    observerRef.current?.disconnect();
    const io = new IntersectionObserver(
      (entries) => {
        // Pick the top-most visible heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.target as HTMLElement).offsetTop - (b.target as HTMLElement).offsetTop);
        if (visible.length > 0) {
          setActiveId((visible[0].target as HTMLElement).id);
        }
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0.1 },
    );
    headings.forEach((h) => io.observe(h));
    observerRef.current = io;
    return () => io.disconnect();
  }, [markdown]);

  // Mobile TOC toggle
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/courses/cs201"
                className="text-blue-600 hover:text-blue-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">CS201 Study Pack</h1>
                <p className="text-xs text-gray-600 hidden sm:block">Units 1–10 • Khan Academy Style</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
      {/* TOC */}
      <aside className="mb-6 lg:mb-0 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:overflow-auto">
        <div className="lg:hidden mb-3">
          <button
            onClick={() => setOpen((s) => !s)}
            className="w-full rounded-2xl border border-gray-300 px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 bg-white text-gray-900"
            aria-expanded={open}
            aria-controls="toc-panel"
          >
            {open ? "Hide contents" : "Show contents"}
          </button>
        </div>
        <div id="toc-panel" className={`${open ? "block" : "hidden"} lg:block`}>
          <nav aria-label="Table of contents" className="rounded-2xl border border-gray-300 p-4 bg-white">
            <h2 className="text-sm font-semibold uppercase tracking-wide mb-2 text-gray-900">Contents</h2>
            <ul className="space-y-1">
              {toc.map((item) => (
                <li key={item.id} className={item.level === 3 ? "ml-4" : ""}>
                  <a
                    href={`#${item.id}`}
                    className={`block rounded px-2 py-1 text-sm hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      activeId === item.id ? "bg-blue-100 font-semibold text-blue-900" : "text-gray-700"
                    }`}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Content */}
      <article className="prose prose-neutral max-w-none prose-headings:scroll-mt-24 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[
            rehypeKatex,
            rehypeSlug,
            [
              rehypeAutolinkHeadings,
              {
                behavior: "append",
                properties: {
                  className: ["ml-2", "no-underline", "opacity-60", "hover:opacity-100", "text-blue-600"],
                  "aria-label": "Anchor link",
                },
                content: {
                  type: "text",
                  value: "🔗",
                },
              },
            ],
          ]}
          components={{
            code({ node, inline, className, children, ...props }: any) {
              return inline ? (
                <code className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {markdown}
        </ReactMarkdown>
      </article>
    </div>
    </div>
  );
}

