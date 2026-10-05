"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

function MapSkeleton() {
  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)] space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-36" />
        </div>
      </div>
      <Skeleton className="flex-1 rounded-xl" />
    </div>
  );
}

const MapDashboard = dynamic(() => import("@/components/map-dashboard"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

export default function GISMapPage() {
  return (
    <div className="h-[calc(100vh-7.5rem)]">
      <MapDashboard />
    </div>
  );
}
