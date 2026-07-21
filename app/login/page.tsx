import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/animations/FadeIn";
import { DemoAccountsCallout } from "@/components/forms/DemoAccountsCallout";
import { LoginForm } from "@/components/forms/LoginForm";
import { GoogleSignInButton } from "@/components/forms/GoogleSignInButton";

export const metadata: Metadata = {
  title: "Log in — FundSpark",
};

export default function LoginPage() {
  return (
    <main className="flex grow items-center justify-center px-5 py-12 sm:px-8">
      <FadeIn className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1>Welcome back</h1>
          <p className="mt-2 text-sm opacity-70">Log in to continue to your dashboard.</p>
        </div>

        <LoginForm />

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide opacity-50">
          <span className="h-px grow bg-current" aria-hidden="true" />
          or
          <span className="h-px grow bg-current" aria-hidden="true" />
        </div>

        <GoogleSignInButton />

        <div className="mt-6">
          <DemoAccountsCallout />
        </div>

        <p className="mt-6 text-center text-sm opacity-80">
          New to FundSpark?{" "}
          <Link href="/register" className="font-medium underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </FadeIn>
    </main>
  );
}
