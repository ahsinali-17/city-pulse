"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Bell,
  AlertTriangle,
  HardHat,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface NotificationItem {
  id: string;
  ticketId: string;
  ticketTitle: string;
  eventType: string;
  title: string;
  description: string;
  createdAt: string;
  href: string;
  severity: number;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        const items: NotificationItem[] = data.notifications || [];
        setNotifications(items);

        // Check against localStorage read timestamp
        const lastRead = localStorage.getItem("citypulse_last_read_notifications");
        if (lastRead) {
          const lastTime = new Date(lastRead).getTime();
          const unread = items.filter((n) => new Date(n.createdAt).getTime() > lastTime).length;
          setUnreadCount(unread);
        } else {
          setUnreadCount(items.length);
        }
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, []);

  // Initial fetch and poll every 15 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setUnreadCount(0);
      localStorage.setItem("citypulse_last_read_notifications", new Date().toISOString());
    }
  };

  const getEventIcon = (eventType: string) => {
    if (eventType.includes("WORKER")) return HardHat;
    if (eventType.includes("SUSPENDED") || eventType.includes("ARCHIVED")) return ShieldAlert;
    return AlertTriangle;
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
          >
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex size-3 items-center justify-center pointer-events-none">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2.5 bg-red-500 ring-2 ring-white dark:ring-slate-950" />
              </span>
            )}
            <span className="sr-only">View alerts ({unreadCount} unread)</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-84 sm:w-96 p-0 shadow-lg">
        <div className="p-3 border-b text-xs font-semibold flex items-center justify-between bg-slate-50 dark:bg-slate-800">
          <span className="flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
            <Bell className="size-4 text-blue-600" /> Real-time Triage Activity
          </span>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-[10px] h-4 px-1.5 font-mono">
                {unreadCount} new
              </Badge>
            )}
            <button
              onClick={() => {
                setIsLoading(true);
                fetchNotifications().finally(() => setIsLoading(false));
              }}
              title="Refresh activity"
              className="text-muted-foreground hover:text-slate-900 dark:hover:text-slate-100 p-0.5 rounded cursor-pointer transition-colors"
            >
              <RefreshCw className={`size-3 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs max-h-80 overflow-y-auto sleek-scrollbar">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground space-y-1">
              <CheckCircle2 className="size-6 text-emerald-500 mx-auto mb-1 opacity-80" />
              <p className="font-medium text-slate-900 dark:text-slate-100">All caught up!</p>
              <p className="text-[11px]">No recent operational events recorded.</p>
            </div>
          ) : (
            notifications.map((item) => {
              const Icon = getEventIcon(item.eventType);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors block group"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                      <Icon className="size-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                          {formatTimeAgo(item.createdAt)}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[11px] mt-0.5 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="font-mono text-[9px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                          #{item.ticketId}
                        </span>
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 flex items-center gap-0.5 font-medium group-hover:translate-x-0.5 transition-transform">
                          View details <ArrowRight className="size-2.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
