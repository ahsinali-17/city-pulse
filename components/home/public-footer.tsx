import Link from "next/link";
import { Building2, ExternalLink, Mail } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="mt-20 border-t border-slate-200 pt-8 dark:border-slate-800">
      <div className="grid gap-8 pb-8 sm:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
            <span className="flex size-7 items-center justify-center rounded-lg bg-slate-950 text-cyan-300 dark:bg-white dark:text-slate-950"><Building2 className="size-4" /></span>
            CityPulse
          </Link>
          <p className="mt-3 max-w-xs text-xs leading-5 text-slate-500 dark:text-slate-400">A clearer line between the people who notice a problem and the teams who can fix it.</p>
        </div>
        <div>
          <h2 className="text-xs font-semibold text-slate-950 dark:text-white">Need help?</h2>
          <a href="mailto:hello@citypulse.demo" className="mt-3 flex items-center gap-2 text-xs text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"><Mail className="size-3.5" /> hello@citypulse.demo</a>
          <p className="mt-2 text-[11px] leading-5 text-slate-400">Demo support inbox for questions, accessibility feedback, and civic partnerships.</p>
        </div>
        <div>
          <h2 className="text-xs font-semibold text-slate-950 dark:text-white">Connect</h2>
          <div className="mt-3 flex items-center gap-2">
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="CityPulse on GitHub" className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-950 dark:border-slate-700 dark:hover:text-white"><ExternalLink className="size-4" /></a>
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="CityPulse on LinkedIn" className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-950 dark:border-slate-700 dark:hover:text-white"><ExternalLink className="size-4" /></a>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Link className="hover:text-slate-950 dark:hover:text-white" href="/citizen/new">Report an issue</Link>
            <Link className="hover:text-slate-950 dark:hover:text-white" href="/citizen/tickets">Track a report</Link>
            <Link className="hover:text-slate-950 dark:hover:text-white" href="/login">Citizen sign in</Link>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 border-t border-slate-200 py-5 text-[11px] text-slate-400 dark:border-slate-800 sm:flex-row sm:justify-between"><span>Built for more responsive neighborhoods.</span><span>© {new Date().getFullYear()} CityPulse Civic Operations</span></div>
    </footer>
  );
}