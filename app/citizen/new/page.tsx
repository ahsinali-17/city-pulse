"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Camera,
  Upload,
  MapPin,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Info,
  ArrowLeft,
  X,
  FileImage,
  Crosshair,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const SAMPLE_PHOTOS = [
  {
    label: "Water Burst",
    url: "https://images.unsplash.com/photo-1686890363933-4a1125d4e3b0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHdhdGVyJTIwbGVha2FnZXxlbnwwfHwwfHx8MA%3D%3D",
    category: "Water Leak",
    severity: 5,
    title: "High Pressure Water Main Burst",
  },
  {
    label: "Deep Pothole",
    url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    category: "Pothole",
    severity: 4,
    title: "Deep Pothole in Right Lane",
  },
  {
    label: "Fallen Tree",
    url: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80",
    category: "Tree Branch",
    severity: 2,
    title: "Overhanging Broken Tree Branch",
  },
];

export default function SubmitHazardPage() {
  const router = useRouter();

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(SAMPLE_PHOTOS[0].url);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [aiScanned, setAiScanned] = useState<boolean>(true);
  const [category, setCategory] = useState<string>("Water Leak");
  const [title, setTitle] = useState<string>("High Pressure Water Main Burst on Elm St");
  const [description, setDescription] = useState<string>(
    "Water gushing from asphalt near sewer grate, causing road erosion and flooding sidewalk."
  );
  const [location, setLocation] = useState<string>("452 Elm Street, Downtown Metroville");
  const [coordinates, setCoordinates] = useState<string>("40.7128, -74.0060");
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSelectSample = (sample: typeof SAMPLE_PHOTOS[0]) => {
    setSelectedPhoto(sample.url);
    setIsScanning(true);
    setAiScanned(false);

    setTimeout(() => {
      setIsScanning(false);
      setAiScanned(true);
      setCategory(sample.category);
      setTitle(sample.title);
    }, 1200);
  };

  const handleDetectGPS = () => {
    setIsLocating(true);
    setTimeout(() => {
      setIsLocating(false);
      setLocation("452 Elm Street, Metroville (GPS Verified)");
      setCoordinates("40.7128° N, 74.0060° W");
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      router.push("/citizen/tickets/demo-123");
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1 mb-1 transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Back to Triage Hub
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Camera className="size-6 text-blue-600" /> Submit Municipal Hazard Report
          </h1>
          <p className="text-xs text-muted-foreground">
            Snap a photo or upload an image. Gemini AI will analyze the hazard, score severity, and check for duplicate reports.
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-xs font-mono">
          Citizen Portal
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Photo Upload & AI Vision Preview */}
          <div className="space-y-4">
            <Card className="border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileImage className="size-4 text-blue-600" /> Hazard Photo & Camera
                  </span>
                  <Badge variant="secondary" className="text-[10px] font-mono">Required</Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Upload a photo or select a sample image below to trigger Gemini AI Triage.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image Upload Display Box */}
                <div className="relative rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 overflow-hidden aspect-video flex flex-col items-center justify-center group">
                  {selectedPhoto ? (
                    <>
                      {/* Image */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedPhoto}
                        alt="Hazard upload preview"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* AI Scanning Overlay Effect */}
                      {isScanning && (
                        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2 animate-fade-in">
                          <Loader2 className="size-8 text-blue-400 animate-spin" />
                          <p className="text-xs font-mono font-medium tracking-wide flex items-center gap-1.5">
                            <Sparkles className="size-3.5 text-blue-300 animate-pulse" /> Gemini Vision AI Scanning...
                          </p>
                        </div>
                      )}

                      {/* AI Scan Badge Overlay */}
                      {!isScanning && aiScanned && (
                        <div className="absolute top-3 left-3 bg-slate-900/85 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-mono flex items-center gap-1.5 border border-blue-500/40 shadow-md">
                          <Sparkles className="size-3 text-blue-400" />
                          <span>Gemini Vision: 5/5 Critical</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedPhoto(null)}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition-colors"
                      >
                        <X className="size-4" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-6 space-y-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-full inline-block">
                        <Upload className="size-6" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          Click to upload or drag & drop hazard photo
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">JPG, PNG, or WEBP (Max 10MB)</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sample Images Quick Selector */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                    <Sparkles className="size-3.5 text-blue-500" /> Demo Sample Photos (One-Click AI Scan)
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {SAMPLE_PHOTOS.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSample(sample)}
                        className={`relative rounded-lg overflow-hidden border-2 text-left text-[11px] font-medium p-1 transition-all ${
                          selectedPhoto === sample.url
                            ? "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-950/30"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-400"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={sample.url} alt={sample.label} className="w-full h-14 object-cover rounded" />
                        <span className="block mt-1 truncate px-0.5 text-slate-800 dark:text-slate-200">{sample.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Real-time Triage Insight Box */}
            <Card className="border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="size-4 text-blue-600" /> AI Triage Assessment Preview
                  </span>
                  <Badge variant="outline" className="text-[10px] border-blue-400/50 text-blue-600 dark:text-blue-300">
                    Confidence: 97.4%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/50">
                  <span className="text-muted-foreground">Predicted Hazard:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{category}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/50">
                  <span className="text-muted-foreground">AI Severity Score:</span>
                  <Badge className="bg-red-600 text-white font-mono font-bold text-xs px-2 py-0.5">
                    5 / 5 (Critical Emergency)
                  </Badge>
                </div>

                <Alert className="bg-white/80 dark:bg-slate-900/80 border-blue-200 dark:border-blue-900 p-2.5">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  <AlertTitle className="text-xs font-semibold text-slate-900 dark:text-slate-100">100m Spatial Duplicate Check</AlertTitle>
                  <AlertDescription className="text-[11px] text-muted-foreground">
                    0 duplicate reports found within 100 meters. New unique incident ticket created.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Location & Report Form Details */}
          <div className="space-y-4">
            <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <MapPin className="size-4 text-emerald-600" /> Incident Location & Geolocation
                </CardTitle>
                <CardDescription className="text-xs">
                  We capture GPS coordinates to pinpoint repair sites on the dispatcher map.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Street Address / Landmark</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleDetectGPS}
                      disabled={isLocating}
                      className="h-6 text-[11px] text-blue-600 hover:text-blue-700 gap-1 px-2"
                    >
                      {isLocating ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Crosshair className="size-3" />
                      )}
                      <span>{isLocating ? "Fetching GPS..." : "Detect GPS"}</span>
                    </Button>
                  </div>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. 452 Elm Street"
                    className="text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Coordinates (Latitude, Longitude)</Label>
                  <Input
                    value={coordinates}
                    onChange={(e) => setCoordinates(e.target.value)}
                    placeholder="40.7128, -74.0060"
                    className="text-xs font-mono bg-slate-50 dark:bg-slate-900"
                    readOnly
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Hazard Details & Category</CardTitle>
                <CardDescription className="text-xs">
                  Provide context to assist field repair teams dispatched to this location.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Hazard Category</Label>
                  <Select value={category} onValueChange={(val) => setCategory(val ?? "")}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Water Leak" className="text-xs">Water Main Leak / Flooding</SelectItem>
                      <SelectItem value="Pothole" className="text-xs">Pothole / Road Surface Damage</SelectItem>
                      <SelectItem value="Power Outage" className="text-xs">Electrical / Streetlight Failure</SelectItem>
                      <SelectItem value="Traffic Signal" className="text-xs">Traffic Signal Malfunction</SelectItem>
                      <SelectItem value="Tree Branch" className="text-xs">Fallen Tree / Overhanging Branch</SelectItem>
                      <SelectItem value="Sanitation" className="text-xs">Illegal Dumping / Trash Overflow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Short Issue Summary</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Water main leak on Elm Street"
                    className="text-xs"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Detailed Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe severity, hazards to traffic or pedestrians..."
                    className="text-xs min-h-25"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submission Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" size="sm" className="text-xs">
                <Link href="/">Cancel</Link>
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting || !selectedPhoto}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-md gap-2 px-6"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Processing Submission...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    <span>Submit Hazard Report</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
