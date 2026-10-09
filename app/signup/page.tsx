import { SignupForm } from "@/components/signup-form";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="flex h-[calc(100vh-7.5rem)] items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Create Account
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign up as a citizen to report civic hazards in your area
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center p-4">
              <Loader2 className="animate-spin text-slate-400" />
            </div>
          }
        >
          <SignupForm />
        </Suspense>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
