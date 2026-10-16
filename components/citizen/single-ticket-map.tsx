"use client";

import { useEffect } from "react";
import { MapContainer, CircleMarker, Popup, useMap, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
}

interface SingleTicketMapProps {
  lat: number;
  lng: number;
  title: string;
  address: string;
  severity: number;
}

export default function SingleTicketMap({
  lat,
  lng,
  title,
  address,
  severity,
}: SingleTicketMapProps) {
  const validLat = typeof lat === "number" && !isNaN(lat) ? lat : 40.7128;
  const validLng = typeof lng === "number" && !isNaN(lng) ? lng : -74.006;

  const markerColor =
    severity >= 4 ? "#ef4444" : severity === 3 ? "#f59e0b" : "#3b82f6";

  return (
    <MapContainer
      center={[validLat, validLng]}
      zoom={15}
      scrollWheelZoom={true}
      className="w-full h-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterMap lat={validLat} lng={validLng} />

      <CircleMarker
        center={[validLat, validLng]}
        radius={10}
        pathOptions={{
          color: "#ffffff",
          weight: 2.5,
          fillColor: markerColor,
          fillOpacity: 0.95,
        }}
      >
        <Popup>
          <div className="p-1 space-y-1.5 text-xs min-w-44">
            <div className="flex items-center justify-between gap-2">
              <Badge
                className={`text-[10px] px-1.5 py-0 text-white font-mono ${
                  severity >= 4
                    ? "bg-red-600"
                    : severity === 3
                    ? "bg-amber-500"
                    : "bg-blue-600"
                }`}
              >
                Severity {severity}/5
              </Badge>
            </div>
            <h4 className="font-bold text-slate-900 leading-snug">{title}</h4>
            <div className="flex items-start gap-1 text-[11px] text-slate-600">
              <MapPin className="size-3 text-emerald-600 shrink-0 mt-0.5" />
              <span>{address}</span>
            </div>
          </div>
        </Popup>
      </CircleMarker>
    </MapContainer>
  );
}
