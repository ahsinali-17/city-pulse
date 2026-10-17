"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/toast";
import { updateProfile, updatePassword } from "@/app/profile/actions";
import {
  User,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";


interface ProfileUserData {
  id: string;
  name: string;
  email: string;
  role: string;
  departmentId: string | null;
  departmentName?: string | null;
  departmentStatus?: string | null;
  departmentStatusReason?: string | null;
  isActive: boolean;
  avatarUrl: string | null;
  createdAt: string;
}

const PRESET_AVATARS = [
  {
    name: "Civic Blue",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Executive Slate",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Field Crew Amber",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Dispatch Green",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  },
];

export function ProfileTabs({ initialUser }: { initialUser: ProfileUserData }) {
  const { update: updateSession } = useSession();

  // Profile info state
  const [name, setName] = useState(initialUser.name || "");
  const [avatarUrl, setAvatarUrl] = useState(initialUser.avatarUrl || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Profile form submission

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Display name cannot be empty.");
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const res = await updateProfile({
        name: name.trim(),
        avatarUrl: avatarUrl.trim(),
      });

      if (res.success) {
        toast.success(res.message || "Profile updated successfully.");
        // Refresh NextAuth client session so header avatar and name update
        await updateSession({
          name: name.trim(),
          image: avatarUrl.trim() || null,
        });
      } else {
        toast.error(res.error || "Failed to update profile.");
      }
    } catch {
      toast.error("An error occurred while saving profile.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Password form submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await updatePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (res.success) {
        toast.success(res.message || "Password updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res.error || "Failed to update password.");
      }
    } catch {
      toast.error("An error occurred while changing password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const getInitials = (val: string) => {
    if (!val) return "CP";
    const parts = val.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return val.slice(0, 2).toUpperCase();
  };

  return (
    <Tabs defaultValue="details" className="w-full space-y-6">
      <TabsList className="grid w-full grid-cols-2 max-w-sm bg-slate-200/80 dark:bg-slate-800/80 p-1">
        <TabsTrigger value="details" className="text-xs font-medium">
          Account Details
        </TabsTrigger>
        <TabsTrigger value="security" className="text-xs font-medium">
          Security & Password
        </TabsTrigger>
      </TabsList>


      {/* TAB 1: Account Details & Avatar */}
      <TabsContent value="details" className="space-y-6">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <User className="size-4 text-blue-500" />
              <span>Public Civic Profile</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Manage your municipal identity, display name, and public triage avatar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                <div className="relative group shrink-0">
                  <Avatar className="size-20 border-2 border-blue-500/30 shadow-md">
                    <AvatarImage src={avatarUrl || undefined} alt={name} />
                    <AvatarFallback className="bg-blue-600 text-white font-bold text-lg">
                      {getInitials(name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-slate-800 rounded-full shadow-xs border border-slate-200 dark:border-slate-700">
                    <Sparkles className="size-3.5 text-blue-500" />
                  </div>
                </div>

                <div className="space-y-2 flex-1">
                  <Label htmlFor="avatarUrl" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Avatar Image URL
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="avatarUrl"
                      type="url"
                      placeholder="https://example.com/avatar.jpg"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="text-xs font-mono"
                    />
                    {avatarUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setAvatarUrl("")}
                        className="text-xs text-muted-foreground hover:text-red-500"
                      >
                        Clear
                      </Button>
                    )}
                  </div>

                  {/* Preset Avatars */}
                  <div className="pt-2">
                    <span className="text-[11px] text-muted-foreground block mb-1.5 font-medium">
                      Or choose a municipal preset:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_AVATARS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setAvatarUrl(preset.url)}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] border transition-all ${
                            avatarUrl === preset.url
                              ? "bg-blue-500/15 border-blue-500 text-blue-600 dark:text-blue-400 font-semibold"
                              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                          }`}
                        >
                          <Avatar className="size-4">
                            <AvatarImage src={preset.url} alt={preset.name} />
                          </Avatar>
                          <span>{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-name" className="text-xs font-semibold">
                    Display Name / Username
                  </Label>
                  <Input
                    id="profile-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="text-xs"
                  />
                  <span className="text-[10px] text-muted-foreground">
                    This will appear on dispatch logs, hazard tickets, and crew notes.
                  </span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-email" className="text-xs font-semibold">
                    Email Address (Official Civic ID)
                  </Label>
                  <Input
                    id="profile-email"
                    type="email"
                    disabled
                    value={initialUser.email}
                    className="text-xs bg-slate-100 dark:bg-slate-800/60 cursor-not-allowed opacity-80"
                  />
                  <span className="text-[10px] text-muted-foreground">
                    Email is locked to your municipal registration record.
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isUpdatingProfile} className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                  {isUpdatingProfile ? (
                    <>
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-1.5 size-3.5" />
                      Save Profile Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* TAB 2: Security & Password */}
      <TabsContent value="security" className="space-y-6">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <KeyRound className="size-4 text-purple-500" />
              <span>Password & Security Credentials</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Change your password to keep your municipal operator account secure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
              {/* Current Password */}
              <div className="space-y-1.5">
                <Label htmlFor="current-password" className="text-xs font-semibold">
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="text-xs pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <Label htmlFor="new-password" className="text-xs font-semibold">
                  New Password
                </Label>
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="text-xs"
                />
                {newPassword.length > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className={`h-1 flex-1 rounded-full transition-all ${
                        newPassword.length >= 6
                          ? newPassword.length >= 10
                            ? "bg-emerald-500"
                            : "bg-amber-400"
                          : "bg-red-400"
                      }`}
                    />
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {newPassword.length < 6 ? "Too short" : newPassword.length >= 10 ? "Strong" : "Good"}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password" className="text-xs font-semibold">
                  Confirm New Password
                </Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className={`text-xs ${
                    confirmPassword && confirmPassword !== newPassword ? "border-red-400" : ""
                  }`}
                />
                {confirmPassword && confirmPassword !== newPassword && (
                  <span className="text-[10px] text-red-500 flex items-center gap-1">
                    <AlertCircle className="size-3" /> Passwords do not match
                  </span>
                )}
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={isUpdatingPassword} className="bg-purple-600 hover:bg-purple-700 text-white text-xs">
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <KeyRound className="mr-1.5 size-3.5" />
                      Update Password
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

    </Tabs>
  );
}

