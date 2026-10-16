"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { type FieldTask } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { getCachedTile, cacheTile } from "@/lib/db/offline";

function createCachedTileLayer() {
  const CachedTileLayerClass = (L.TileLayer as any).extend({
    createTile(coords: any, done: (err: any, tile: HTMLImageElement) => void) {
      const tile = document.createElement("img");
      const key = `${coords.z}/${coords.x}/${coords.y}`;
      const url = this.getTileUrl(coords);

      getCachedTile(key).then((cached) => {
        if (cached) {
          tile.src = cached;
          done(null, tile);
        } else {
          fetch(url)
            .then((res) => res.blob())
            .then((blob) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const dataUrl = reader.result as string;
                cacheTile(key, dataUrl);
                tile.src = dataUrl;
                done(null, tile);
              };
              reader.readAsDataURL(blob);
            })
            .catch(() => {
              // Fallback directly to url if offline or fetch fails
              tile.src = url;
              done(null, tile);
            });
        }
      });

      return tile;
    },
  });

  return new CachedTileLayerClass("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  });
}

function CachedTileLayerComponent() {
  const map = useMap();

  useEffect(() => {
    const tileLayer = createCachedTileLayer();
    tileLayer.addTo(map);
    return () => {
      map.removeLayer(tileLayer);
    };
  }, [map]);

  return null;
}

function MapAutoBounds({ tasks }: { tasks: FieldTask[] }) {
  const map = useMap();

  useEffect(() => {
    const validCoords = tasks
      .filter((t) => t.coordinates && t.coordinates.lat && t.coordinates.lng)
      .map((t) => [t.coordinates.lat, t.coordinates.lng] as [number, number]);

    if (validCoords.length > 0) {
      if (validCoords.length === 1) {
        map.setView(validCoords[0], 14);
      } else {
        const bounds = L.latLngBounds(validCoords);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    }
  }, [tasks, map]);

  return null;
}

interface FieldTaskMapProps {
  tasks: FieldTask[];
}

export default function FieldTaskMap({ tasks }: FieldTaskMapProps) {
  const defaultCenter = useMemo<[number, number]>(() => {
    const firstWithCoords = tasks.find((t) => t.coordinates?.lat && t.coordinates?.lng);
    if (firstWithCoords && firstWithCoords.coordinates) {
      return [firstWithCoords.coordinates.lat, firstWithCoords.coordinates.lng];
    }
    return [40.7128, -74.0060];
  }, [tasks]);

  return (
    <div className="w-full h-105 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <CachedTileLayerComponent />
        <MapAutoBounds tasks={tasks} />

        {(() => {
          const coordCounts = new Map<string, number>();
          return tasks.map((task) => {
            if (!task.coordinates?.lat || !task.coordinates?.lng) return null;
            const baseLat = task.coordinates.lat;
            const baseLng = task.coordinates.lng;

            // Offset identical coordinates slightly so both pins can be clicked
            const key = `${baseLat.toFixed(4)},${baseLng.toFixed(4)}`;
            const count = coordCounts.get(key) || 0;
            coordCounts.set(key, count + 1);

            const lat = count > 0 ? baseLat + (count * 0.0003) : baseLat;
            const lng = count > 0 ? baseLng + (count * 0.0003) : baseLng;

            const markerColor =
              task.severity >= 4
                ? "#ef4444"
                : task.severity === 3
                ? "#f59e0b"
                : "#3b82f6";

            return (
              <CircleMarker
                key={task.id}
                center={[lat, lng]}
                radius={8}
                pathOptions={{
                  color: "#ffffff",
                  weight: 2,
                  fillColor: markerColor,
                  fillOpacity: 0.95,
                }}
              >
                <Popup>
                  <div className="p-1 space-y-2 text-xs min-w-44">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-slate-500 font-bold">
                        #{task.id}
                      </span>
                      <Badge
                        className={`text-[10px] px-1.5 py-0 text-white font-mono ${
                          task.severity >= 4
                            ? "bg-red-600"
                            : task.severity === 3
                            ? "bg-amber-500"
                            : "bg-blue-600"
                        }`}
                      >
                        Severity {task.severity}/5
                      </Badge>
                    </div>
                    <h4 className="font-bold text-slate-900 leading-snug">
                      {task.title}
                    </h4>
                    <div className="flex items-start gap-1 text-[11px] text-slate-600">
                      <MapPin className="size-3 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{task.address}</span>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          });
        })()}
      </MapContainer>
    </div>
  );
}
