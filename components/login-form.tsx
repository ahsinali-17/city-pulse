"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (res?.error) {
        setError("Invalid credentials. Please check the mock emails.");
      } else if (res?.url) {
        window.location.href = res.url;
      }
    } catch (err) {
      setError("An unexpected error occurred.");
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

      {error && (
        <div className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-950/50 p-2 rounded border border-red-200 dark:border-red-900">
          {error}
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
