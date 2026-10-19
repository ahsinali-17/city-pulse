"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, Loader2, AlertCircle } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const searchParams = useSearchParams();
  const requestedPath = searchParams.get("callbackUrl") || "/";
  const callbackUrl = requestedPath.startsWith("/") && !requestedPath.startsWith("//") ? requestedPath : "/";
  const callbackError = searchParams.get("error");

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          setError("Invalid email or password. Please check your credentials and try again.");
        } else {
          setError(result.error);
        }
      } else if (result?.url) {
        window.location.href = result.url;
      } else {
        window.location.href = callbackUrl;
      }
    } catch {
      setError("An unexpected network or server error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Email Address
        </label>
        <Input
          type="email"
          placeholder="citizen@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-slate-50 dark:bg-slate-950"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Password
        </label>
        <Input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-slate-50 dark:bg-slate-950"
        />
      </div>
      {(error || callbackError) && (
        <div className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-950/50 p-2 rounded border border-red-200 dark:border-red-900">
          <span>{error || callbackError}</span>
        </div>
      )}

      <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <LogIn className="mr-2 size-4" />
            Sign In
          </>
        )}
      </Button>
    </form>
  );
}
