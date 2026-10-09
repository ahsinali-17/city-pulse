"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Loader2, Eye, EyeOff, Check } from "lucide-react";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const passwordLongEnough = password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!passwordLongEnough) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      // Redirect to login with success message
      router.push("/login?registered=true");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
    >
      {/* Full Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Full Name
        </label>
        <Input
          id="signup-name"
          type="text"
          placeholder="Jane Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          className="bg-slate-50 dark:bg-slate-950"
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Email Address
        </label>
        <Input
          id="signup-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="bg-slate-50 dark:bg-slate-950"
        />
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Password
        </label>
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="bg-slate-50 dark:bg-slate-950 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        {/* Password strength hints */}
        {password.length > 0 && (
          <div className="flex items-center gap-2 mt-1">
            <div
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                password.length >= 6
                  ? password.length >= 10
                    ? "bg-emerald-500"
                    : "bg-amber-400"
                  : "bg-red-400"
              }`}
            />
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {password.length < 6
                ? `${6 - password.length} more chars needed`
                : password.length >= 10
                  ? "Strong"
                  : "Good"}
            </span>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Confirm Password
        </label>
        <div className="relative">
          <Input
            id="signup-confirm-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            className={`bg-slate-50 dark:bg-slate-950 pr-10 ${
              confirmPassword.length > 0 && !passwordsMatch
                ? "border-red-400 focus-visible:ring-red-300/50"
                : ""
            }`}
          />
          {passwordsMatch && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <Check className="size-4 text-emerald-500" />
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-950/50 p-2.5 rounded border border-red-200 dark:border-red-900">
          {error}
        </div>
      )}

      {/* Submit */}
      <Button
        id="signup-submit"
        type="submit"
        className="w-full font-semibold"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Creating account...
          </>
        ) : (
          <>
            <UserPlus className="mr-2 size-4" />
            Create Citizen Account
          </>
        )}
      </Button>

      {/* Terms hint */}
      <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
        By signing up, you agree to report civic hazards honestly and accurately.
      </p>
    </form>
  );
}
