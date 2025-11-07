"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PenguinAvatar from './PenguinAvatar';
import { sendChat } from '@/lib/ai/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import { useAuth } from '@/hooks/useAuth';

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
  const { user, isAuthenticated } = useAuth();
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
    
    // Add user message and empty assistant message
    setMessages((m) => [...m, { id: id + '-u', role: 'user', content: q }, { id: id + '-a', role: 'assistant', content: '' }]);
    setSpeaking(true);
    
    // Get conversation history (exclude the messages we just added)
    const history = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    let acc = '';
    // Pass history to maintain context across messages
    for await (const chunk of sendChat(q, courseId, history)) {
      acc += chunk;
      setMessages((m) => m.map((msg) => (msg.id === id + '-a' ? { ...msg, content: acc } : msg)));
    }
    setSpeaking(false);
  }, [input, courseId, messages]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (!open) return null;
  return (
    <aside className="fixed right-4 top-4 bottom-4 w-[400px] bg-gradient-to-br from-blue-50 via-white to-blue-100 shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-300 rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-blue-600 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="bg-white rounded-full p-1 shadow-lg">
            <PenguinAvatar size={44} speaking={speaking} />
          </div>
          <div>
            <div className="font-bold text-white text-lg">Gary 🐧</div>
            <div className="text-xs text-blue-100">
              {isAuthenticated && user?.fullName 
                ? `Helping ${user.fullName.split(' ')[0]}` 
                : 'Your CS201 Tutor'}
            </div>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-200 hover:scale-110" 
          aria-label="Close chat"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.filter(m => m.content.trim()).map((m) => (
          <div key={m.id} className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] rounded-3xl px-4 py-3 shadow-lg ${
              m.role === 'assistant' 
                ? 'bg-white text-gray-800 border-2 border-blue-100' 
                : 'bg-blue-600 text-white'
            }`}>
              {m.role === 'assistant' ? (
                <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-code:text-blue-700 prose-pre:bg-gray-100 prose-pre:text-gray-900">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex, rehypeRaw]}
                    components={{
                      code({ inline, className, children, ...props }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { inline?: boolean }) {
                        return inline ? (
                          <code className="bg-blue-50 text-blue-700 px-1 py-0.5 rounded text-xs" {...props}>
                            {children}
                          </code>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</div>
              )}
            </div>
          </div>
        ))}
        {speaking && (
          <div className="flex justify-start">
            <div className="bg-white rounded-3xl px-4 py-3 shadow-lg border-2 border-blue-100">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-700 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white/80 backdrop-blur-sm border-t-2 border-blue-100 space-y-3">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          rows={3}
          placeholder="Ask Gary anything about CS201... 💭"
          className="w-full resize-none p-3 border-2 border-blue-200 rounded-2xl bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
        />
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500 font-medium">
            <span className="hidden sm:inline">⏎ Send • </span>Shift+⏎ New line
          </div>
          <button 
            onClick={send} 
            disabled={!input.trim() || speaking}
            className="px-5 py-2.5 rounded-full bg-blue-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {speaking ? 'Thinking...' : 'Send 🚀'}
          </button>
        </div>
      </div>
    </aside>
  );
}
