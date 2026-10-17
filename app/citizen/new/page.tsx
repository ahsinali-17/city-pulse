"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { submitTicketAction } from "./actions";
import {
  Camera,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  HazardPhotoUploader,
  SAMPLE_PHOTOS,
} from "@/components/citizen/new-hazard/hazard-photo-uploader";
import { HazardAiCard } from "@/components/citizen/new-hazard/hazard-ai-card";
import { HazardLocationInput } from "@/components/citizen/new-hazard/hazard-location-input";

export default function SubmitHazardPage() {
  const router = useRouter();

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(SAMPLE_PHOTOS[0].url);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [aiScanned, setAiScanned] = useState<boolean>(true);
  const [category, setCategory] = useState<string>("Water Leak");
  const [title, setTitle] = useState<string>("High Pressure Water Main Burst on Elm St");
  const [severity, setSeverity] = useState<number>(5);
  const [confidence, setConfidence] = useState<number>(97.4);
  const [aiExplanation, setAiExplanation] = useState<string>("AI assessment is ready for review.");
  const [suggestedDepartmentId, setSuggestedDepartmentId] = useState<string | null>("dept-water");
  const [description, setDescription] = useState<string>(
    "Water gushing from asphalt near sewer grate, causing road erosion and flooding sidewalk."
  );
  const [location, setLocation] = useState<string>("452 Elm Street, Downtown Metroville");
  const [latitude, setLatitude] = useState<number | null>(40.7128);
  const [longitude, setLongitude] = useState<number | null>(-74.0060);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const runAiTriage = async (imageUrl: string = "", imageBase64: string = "") => {
    setIsScanning(true);
    setAiScanned(false);
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, imageBase64 }),
      });
      if (res.ok) {
        const data = await res.json();
        setCategory(data.category);
        setTitle(data.title);
        setSeverity(data.severity);
        setConfidence(data.confidence);
        setAiExplanation(data.explanation || "AI assessment is ready for review.");
        setSuggestedDepartmentId(data.departmentId ?? null);
        if (data.explanation) {
          setDescription(data.explanation);
        }
      }
    } catch (err) {
      console.error("AI Triage error:", err);
    } finally {
      setIsScanning(false);
      setAiScanned(true);
    }
  };

  const handlePhotoSelected = (url: string, base64: string) => {
    const photo = url || base64;
    setSelectedPhoto(photo);
    runAiTriage(url, base64);
  };

  const handlePhotoCleared = () => {
    setSelectedPhoto(null);
    setAiScanned(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const lat = latitude ?? 0;
    const lng = longitude ?? 0;

    try {
      await submitTicketAction({
        title,
        category,
        description,
        severity,
        imageUrl: selectedPhoto,
        address: location,
        lat,
        lng,
        aiConfidence: confidence,
        aiSuggestedDepartmentId: suggestedDepartmentId,
        aiAnalysis: {
          detectedCategory: category,
          title,
          severityScore: severity,
          confidenceScore: confidence,
          explanation: aiExplanation,
        },
      });
      router.push("/citizen/tickets");
    } catch (err) {
      console.error("Submission failed:", err);
      setIsSubmitting(false);
    }
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
            Snap a photo or upload an image. Gemini AI will analyze the hazard, score severity, and route to the correct municipal department.
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
            <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center justify-between">
                  <span>Hazard Photo & Visual Evidence</span>
                  <Badge variant="secondary" className="text-[10px] font-mono">Required</Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Upload a photo or select a sample image below to trigger Gemini AI Triage.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HazardPhotoUploader
                  selectedPhoto={selectedPhoto}
                  onPhotoSelected={handlePhotoSelected}
                  onPhotoCleared={handlePhotoCleared}
                />
              </CardContent>
            </Card>

            {/* AI Real-time Triage Insight Box */}
            <HazardAiCard
              isScanning={isScanning}
              aiScanned={aiScanned}
              confidence={confidence}
              category={category}
              severity={severity}
              suggestedDepartmentId={suggestedDepartmentId}
              aiExplanation={aiExplanation}
            />
          </div>

          {/* Right Column: Location & Report Form Details */}
          <div className="space-y-4">
            <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Incident Location</CardTitle>
                <CardDescription className="text-xs">
                  Coordinates pinpoint the repair location on the dispatcher map.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HazardLocationInput
                  location={location}
                  latitude={latitude}
                  longitude={longitude}
                  onLocationChange={setLocation}
                  onCoordinatesChange={(lat, lng) => {
                    setLatitude(lat);
                    setLongitude(lng);
                  }}
                />
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
                    <SelectTrigger className="text-xs w-full sm:w-[60%]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
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
                    className="text-xs min-h-24"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submission Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href="/"
                className={buttonVariants({ variant: "outline", size: "sm", className: "text-xs" })}
              >
                Cancel
              </Link>

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
