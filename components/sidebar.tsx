"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ShieldAlert,
  PlusCircle,
  Ticket,
  HardHat,
  MapPin,
  SlidersHorizontal,
  BarChart3,
  UserPlus,
  Radio,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import LogoutButton from "./logout";

interface NavGroup {
  label: string;
  items: {
    title: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

const navGroups: NavGroup[] = [
  {
    label: "Citizen Services",
    items: [
      { title: "Report Hazard", href: "/citizen/new", icon: PlusCircle, badge: "AI Vision" },
      { title: "My Submissions", href: "/citizen/tickets", icon: Ticket },
    ],
  },
  {
    label: "Field Operations",
    items: [
      { title: "Field Queue (PWA)", href: "/field", icon: HardHat, badge: "Offline" },
    ],
  },
  {
    label: "Dispatch & GIS",
    items: [
      { title: "GIS Incident Map", href: "/manager/map", icon: MapPin },
      { title: "Ticket Dispatch", href: "/manager/dispatch", icon: SlidersHorizontal },
    ],
  },
  {
    label: "Administration",
    items: [
      { title: "Executive Analytics", href: "/admin", icon: BarChart3 },
      { title: "Staff Onboarding", href: "/admin/users", icon: UserPlus },
    ],
  },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col w-64 bg-slate-900 text-slate-100 border-r border-slate-800 shrink-0 select-none min-h-screen",
        className
      )}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg group-hover:bg-blue-600/30 transition-colors border border-blue-500/30">
            <ShieldAlert className="size-6 text-blue-400" />
          </div>
          <div>
            <span className="font-semibold text-lg tracking-tight block leading-none text-white">
              CityPulse
            </span>
            <span className="text-[11px] font-medium text-slate-400 tracking-wider uppercase">
              Triage Hub
            </span>
          </div>
        </Link>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-500/40 text-emerald-400 bg-emerald-950/40">
          v1.0 UI
        </Badge>
      </div>

      {/* Nav Content */}
      <div className="w-full flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin relative overflow-x-hidden">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1.5">
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {group.label}
            </p>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all group relative",
                      isActive
                        ? "bg-blue-600/20 text-blue-300 font-semibold border-l-2 border-blue-500 pl-2.5"
                        : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0 transition-colors",
                        isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-200"
                      )}
                    />
                    <span className="truncate flex-1">{item.title}</span>

                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] px-1.5 py-0 rounded font-mono font-normal border-0",
                          item.badge === "Offline"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        )}
                      >
                        {item.badge}
                      </Badge>
                    )}

                    {isActive && (
                      <ChevronRight className="size-3.5 text-blue-400 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
        
        <LogoutButton/>
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="flex items-center gap-1.5 font-mono">
            <Radio className="size-3 text-emerald-400 animate-pulse" />
            Network: Online
          </span>
          <span className="text-[10px] font-mono text-slate-500">PWA Ready</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2">
          <CheckCircle2 className="size-3.5 text-emerald-400" />
          <span>Gemini AI Triage Pipeline Active</span>
        </div>
      </div>
    </aside>
  );
}
