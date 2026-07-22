"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/FadeIn";
import { Pressable } from "@/components/animations/Pressable";

export default function GlobalError({
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
    <div className="container-fs flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <FadeIn className="flex flex-col items-center">
        <p className="display text-[64px] font-bold leading-none text-primary sm:text-[80px]">
          Oops
        </p>
        <h1 className="mt-4 text-2xl sm:text-3xl">Something went wrong</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          We hit a snag loading this page. It&rsquo;s been logged — try again, or head back
          to home.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Pressable>
            <Button size="lg" onClick={() => reset()}>
              <RotateCw aria-hidden="true" />
              Try again
            </Button>
          </Pressable>
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <Home aria-hidden="true" />
              Back to home
            </Link>
          </Button>
        </div>
      </FadeIn>
    </div>
  );
}
