"use client";

import * as React from 'react';

type SheetContextType = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

const SheetContext = React.createContext<SheetContextType | null>(null);

export function Sheet({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return <SheetContext.Provider value={{ open, setOpen }}>{children}</SheetContext.Provider>;
}

export function SheetTrigger({ children, asChild = false }: { children: React.ReactNode; asChild?: boolean }) {
  const ctx = React.useContext(SheetContext)!;
  if (asChild && React.isValidElement(children)) {
    type ClickableElement = React.ReactElement<{ onClick?: React.MouseEventHandler }>;
    const child = children as ClickableElement;
    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent) => {
        child.props?.onClick?.(e);
        ctx.setOpen(true);
      },
    });
  }
  return (
    <button aria-label="Open menu" onClick={() => ctx.setOpen(true)} className="inline-flex">
      {children}
    </button>
  );
}

export function SheetContent({ side = 'right', children }: { side?: 'right' | 'left'; children: React.ReactNode }) {
  const ctx = React.useContext(SheetContext)!;
  return (
    <>
      {/* Overlay */}
      {ctx.open && (
        <div
          aria-hidden
          className="fixed inset-0 z-50 bg-black/40"
          onClick={() => ctx.setOpen(false)}
        />
      )}
      <div
        role="dialog"
        aria-modal="true"
        className={`fixed z-50 top-0 h-full w-80 max-w-[90vw] bg-white shadow-xl border-l border-gray-200 transition-transform duration-300 ease-in-out ${
          side === 'right' ? 'right-0' : 'left-0 border-l-0 border-r'
        } ${ctx.open ? 'translate-x-0' : side === 'right' ? 'translate-x-full' : '-translate-x-full'}`}
      >
        <div className="h-16 flex items-center px-4 border-b border-gray-200 justify-end">
          <button aria-label="Close menu" className="text-gray-600 hover:text-gray-900" onClick={() => ctx.setOpen(false)}>
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100%-4rem)]">{children}</div>
      </div>
    </>
  );
}
