import type { Metadata } from "next";
import Link from "next/link";
import { AuthSplitCard } from "@/components/auth/AuthSplitCard";
import { FadeIn } from "@/components/animations/FadeIn";
import { GoogleSignInButton } from "@/components/forms/GoogleSignInButton";
import { LoginForm } from "@/components/forms/LoginForm";
import { cn, FOCUS_RING } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Log in — FundSpark",
};

export default function LoginPage() {
  return (
    <main className="flex grow items-center justify-center px-5 py-12 sm:px-8">
      <FadeIn className="w-full max-w-5xl">
        <AuthSplitCard
          headline="Pick up where you left off."
          formTitle="Welcome back"
          formSubtitle="Log in to continue to your dashboard."
          footer={
            <p className="text-center text-sm text-muted-foreground">
              New to FundSpark?{" "}
              <Link
                href="/register"
                className={cn("font-medium underline underline-offset-4", FOCUS_RING)}
              >
                Create an account
              </Link>
            </p>
          }
        >
          <GoogleSignInButton />

          <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground/70">
            <span aria-hidden="true" className="h-px grow bg-border" />
            or
            <span aria-hidden="true" className="h-px grow bg-border" />
          </div>

          <LoginForm />
        </AuthSplitCard>
      </FadeIn>
    </main>
  );
}
