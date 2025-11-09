"use client";

import React from "react";

import clsx from "clsx";

export default function Callout({
  variant,
  children,
  title,
}: {
  variant: "note" | "example";
  title?: string;
  children?: React.ReactNode;
}) {
  const isNote = variant === "note";
  return (
    <div
      className={clsx(
        "rounded-xl border p-4 text-sm",
        isNote
          ? "bg-blue-50 border-blue-200"
          : "bg-green-50 border-green-200"
      )}
    >
      {title && (
        <div className="mb-1 text-xs font-semibold tracking-wide uppercase text-slate-900">
          {title}
        </div>
      )}
      <div className="text-sm text-slate-700">
        {typeof children === 'string' ? <p className="m-0">{children}</p> : children}
      </div>
    </div>
  );
}
