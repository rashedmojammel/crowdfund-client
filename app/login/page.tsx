import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/animations/FadeIn";
import { LoginForm } from "@/components/forms/LoginForm";
import { GoogleSignInButton } from "@/components/forms/GoogleSignInButton";
import { cn, FOCUS_RING } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Log in — FundSpark",
};

export default function LoginPage() {
  return (
    <main className="flex grow items-center justify-center px-5 py-12 sm:px-8">
      <FadeIn className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1>Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Log in to continue to your dashboard.
          </p>
        </div>

        <LoginForm />

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground/70">
          <span className="h-px grow bg-border" aria-hidden="true" />
          or
          <span className="h-px grow bg-border" aria-hidden="true" />
        </div>

        <GoogleSignInButton />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to FundSpark?{" "}
          <Link
            href="/register"
            className={cn("font-medium underline underline-offset-4", FOCUS_RING)}
          >
            Create an account
          </Link>
        </p>
      </FadeIn>
    </main>
  );
}
