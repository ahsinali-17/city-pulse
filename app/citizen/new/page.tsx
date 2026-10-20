"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { submitTicketAction, checkDuplicateAction, type DuplicateCheckResult } from "./actions";
import { Camera, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import {
  HazardPhotoUploader,
  SUBMISSION_TEMPLATES,
  type SubmissionTemplate,
} from "@/components/citizen/new-hazard/hazard-photo-uploader";
import { HazardAiCard } from "@/components/citizen/new-hazard/hazard-ai-card";
import { HazardLocationInput } from "@/components/citizen/new-hazard/hazard-location-input";
import { DuplicateCheckStatus } from "@/components/citizen/new-hazard/duplicate-check-status";

// ─── Empty / reset state ─────────────────────────────────────────────────────
const EMPTY_FORM = {
  category: "",
  title: "",
  severity: 3,
  confidence: 0,
  aiExplanation: "",
  suggestedDepartmentId: null as string | null,
  description: "",
};

export default function SubmitHazardPage() {
  const router = useRouter();

  // ── Photo state ─────────────────────────────────────────────────────────────
  /** null = empty, string = URL or base64 */
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  /** Non-null only when the user picked a template (not their own photo) */
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);

  // ── AI / form state ─────────────────────────────────────────────────────────
  const [isScanning, setIsScanning] = useState(false);
  const [aiScanned, setAiScanned] = useState(false);
  const [category, setCategory] = useState(EMPTY_FORM.category);
  const [title, setTitle] = useState(EMPTY_FORM.title);
  const [severity, setSeverity] = useState(EMPTY_FORM.severity);
  const [confidence, setConfidence] = useState(EMPTY_FORM.confidence);
  const [aiExplanation, setAiExplanation] = useState(EMPTY_FORM.aiExplanation);
  const [suggestedDepartmentId, setSuggestedDepartmentId] = useState<string | null>(
    EMPTY_FORM.suggestedDepartmentId
  );
  const [description, setDescription] = useState(EMPTY_FORM.description);

  // ── Location state ──────────────────────────────────────────────────────────
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // ── Duplicate / submission state ────────────────────────────────────────────
  const [duplicateResult, setDuplicateResult] = useState<DuplicateCheckResult | null>(null);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /** Full form + photo reset back to blank slate */
  const resetForm = () => {
    setSelectedPhoto(null);
    setActiveTemplateId(null);
    setIsScanning(false);
    setAiScanned(false);
    setCategory(EMPTY_FORM.category);
    setTitle(EMPTY_FORM.title);
    setSeverity(EMPTY_FORM.severity);
    setConfidence(EMPTY_FORM.confidence);
    setAiExplanation(EMPTY_FORM.aiExplanation);
    setSuggestedDepartmentId(EMPTY_FORM.suggestedDepartmentId);
    setDescription(EMPTY_FORM.description);
    setDuplicateResult(null);
    setIsCheckingDuplicate(false);
    setIsSubmitting(false);
    setLocation("");
    setLatitude(null);
    setLongitude(null);
  };

  // ─── Handlers ─────────────────────────────────────────────────────────────

  /**
   * Called when the user selects a TEMPLATE.
   * Prefills the form with static data — NO AI call, NO duplicate check,
   * submit button stays disabled.
   */
  const handleTemplateSelected = (tpl: SubmissionTemplate) => {
    // If the same template is clicked again, deselect it
    if (activeTemplateId === tpl.id) {
      resetForm();
      return;
    }
    setSelectedPhoto(tpl.imageUrl);
    setActiveTemplateId(tpl.id);
    setAiScanned(true); // show the AI card with static data
    setCategory(tpl.category);
    setTitle(tpl.title);
    setSeverity(tpl.severity);
    setConfidence(tpl.aiAnalysis.confidenceScore);
    setAiExplanation(tpl.aiAnalysis.explanation);
    setSuggestedDepartmentId(tpl.suggestedDepartmentId);
    setDescription(tpl.description);
    setDuplicateResult(null);
  };

  /**
   * Called when the user uploads their OWN photo.
   * Resets template state and runs AI triage. Duplicate checking is owned by
   * the location/category effect so it still runs if GPS is set after upload.
   */
  const handleRealPhotoSelected = async (base64: string) => {
    // Switch out of template mode
    setActiveTemplateId(null);
    setSelectedPhoto(base64);
    setAiScanned(false);
    setDuplicateResult(null);
    setLocation("");
    setLatitude(null);
    setLongitude(null);

    setIsScanning(true);

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: "", imageBase64: base64 }),
      });

      if (res.ok) {
        const data = await res.json();
        setCategory(data.category);
        setTitle(data.title);
        setSeverity(data.severity);
        setConfidence(data.confidence);
        setAiExplanation(data.explanation || "AI assessment complete.");
        setSuggestedDepartmentId(data.departmentId ?? null);
        if (data.explanation) setDescription(data.explanation);
      }
    } catch (err) {
      console.error("AI Triage error:", err);
      toast.error("AI scan failed. Please fill in the hazard details manually.");
    } finally {
      setIsScanning(false);
      setAiScanned(true);
    }
  };

  const hasRealPhoto = selectedPhoto !== null && activeTemplateId === null;
  const hasActiveLocation =
    latitude !== null && longitude !== null && location.trim().length > 0;

  // Duplicate check never runs without an active pin + address.
  useEffect(() => {
    if (
      !hasRealPhoto ||
      !aiScanned ||
      isScanning ||
      category.trim().length === 0 ||
      !hasActiveLocation ||
      latitude === null ||
      longitude === null
    ) {
      setIsCheckingDuplicate(false);
      setDuplicateResult(null);
      return;
    }

    const lat = latitude;
    const lng = longitude;
    let cancelled = false;
    setIsCheckingDuplicate(true);

    const timer = window.setTimeout(async () => {
      try {
        const dup = await checkDuplicateAction({
          category,
          severity,
          lat,
          lng,
        });
        if (cancelled) return;
        setDuplicateResult(dup);
      } catch (dupErr) {
        console.error("Duplicate check failed:", dupErr);
        if (!cancelled) {
          setDuplicateResult(null);
          toast.error("Could not check for nearby incidents. Please try again.");
        }
      } finally {
        if (!cancelled) setIsCheckingDuplicate(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    hasRealPhoto,
    aiScanned,
    isScanning,
    category,
    severity,
    hasActiveLocation,
    latitude,
    longitude,
  ]);

  /** Clears photo and resets everything. */
  const handlePhotoCleared = () => resetForm();

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!canSubmit || latitude === null || longitude === null) return;
    setIsSubmitting(true);

    try {
      const dup = await checkDuplicateAction({
        category,
        severity,
        lat: latitude,
        lng: longitude,
      });
      setDuplicateResult(dup);
      if (dup.isDuplicate) {
        toast.info(
          `A ${category} incident is already being addressed ${dup.distanceMeters}m from your location. Ticket: ${dup.existingTicketId}`
        );
        setIsSubmitting(false);
        return;
      }

      const result = await submitTicketAction({
        title,
        category,
        description,
        severity,
        imageUrl: selectedPhoto,
        address: location,
        lat: latitude,
        lng: longitude,
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

      if (!result.success) {
        setDuplicateResult(result);
        toast.info(
          `A ${category} incident is already being addressed ${result.distanceMeters}m from your location. Ticket: ${result.existingTicketId}`
        );
        setIsSubmitting(false);
        return;
      }

      toast.success("Hazard report submitted! Our team has been notified.");
      router.push("/citizen/tickets");
    } catch (err) {
      console.error("Submission failed:", err);
      toast.error("Submission failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  // ── Submission guard ───────────────────────────────────────────────────────
  const isDuplicate = duplicateResult?.isDuplicate === true;
  const canSubmit =
    hasRealPhoto &&
    hasActiveLocation &&
    aiScanned &&
    !isScanning &&
    !isCheckingDuplicate &&
    duplicateResult?.isDuplicate === false &&
    !isSubmitting;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
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
          <p className="text-xs text-muted-foreground mt-0.5">
            Upload a photo of the hazard and pin its location. Gemini AI will classify
            severity and route to the correct department.
          </p>
        </div>
        <Badge
          variant="outline"
          className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-xs font-mono hidden sm:flex"
        >
          Citizen Portal
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ── Left Column: Photo + AI Card ─────────────────────────────── */}
          <div className="space-y-4">
            <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center justify-between">
                  <span>Hazard Photo</span>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    Required
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Upload your own photo to run AI analysis and enable submission.
                  Pick an example template below to preview how the form works.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HazardPhotoUploader
                  selectedPhoto={selectedPhoto}
                  activeTemplateId={activeTemplateId}
                  onRealPhotoSelected={handleRealPhotoSelected}
                  onTemplateSelected={handleTemplateSelected}
                  onPhotoCleared={handlePhotoCleared}
                />
              </CardContent>
            </Card>

            {/* AI Triage Card — hidden until scanned */}
            {(isScanning || aiScanned) && (
              <HazardAiCard
                isScanning={isScanning}
                aiScanned={aiScanned}
                confidence={confidence}
                category={category}
                severity={severity}
                suggestedDepartmentId={suggestedDepartmentId}
                aiExplanation={aiExplanation}
              />
            )}
          </div>

          {/* ── Right Column: Location + Hazard Details ──────────────────── */}
          <div className="space-y-4">
            {/* Location — Required */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center justify-between">
                  <span>Incident Location</span>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    Required
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Coordinates pinpoint the repair location on the dispatcher GIS map.
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

            {/* Hazard Details — Optional (AI fills these) */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center justify-between">
                  <span>Hazard Details</span>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono text-muted-foreground border-dashed"
                  >
                    Optional — AI fills these
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Leave blank to let Gemini AI classify category and severity automatically.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Hazard Category <span className="font-normal">(optional)</span>
                  </Label>
                  <Select value={category} onValueChange={(val) => setCategory(val ?? "")}>
                    <SelectTrigger className="text-xs w-full sm:w-[65%]">
                      <SelectValue placeholder="AI will detect…" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectItem value="Water Leak" className="text-xs">
                        Water Main Leak / Flooding
                      </SelectItem>
                      <SelectItem value="Pothole" className="text-xs">
                        Pothole / Road Surface Damage
                      </SelectItem>
                      <SelectItem value="Power Outage" className="text-xs">
                        Electrical / Streetlight Failure
                      </SelectItem>
                      <SelectItem value="Traffic Signal" className="text-xs">
                        Traffic Signal Malfunction
                      </SelectItem>
                      <SelectItem value="Tree Branch" className="text-xs">
                        Fallen Tree / Overhanging Branch
                      </SelectItem>
                      <SelectItem value="Sanitation" className="text-xs">
                        Illegal Dumping / Trash Overflow
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Short Issue Summary <span className="font-normal">(optional)</span>
                  </Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="AI will generate a title…"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Additional Notes <span className="font-normal">(optional)</span>
                  </Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe any extra details for field crews…"
                    className="text-xs min-h-20"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Duplicate Check Status */}
            <DuplicateCheckStatus
              isChecking={isCheckingDuplicate}
              result={duplicateResult}
              category={category}
            />

            {/* Submission Actions */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <Link
                href="/"
                className={buttonVariants({ variant: "outline", size: "sm", className: "text-xs" })}
              >
                Cancel
              </Link>

              <Button
                id="submit-hazard-btn"
                type="submit"
                disabled={!canSubmit}
                title={
                  !hasRealPhoto
                    ? "Upload your own photo first"
                    : !hasActiveLocation
                    ? "Add the incident location first"
                    : isCheckingDuplicate || duplicateResult === null
                    ? "Checking for nearby incidents first"
                    : isDuplicate
                    ? "A nearby incident is already being handled"
                    : undefined
                }
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-md gap-2 px-6 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Processing Submission…</span>
                  </>
                ) : isScanning || isCheckingDuplicate ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Analysing…</span>
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
