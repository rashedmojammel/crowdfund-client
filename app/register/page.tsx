import type { Metadata } from "next";
import Link from "next/link";
import { AuthSplitCard } from "@/components/auth/AuthSplitCard";
import { FadeIn } from "@/components/animations/FadeIn";
import { GoogleSignInButton } from "@/components/forms/GoogleSignInButton";
import { RegisterForm } from "@/components/forms/RegisterForm";
import { cn, FOCUS_RING } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Create account — FundSpark",
};

export default function RegisterPage() {
  return (
    <main className="flex grow items-center justify-center px-5 py-12 sm:px-8">
      <FadeIn className="w-full max-w-5xl">
        <AuthSplitCard
          headline="Where support meets action."
          formTitle="Create your account"
          formSubtitle="Join as a supporter to back campaigns, or as a creator to launch your own."
          footer={
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className={cn("font-medium underline underline-offset-4", FOCUS_RING)}
              >
                Log in
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

          <RegisterForm />
        </AuthSplitCard>
      </FadeIn>
    </main>
  );
}
