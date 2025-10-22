"use client";

import React, { useEffect, useRef, useState } from 'react';

export default function HighlightPopover({ onAsk }: { onAsk: (text: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [text, setText] = useState('');
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handler = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        setVisible(false);
        return;
      }
      const selected = sel.toString().trim();
      if (!selected) { setVisible(false); return; }

      // Ensure selection is within #course-content
      const range = sel.rangeCount ? sel.getRangeAt(0) : null;
      if (!range) { setVisible(false); return; }
      const common = range.commonAncestorContainer as HTMLElement | null;
      const host = document.getElementById('course-content');
      if (!host || !common) { setVisible(false); return; }
      const isInside = host.contains(common.nodeType === 1 ? common : common.parentElement!);
      if (!isInside) { setVisible(false); return; }

      const rect = range.getBoundingClientRect();
      if (!rect || (rect.width === 0 && rect.height === 0)) { setVisible(false); return; }
      setText(selected);
      setPos({ x: rect.right + 8, y: rect.top - 8 + window.scrollY });
      setVisible(true);
    };
    document.addEventListener('selectionchange', handler);
    return () => document.removeEventListener('selectionchange', handler);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (buttonRef.current && e.target && buttonRef.current.contains(e.target as Node)) return;
      // hide when clicking elsewhere
      setVisible(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (!visible) return null;
  return (
    <button
      ref={buttonRef}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => { onAsk(text); setVisible(false); }}
      style={{ position: 'absolute', left: pos.x, top: pos.y, zIndex: 50 }}
      className="px-2 py-1 rounded-md bg-blue-600 text-white text-xs shadow-lg border border-blue-700 hover:bg-blue-700"
    >
      Ask Gary 🐧
    </button>
  );
}

