import { LoginForm } from "@/components/login-form";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex h-[calc(100vh-7.5rem)] items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Welcome Back
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to sign in to your CityPulse account
          </p>
        </div>
        
        <Suspense fallback={<div className="flex justify-center p-4"><Loader2 className="animate-spin text-slate-400" /></div>}>
          <LoginForm />
        </Suspense>
        
        <div className="text-center text-xs text-muted-foreground">
          <p>Mock Accounts for Testing:</p>
          <div className="mt-2 space-y-1 font-mono">
            <p>john.public@example.com (CITIZEN)</p>
            <p>crew4@citypulse.gov (FIELD WORKER)</p>
            <p>sjenkins@citypulse.gov (MANAGER)</p>
            <p>admin@citypulse.gov</p>
          </div>
          <p className="mt-3 text-[10px] opacity-70">
            (Any password works for the prototype)
          </p>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
