import { MapSkeleton } from "@/components/map/map-dashboard-wrapper";

export default function Loading() {
  return (
    <div className="h-[calc(100vh-7.5rem)]">
      <MapSkeleton />
    </div>
  );
}
