"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";
import { FadeIn } from "@/components/animations/FadeIn";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <FadeIn className="flex min-h-[50vh] items-center justify-center">
      <ErrorState
        title="Something went wrong"
        message="This part of the dashboard hit a snag. The rest of the app is unaffected — try again."
        onRetry={() => reset()}
        className="max-w-md"
      />
    </FadeIn>
  );
}
