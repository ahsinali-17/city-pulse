"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Menu,
  Shield,
  User,
  HardHat,
  MapPin,
  Plus,
  Check,
  Search,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "@/components/sidebar";

export type UserRole = "citizen" | "field_worker" | "manager" | "admin";

const rolesMap: Record<UserRole, { label: string; icon: React.ElementType; color: string }> = {
  citizen: { label: "Citizen (Public)", icon: User, color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300" },
  field_worker: { label: "Field Worker (PWA)", icon: HardHat, color: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300" },
  manager: { label: "Dispatcher (GIS)", icon: MapPin, color: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-300" },
  admin: { label: "City Admin", icon: Shield, color: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-300" },
};

export function Header() {
  const pathname = usePathname();
  const [activeRole, setActiveRole] = useState<UserRole>("manager");

  const getPageTitle = () => {
    if (pathname.startsWith("/citizen/new")) return "Submit New Hazard";
    if (pathname.startsWith("/citizen/tickets")) return "Citizen Ticket Status";
    if (pathname.startsWith("/field")) return "Field Worker Task Queue";
    if (pathname.startsWith("/manager/map")) return "GIS Incident Command";
    if (pathname.startsWith("/manager/dispatch")) return "Dispatcher Workbench";
    if (pathname.startsWith("/admin/users")) return "User & Staff Management";
    if (pathname.startsWith("/admin")) return "Executive Audit Dashboard";
    return "Municipal Hazard Overview";
  };

  const RoleIcon = rolesMap[activeRole].icon;

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/90 px-4 md:px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 shadow-xs">
      {/* Mobile Drawer */}
      <Sheet>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" className="md:hidden text-slate-700 dark:text-slate-200">
              <Menu className="size-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          }
        />
        <SheetContent side="left" className="p-0 border-r-0 w-64 bg-slate-900 text-white">
          <SheetTitle className="sr-only">Mobile Navigation Drawer</SheetTitle>
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Page Breadcrumb / Title */}
      <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial">
        <h1 className="text-xs sm:text-sm md:text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100 truncate max-w-37.5 xs:max-w-[200px] sm:max-w-none">
          {getPageTitle()}
        </h1>
        <Badge variant="outline" className="hidden sm:inline-flex text-[11px] font-mono font-normal border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 shrink-0">
          City of Metroville
        </Badge>
      </div>

      {/* Right Navbar Controls */}
      <div className="ml-auto flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Quick Report Action */}
        <Button   size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs hidden sm:inline-flex">
          <Link href="/citizen/new" className="inline-flex items-center gap-1.5">
            <Plus className="size-4 shrink-0" />
            <span className="whitespace-nowrap">Report Hazard</span>
          </Link>
        </Button>


        {/* Role Simulator Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className={`gap-1.5 text-xs font-medium border ${rolesMap[activeRole].color} transition-colors`}
              >
                <RoleIcon className="size-3.5" />
                <span className="hidden md:inline">{rolesMap[activeRole].label}</span>
                <span className="md:hidden capitalize">{activeRole}</span>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Simulate Persona Role (RBAC)
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(Object.keys(rolesMap) as UserRole[]).map((role) => {
              const Icon = rolesMap[role].icon;
              return (
                <DropdownMenuItem
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className="flex items-center justify-between text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-slate-500" />
                    <span>{rolesMap[role].label}</span>
                  </div>
                  {activeRole === role && <Check className="size-4 text-blue-600" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notification Bell */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="relative text-slate-600 dark:text-slate-300">
                <Bell className="size-5" />
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
                <span className="sr-only">View alerts</span>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="p-3 border-b text-xs font-semibold flex items-center justify-between bg-slate-50 dark:bg-slate-800">
              <span className="flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
                <AlertTriangle className="size-4 text-amber-500" /> Live Triage Notifications
              </span>
              <Badge variant="secondary" className="text-[10px]">3 New</Badge>
            </div>
            <div className="divide-y text-xs max-h-64 overflow-y-auto">
              <div className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                <div className="flex items-center justify-between font-medium text-slate-900 dark:text-slate-100">
                  <span>Critical Pothole Flagged</span>
                  <span className="text-[10px] text-muted-foreground font-mono">2m ago</span>
                </div>
                <p className="text-muted-foreground text-[11px] mt-0.5">Gemini AI scored 5/5 severity on Main St & 4th Ave.</p>
              </div>
              <div className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                <div className="flex items-center justify-between font-medium text-slate-900 dark:text-slate-100">
                  <span>Offline Sync Completed</span>
                  <span className="text-[10px] text-muted-foreground font-mono">15m ago</span>
                </div>
                <p className="text-muted-foreground text-[11px] mt-0.5">Field Crew #4 synced 5 resolved repair orders.</p>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="size-8 border border-slate-300 dark:border-slate-700">
                  <AvatarImage src="/placeholder-avatar.png" alt="User avatar" />
                  <AvatarFallback className="bg-blue-600 text-white font-semibold text-xs">
                    CP
                  </AvatarFallback>
                </Avatar>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">Alex Rivera</span>
                <span className="text-xs text-muted-foreground">alex.rivera@metroville.gov</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs cursor-pointer">Account Settings</DropdownMenuItem>
            <DropdownMenuItem className="text-xs cursor-pointer">Offline Data Caching</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs text-red-600 cursor-pointer">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
