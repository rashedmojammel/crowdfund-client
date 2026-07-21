import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/animations/FadeIn";
import { RegisterForm } from "@/components/forms/RegisterForm";
import { cn, FOCUS_RING } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Create account — FundSpark",
};

export default function RegisterPage() {
  return (
    <main className="flex grow items-center justify-center px-5 py-12 sm:px-8">
      <FadeIn className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-balance">Create your FundSpark account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join as a supporter to back campaigns, or as a creator to launch your own.
          </p>
        </div>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className={cn("font-medium underline underline-offset-4", FOCUS_RING)}
          >
            Log in
          </Link>
        </p>
      </FadeIn>
    </main>
  );
}
