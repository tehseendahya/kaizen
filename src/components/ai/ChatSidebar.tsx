"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PenguinAvatar from './PenguinAvatar';
import { sendChat } from '@/lib/ai/client';

type Msg = { id: string; role: 'user' | 'assistant'; content: string };

export default function ChatSidebar({
  courseId,
  open,
  onClose,
  prefill,
}: {
  courseId: string;
  open: boolean;
  onClose: () => void;
  prefill?: string;
}) {
  const storageKey = useMemo(() => `chat:gary:${courseId}`, [courseId]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Load / persist messages
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setMessages(JSON.parse(raw));
    } catch {}
  }, [storageKey]);
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(messages)); } catch {}
  }, [messages, storageKey]);

  // Prefill when provided
  useEffect(() => {
    if (open && prefill && prefill.trim()) {
      setInput((prev) => (prev ? prev : prefill));
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open, prefill]);

  // Scroll to bottom on update
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const send = useCallback(async () => {
    const q = input.trim();
    if (!q) return;
    setInput('');
    const id = `${Date.now()}`;
    setMessages((m) => [...m, { id: id + '-u', role: 'user', content: q }, { id: id + '-a', role: 'assistant', content: '' }]);
    setSpeaking(true);
    let acc = '';
    for await (const chunk of sendChat(q, courseId)) {
      acc += chunk;
      setMessages((m) => m.map((msg) => (msg.id === id + '-a' ? { ...msg, content: acc } : msg)));
    }
    setSpeaking(false);
  }, [input, courseId]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (!open) return null;
  return (
    <aside className="fixed right-0 top-0 h-screen w-[380px] bg-white border-l border-gray-200 shadow-lg z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center space-x-3">
          <PenguinAvatar size={40} speaking={speaking} />
          <div>
            <div className="font-semibold text-gray-900">Ask Gary (CS201 Tutor)</div>
            <div className="text-xs text-gray-500">Cmd/Ctrl + I to focus</div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded hover:bg-gray-100" aria-label="Close chat">
          ✕
        </button>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-sm text-gray-600 p-3 border rounded-md bg-gray-50">
            <div className="font-medium mb-2">Quick suggestions</div>
            <div className="flex flex-wrap gap-2">
              {['Explain this concept', 'Give a Java example', 'Make flashcards'].map((s) => (
                <button key={s} onClick={() => setInput(s)} className="px-2 py-1 text-xs rounded bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 shadow ${m.role === 'assistant' ? 'bg-blue-50 text-gray-900 border border-blue-200' : 'bg-gray-900 text-white'}`}>
              {m.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t space-y-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          rows={3}
          placeholder="Ask Gary about CS201..."
          className="w-full resize-none p-2 border rounded-md bg-white text-gray-900 placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">Shift+Enter for newline</div>
          <button onClick={send} className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700">
            Send
          </button>
        </div>
      </div>
    </aside>
  );
}
