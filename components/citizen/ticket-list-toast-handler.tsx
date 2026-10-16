"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "@/components/ui/toast";

export function TicketListToastHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "unauthorized" && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      toast.error("Ticket not found or unauthorized");
      // Clean query params from URL without refreshing
      router.replace(pathname);
    }
  }, [searchParams, router, pathname]);

  return null;
}
