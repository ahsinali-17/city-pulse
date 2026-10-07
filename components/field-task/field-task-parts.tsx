"use client";

import { useState } from "react";
import { CheckCircle2, Package, Plus } from "lucide-react";
import { type FieldTask } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateTicketState } from "@/app/field/actions";

interface FieldTaskPartsProps {
  task: FieldTask;
  isPending: boolean;
  startTransition: React.TransitionStartFunction;
}

export function FieldTaskParts({ task, isPending, startTransition }: FieldTaskPartsProps) {
  const [newPartInput, setNewPartInput] = useState("");
  const isCompleted = task.status === "COMPLETED";

  const togglePart = (part: string) => {
    const isUsed = task.partsUsed.includes(part);
    const nextPartsUsed = isUsed 
      ? task.partsUsed.filter(p => p !== part) 
      : [...task.partsUsed, part];
      
    startTransition(() => {
      updateTicketState(task.id, task.status, task.partsNeeded, nextPartsUsed);
    });
  };

  const addPart = () => {
    const input = newPartInput.trim();
    if (!input || task.partsNeeded.includes(input)) {
      setNewPartInput("");
      return;
    }
    
    // Add to BOTH partsNeeded (so it shows in the list forever) and partsUsed (since they just used it)
    const nextPartsNeeded = [...task.partsNeeded, input];
    const nextPartsUsed = [...task.partsUsed, input];
    
    setNewPartInput("");
    startTransition(() => {
      updateTicketState(task.id, task.status, nextPartsNeeded, nextPartsUsed);
    });
  };

  return (
    <div>
      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        Parts & Tools
      </span>
      <div className="mt-1.5 space-y-1">
        {task.partsNeeded.map((part, idx) => {
          const isUsed = task.partsUsed.includes(part) || isCompleted;
          return (
            <button
              key={idx}
              disabled={isCompleted || isPending}
              onClick={() => togglePart(part)}
              className={`w-full flex items-center justify-between text-left text-xs p-1.5 rounded transition-colors ${
                isUsed
                  ? "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                  : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              }`}
            >
              <div className="flex items-center gap-2">
                {isUsed ? (
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <Package className="size-3.5 text-slate-400 shrink-0" />
                )}
                <span className={isUsed ? "line-through" : ""}>
                  {part}
                </span>
              </div>
            </button>
          );
        })}
        
        {!isCompleted && (
          <div className="flex items-center gap-2 mt-2 pt-1">
            <Input 
              placeholder="Add extra tool or part..." 
              className="h-7 text-xs bg-white dark:bg-slate-900"
              value={newPartInput}
              onChange={(e) => setNewPartInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addPart();
              }}
            />
            <Button size="sm" variant="secondary" className="h-7 px-2" onClick={addPart} disabled={isPending}>
              <Plus className="size-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
