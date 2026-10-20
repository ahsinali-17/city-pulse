"use client";

import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { DuplicateCheckResult } from "@/app/citizen/new/actions";

interface DuplicateCheckStatusProps {
  isChecking: boolean;
  result: DuplicateCheckResult | null;
  /** The hazard category label to display in the duplicate message. */
  category: string;
}

/**
 * Displays the current state of the proximity duplicate check:
 *  - Nothing rendered when idle (no check running, no result)
 *  - Amber spinner while checking
 *  - Green clear banner when no duplicate found
 *  - Orange warning with ticket link when duplicate found
 *
 * The duplicate case blocks submission (handled by the parent form);
 * this component is purely display.
 */
export function DuplicateCheckStatus({
  isChecking,
  result,
  category,
}: DuplicateCheckStatusProps) {
  if (!isChecking && result === null) return null;

  if (isChecking) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-3 text-xs text-amber-800 dark:text-amber-300"
      >
        <Loader2 className="size-3.5 animate-spin shrink-0" />
        <span>Checking for nearby active incidents&hellip;</span>
      </div>
    );
  }

  if (result?.isDuplicate) {
    return (
      <div
        id="duplicate-warning-banner"
        role="alert"
        aria-live="assertive"
        className="rounded-lg border border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/40 px-4 py-3 space-y-1.5"
      >
        <div className="flex items-center gap-2 font-semibold text-sm text-orange-800 dark:text-orange-300">
          <AlertTriangle className="size-4 shrink-0" />
          We&rsquo;re already on it!
        </div>
        <p className="text-xs text-orange-700 dark:text-orange-400 leading-relaxed">
          An active <strong>{category}</strong> incident is already being addressed by
          our field crews —{" "}
          <span className="font-mono font-semibold">
            {result.distanceMeters}m
          </span>{" "}
          from your location
          {result.severityMatched ? ", and the severity matches as well" : ""}.
        </p>
      </div>
    );
  }

  // result is not null and isDuplicate is false → clear
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-xs text-emerald-800 dark:text-emerald-300"
    >
      <CheckCircle2 className="size-3.5 shrink-0" />
      <span>No nearby duplicates found — you&apos;re good to submit!</span>
    </div>
  );
}
