import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-top pt-12 pb-10 border-t">
      <div className="mx-auto max-w-6xl px-6 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-blue-700 relative">
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-300" />
            </div>
            <span className="font-semibold">Axis</span>
          </div>
          <p className="mt-3 text-slate-600">AI for University Learning</p>
          <div className="mt-4 flex gap-3">
            <a aria-label="LinkedIn" className="rounded-xl border px-3 py-2">in</a>
            <a aria-label="GitHub" className="rounded-xl border px-3 py-2">􀈖</a>
            <a aria-label="Twitter" className="rounded-xl border px-3 py-2">t</a>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-slate-800">Product</h4>
          <ul className="mt-3 space-y-2 text-slate-600">
            <li><Link href="/courses">Courses</Link></li>
            <li><Link href="/dashboard">Dashboard</Link></li>
            <li><Link href="/research">Research</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-slate-800">Company</h4>
          <ul className="mt-3 space-y-2 text-slate-600">
            <li><Link href="/about">About</Link></li>
            <li><Link href="/community">Community</Link></li>
            <li><Link href="/careers">Careers</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-slate-800">Resources</h4>
          <ul className="mt-3 space-y-2 text-slate-600">
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/help">Help Center</Link></li>
            <li><Link href="/api">API Docs</Link></li>
            <li><Link href="/status">Status</Link></li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 mt-10 flex items-center justify-between text-sm text-slate-500">
        <span>© {new Date().getFullYear()} Axis. Built for learners, by learners.</span>
        <div className="flex gap-4">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/security">Security</Link>
        </div>
      </div>
    </footer>
  );
}

