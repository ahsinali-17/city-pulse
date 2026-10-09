import { ShieldCheck, Smartphone, Users } from "lucide-react";
import type { HomeStats } from "./home-types";

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function ImpactStat({ value, label, detail }: { value: string; label: string; detail: string }) {
  return (
    <div className="border-l border-white/20 pl-4 first:border-l-0 first:pl-0 sm:pl-6">
      <p className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{value}</p>
      <p className="mt-1 text-sm font-medium text-cyan-100">{label}</p>
      <p className="mt-1 text-xs text-slate-300">{detail}</p>
    </div>
  );
}

export function HomeImpact({ stats }: { stats: HomeStats }) {
  return (
    <section id="impact" className="scroll-mt-8 px-2 pt-20 sm:px-6 lg:px-10">
      <div className="overflow-hidden rounded-2xl bg-slate-950 px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-md">
            <p className="text-sm font-semibold text-cyan-300">Public progress</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">The work is measurable because the work matters.</h2>
            <p className="mt-4 text-sm leading-6 text-slate-300">Live totals from the CityPulse operations database. Personal information and exact incident locations stay protected.</p>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-4 lg:min-w-[58%]">
            <ImpactStat value={formatCount(stats.totalTickets)} label="Reports received" detail="All time" />
            <ImpactStat value={formatCount(stats.resolvedTickets)} label="Issues resolved" detail="Closed work" />
            <ImpactStat value={formatCount(stats.activeTickets)} label="In progress" detail="Needs attention" />
            <ImpactStat value={formatCount(stats.departmentCount)} label="Teams connected" detail="Departments" />
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/15 pt-5 text-xs text-slate-300">
          <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-cyan-300" /> Built around accountable handoffs</span>
          <span className="flex items-center gap-2"><Smartphone className="size-4 text-cyan-300" /> Works in the field, even offline</span>
          <span className="flex items-center gap-2"><Users className="size-4 text-cyan-300" /> Designed for residents and crews</span>
        </div>
      </div>
    </section>
  );
}