import Link from "next/link";
import { ArrowRight, BellRing, Camera, ChevronRight, HardHat, Sparkles } from "lucide-react";
import type { WorkflowStep } from "./home-types";

const workflow: WorkflowStep[] = [
  { number: "01", title: "Spot it. Share it.", description: "Send a photo, location, and a few words from the street. No forms maze, no municipal vocabulary required.", icon: Camera, accent: "text-cyan-700 bg-cyan-50 border-cyan-200" },
  { number: "02", title: "Triage gets moving.", description: "AI helps sort urgency and route the report to the right public works team for a faster first response.", icon: Sparkles, accent: "text-orange-700 bg-orange-50 border-orange-200" },
  { number: "03", title: "Progress stays visible.", description: "Crews update the work from the field, while residents can follow what is happening with their report.", icon: BellRing, accent: "text-emerald-700 bg-emerald-50 border-emerald-200" },
];

function WorkflowStepCard({ step }: { step: WorkflowStep }) {
  const Icon = step.icon;

  return (
    <div className="relative border-t-2 border-slate-200 pt-5 dark:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div className={`flex size-11 items-center justify-center rounded-xl border ${step.accent}`}><Icon className="size-5" /></div>
        <span className="font-mono text-xs text-slate-400">{step.number}</span>
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-950 dark:text-white">{step.title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-300">{step.description}</p>
    </div>
  );
}

export function HomeWorkflow() {
  return (
    <section id="how-it-works" className="scroll-mt-8 px-2 py-20 sm:px-6 lg:px-10">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">From first notice to finished work</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">One shared picture of what the city needs.</h2>
        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">Every report becomes a useful signal: located, prioritized, routed, and visible to the people who depend on the outcome.</p>
      </div>
      <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">{workflow.map((step) => <WorkflowStepCard key={step.number} step={step} />)}</div>
    </section>
  );
}

export function HomeFieldStory() {
  return (
    <section className="grid gap-6 px-2 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-10">
      <div className="overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900">
        <img src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=85" alt="A municipal worker inspecting infrastructure" className="h-full min-h-80 w-full object-cover" />
      </div>
      <div className="flex flex-col justify-center rounded-2xl bg-orange-50 p-8 dark:bg-orange-950/30 sm:p-10">
        <div className="flex size-11 items-center justify-center rounded-xl bg-orange-200 text-orange-800 dark:bg-orange-900 dark:text-orange-200"><HardHat className="size-5" /></div>
        <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Good civic work should be easy to see.</h2>
        <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-slate-200">Residents get a simple way to speak up. Teams get the context they need in the field. Leaders get a grounded view of what is improving and where attention is still needed.</p>
        <Link href="/citizen/tickets" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-orange-800 hover:text-orange-950 dark:text-orange-200 dark:hover:text-white">Track a report <ArrowRight className="size-4" /></Link>
      </div>
    </section>
  );
}