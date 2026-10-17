"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Crosshair, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HazardLocationInputProps {
  location: string;
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (address: string) => void;
  onCoordinatesChange: (lat: number | null, lng: number | null) => void;
}

export function HazardLocationInput({
  location,
  latitude,
  longitude,
  onLocationChange,
  onCoordinatesChange,
}: HazardLocationInputProps) {
  const [isLocating, setIsLocating] = useState(false);
  const isSettingFromGpsRef = useRef(false);
  const initialRenderRef = useRef(true);

  // Browser GPS detection handler
  const handleDetectGPS = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        onCoordinatesChange(lat, lon);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
            {
              headers: { "User-Agent": "CityPulse-Triage-App" },
            }
          );
          if (res.ok) {
            const data = await res.json();
            if (data.display_name) {
              isSettingFromGpsRef.current = true;
              onLocationChange(data.display_name);
            }
          }
        } catch (err) {
          console.error("Reverse geocoding error:", err);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // 500ms debounced forward geocoding on address input
  useEffect(() => {
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }
    if (isSettingFromGpsRef.current) {
      isSettingFromGpsRef.current = false;
      return;
    }
    if (!location.trim()) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            location
          )}&format=json&limit=1`,
          {
            headers: { "User-Agent": "CityPulse-Triage-App" },
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            onCoordinatesChange(parseFloat(data[0].lat), parseFloat(data[0].lon));
          }
        }
      } catch (err) {
        console.error("Forward geocoding error:", err);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [location, onCoordinatesChange]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="hazard-address" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Incident Street Address
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLocating}
          onClick={handleDetectGPS}
          className="text-xs h-7 gap-1 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40"
        >
          {isLocating ? (
            <>
              <Loader2 className="size-3 animate-spin" /> Detecting GPS...
            </>
          ) : (
            <>
              <Crosshair className="size-3" /> Auto-Detect GPS
            </>
          )}
        </Button>
      </div>

      <div className="relative">
        <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <Input
          id="hazard-address"
          type="text"
          required
          placeholder="e.g., 452 Elm Street, Downtown Metroville"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          className="pl-9 text-xs bg-slate-50 dark:bg-slate-950"
        />
      </div>

      {latitude !== null && longitude !== null && (
        <div className="flex items-center gap-2 pt-0.5">
          <Badge variant="outline" className="text-[10px] font-mono border-slate-300 dark:border-slate-700 text-slate-500">
            Lat: {latitude.toFixed(5)}
          </Badge>
          <Badge variant="outline" className="text-[10px] font-mono border-slate-300 dark:border-slate-700 text-slate-500">
            Lng: {longitude.toFixed(5)}
          </Badge>
        </div>
      )}
    </div>
  );
}
