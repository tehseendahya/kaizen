'use client';

import Link from 'next/link';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/80 border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center gap-4">
          {/* Left: Logo + nav links */}
          <div className="flex items-center gap-6 min-w-0">
            <Link href="/" className="flex items-center gap-2">
              {/* Orbit/book logo */}
              <span className="relative inline-flex h-6 w-6 items-center justify-center">
                <span className="absolute h-1.5 w-1.5 rounded-full bg-blue-600 left-0.5 bottom-0.5" />
                <span className="inline-flex h-6 w-6 rounded-full border-[3px] border-[#0B1E3F]" />
              </span>
              <span className="text-xl font-semibold tracking-tight text-[#0B1E3F]">Axis</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-[15px] text-slate-500">
              {['Courses', 'Dashboard', 'Research', 'Community', 'About'].map((label) => (
                <Link key={label} href={label === 'Courses' ? '/courses' : '#'} className="hover:text-slate-900 transition-colors">
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center: Search */}
          <div className="flex-1 min-w-[220px]">
            <div className="relative">
              <Input
                aria-label="Search"
                placeholder="Search courses or professors..."
                className="rounded-full pl-10 pr-16 h-10 bg-white/90 border-slate-200 text-slate-800 placeholder:text-slate-400 shadow-sm"
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                {/* search icon */}
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
              </span>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[12px] text-slate-500 inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 bg-white">
                ⌘K
              </span>
            </div>
          </div>

          {/* Right: Bell + chips + profile (with divider) */}
          <div className="hidden md:flex items-center gap-4 pl-4 border-l border-slate-200">
            <Button variant="outline" size="sm" aria-label="Notifications" className="relative h-10 w-10 rounded-full p-0">
              <svg className="h-5 w-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center">7</span>
            </Button>

            <Badge className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1">Sophomore</Badge>
            <Badge className="rounded-full bg-green-50 text-green-700 border border-green-200 px-3 py-1">
              <span className="inline-flex items-center gap-1">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 17l6-6 4 4 7-7" />
                </svg>
                3.92
              </span>
            </Badge>
            <Badge className="rounded-full bg-pink-50 text-pink-700 border border-pink-200 px-3 py-1">
              <span className="inline-flex items-center gap-1">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M4 4v15.5" />
                  <path d="M20 4v13a2 2 0 0 1-2 2H6.5" />
                </svg>
                6
              </span>
            </Badge>

            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 bg-blue-600">
                <AvatarFallback>AJ</AvatarFallback>
              </Avatar>
              <div className="leading-tight">
                <div className="text-slate-900 text-sm font-semibold">Alex</div>
                <div className="text-slate-500 text-xs">Data Science</div>
              </div>
            </div>
          </div>

          {/* Mobile: menu trigger */}
          <div className="md:hidden ml-auto">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" aria-label="Open menu" className="h-9 w-9 rounded-full p-0">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="space-y-6">
                  <nav className="space-y-2">
                    {['Courses', 'Dashboard', 'Research', 'Community', 'About'].map((label) => (
                      <Link key={label} href={label === 'Courses' ? '/courses' : '#'} className="block text-slate-700 hover:text-slate-900">
                        {label}
                      </Link>
                    ))}
                  </nav>
                  <div className="flex items-center gap-3">
                    <Badge className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1">Sophomore</Badge>
                    <Badge className="rounded-full bg-green-50 text-green-700 border border-green-200 px-3 py-1">3.92</Badge>
                    <Badge className="rounded-full bg-pink-50 text-pink-700 border border-pink-200 px-3 py-1">6</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 bg-blue-600">
                      <AvatarFallback>AJ</AvatarFallback>
                    </Avatar>
                    <div className="leading-tight">
                      <div className="text-slate-900 text-sm font-semibold">Alex</div>
                      <div className="text-slate-500 text-xs">Data Science</div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
