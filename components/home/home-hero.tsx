import Link from "next/link";
import { Building2, CheckCircle2, MapPin, Menu, ArrowRight, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden rounded-[1.75rem] bg-[#102c38] px-6 py-8 text-white shadow-xl sm:px-10 sm:py-12 lg:min-h-[510px] lg:px-14 lg:py-14">
      <img
        src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1800&q=85"
        alt="A city street seen from above"
        className="absolute inset-0 -z-20 size-full object-cover object-center opacity-45 mix-blend-luminosity"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,#102c38_5%,rgba(16,44,56,.9)_38%,rgba(16,44,56,.2)_100%)]" />
      <div className="absolute bottom-0 right-0 -z-10 hidden h-2/3 w-1/2 bg-[radial-gradient(circle_at_center,rgba(36,211,238,.35),transparent_65%)] lg:block" />

      <div className="flex items-center justify-between border-b border-white/15 pb-5">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-lg bg-cyan-300 text-slate-950"><Building2 className="size-4" /></span>
          CityPulse
        </div>
        <div className="hidden items-center gap-5 text-xs text-cyan-50/80 sm:flex">
          <a href="#how-it-works" className="hover:text-white">How it works</a>
          <a href="#impact" className="hover:text-white">Public progress</a>
          <Link href="/login" className="rounded-full border border-white/25 px-3 py-1.5 text-white hover:bg-white/10">Citizen sign in</Link>
        </div>
        <Button variant="ghost" size="icon-sm" className="text-white hover:bg-white/10 sm:hidden" aria-label="Open navigation">
          <Menu className="size-5" />
        </Button>
      </div>

      <div className="grid gap-10 pt-16 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end lg:pt-20">
        <div className="max-w-3xl">
          <Badge className="border border-cyan-200/30 bg-cyan-300/15 text-cyan-100 hover:bg-cyan-300/15">
            <MapPin className="mr-1.5 size-3.5" /> A clearer way to care for your city
          </Badge>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.04] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
            Notice something? Help move it forward.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
            CityPulse connects residents, dispatchers, and field crews around the everyday work that keeps a city safe, moving, and cared for.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/citizen/new" className="inline-flex h-10 items-center gap-2 rounded-lg bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-200">
              Report a local issue <ArrowRight className="size-4" />
            </Link>
            <Link href="#how-it-works" className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/25 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10">
              See how it works <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="hidden rounded-2xl border border-white/20 bg-slate-950/35 p-4 backdrop-blur-md lg:block">
          <div className="flex items-center justify-between border-b border-white/15 pb-3 text-xs">
            <span className="font-medium text-white">Civic signal board</span>
            <span className="flex items-center gap-1.5 text-cyan-200"><span className="size-1.5 rounded-full bg-cyan-300" /> Live system</span>
          </div>
          <div className="space-y-3 pt-3">
            <div className="rounded-xl bg-white/10 p-3">
              <div className="flex items-center justify-between text-xs"><span className="text-slate-200">Water main · Elm Street</span><span className="text-orange-200">High</span></div>
              <div className="mt-3 h-1.5 rounded-full bg-white/15"><div className="h-full w-3/4 rounded-full bg-orange-300" /></div>
              <p className="mt-2 text-[11px] text-slate-300">Crew dispatched · updated 4 min ago</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <div className="flex items-center justify-between text-xs"><span className="text-slate-200">Streetlight · North Loop</span><span className="text-emerald-200">Resolved</span></div>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-300"><CheckCircle2 className="size-3.5 text-emerald-300" /> Resident notified</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}