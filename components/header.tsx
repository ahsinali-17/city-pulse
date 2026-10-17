"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Bell,
  Menu,
  Shield,
  User,
  HardHat,
  MapPin,
  AlertTriangle,
  LogIn,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "@/components/sidebar";

export type RoleType = "CITIZEN" | "FIELD_WORKER" | "MANAGER" | "ADMIN";

const roleConfigs: Record<RoleType, { label: string; icon: React.ElementType; color: string }> = {
  CITIZEN: {
    label: "Citizen (Public)",
    icon: User,
    color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700/60",
  },
  FIELD_WORKER: {
    label: "Field Crew (PWA)",
    icon: HardHat,
    color: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700/60",
  },
  MANAGER: {
    label: "Dispatcher (GIS)",
    icon: MapPin,
    color: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700/60",
  },
  ADMIN: {
    label: "City Admin",
    icon: Shield,
    color: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700/60",
  },
};

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user;
  const userRole = ((user as any)?.role as RoleType) || "CITIZEN";
  const isAuthenticated = status === "authenticated" && !!user;

  const getPageTitle = () => {
    if (pathname.startsWith("/profile")) return "Civic Profile & Platform Settings";
    if (pathname.startsWith("/citizen/new")) return "Submit New Hazard";
    if (pathname.startsWith("/citizen/tickets")) return "Citizen Ticket Status";
    if (pathname.startsWith("/field")) return "Field Worker Task Queue";
    if (pathname.startsWith("/manager/map")) return "GIS Incident Command";
    if (pathname.startsWith("/manager/dispatch")) return "Dispatcher Workbench";
    if (pathname.startsWith("/admin/users")) return "User & Staff Management";
    if (pathname.startsWith("/admin/departments")) return "Department Governance";
    if (pathname.startsWith("/admin/review")) return "AI Routing Review Queue";
    if (pathname.startsWith("/admin")) return "Executive Audit Dashboard";
    if (pathname.startsWith("/login")) return "Authentication Portal";
    if (pathname.startsWith("/signup")) return "Citizen Onboarding";
    return "Municipal Hazard Overview";
  };

  const currentRoleConfig = roleConfigs[userRole] || roleConfigs.CITIZEN;
  const RoleIcon = currentRoleConfig.icon;

  const getUserInitials = (name?: string | null) => {
    if (!name) return "CP";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

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
        <Badge
          variant="outline"
          className="hidden sm:inline-flex text-[11px] font-mono font-normal border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 shrink-0"
        >
          City of Metroville
        </Badge>
      </div>

      {/* Right Navbar Controls */}
      <div className="ml-auto flex items-center gap-2.5 sm:gap-3 shrink-0">
        {isAuthenticated ? (
          <>
            {/* Unique Header Feature: Live AI Triage Status Indicator */}
            <div className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-medium">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
              </span>
              <span>AI Triage Active</span>
            </div>

            {/* Authenticated Role Badge */}
            <Badge
              variant="outline"
              className={`gap-1.5 text-xs font-medium border ${currentRoleConfig.color} px-2.5 py-1 hidden md:inline-flex`}
            >
              <RoleIcon className="size-3.5" />
              <span>{currentRoleConfig.label}</span>
            </Badge>

            {/* Live Notifications Bell */}
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
                  <Badge variant="secondary" className="text-[10px]">Active</Badge>
                </div>
                <div className="divide-y text-xs max-h-64 overflow-y-auto sleek-scrollbar">
                  <div className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center justify-between font-medium text-slate-900 dark:text-slate-100">
                      <span>Civic Service Online</span>
                      <span className="text-[10px] text-muted-foreground font-mono">Just now</span>
                    </div>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      Signed in as {user?.name || "Civic Operator"}. Municipal services running at optimal capacity.
                    </p>
                  </div>
                  <div className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center justify-between font-medium text-slate-900 dark:text-slate-100">
                      <span>Offline Sync Ready</span>
                      <span className="text-[10px] text-muted-foreground font-mono">Standby</span>
                    </div>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      PWA local database initialized. Ready for field offline caching.
                    </p>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile Link directly accessible on clicking user image */}
            <Link
              href="/profile"
              title="Civic Profile & Account Settings"
              className="rounded-full ring-offset-background hover:ring-2 hover:ring-blue-500/50 transition-all block"
            >
              <Avatar className="size-8 border border-slate-300 dark:border-slate-700 shadow-xs hover:border-blue-500 transition-colors">
                <AvatarImage src={user?.image || undefined} alt={user?.name || "User avatar"} />
                <AvatarFallback className="bg-blue-600 text-white font-semibold text-xs">
                  {getUserInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
            </Link>

          </>
        ) : (
          /* Unauthenticated State: Show Sign In & Sign Up buttons */
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-xs inline-flex items-center gap-1.5"
              )}
            >
              <LogIn className="size-3.5" />
              <span>Sign In</span>
            </Link>
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-xs"
              )}
            >
              <span>Register</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}


