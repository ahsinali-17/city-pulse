import { HomeHero } from "./home-hero";
import { HomeFieldStory, HomeWorkflow } from "./home-workflow";
import { HomeImpact } from "./home-impact";
import { PublicFooter } from "./public-footer";
import type { HomeStats } from "./home-types";

export function HomePage({ stats }: { stats: HomeStats }) {
  return (
    <div className="mx-auto max-w-7xl overflow-hidden pb-8 text-slate-900 dark:text-slate-100">
      <HomeHero />
      <HomeWorkflow />
      <HomeFieldStory />
      <HomeImpact stats={stats} />
      <PublicFooter />
    </div>
  );
}

export type { HomeStats } from "./home-types";
