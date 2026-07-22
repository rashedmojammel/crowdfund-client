import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/FadeIn";
import { Pressable } from "@/components/animations/Pressable";

export default function NotFound() {
  return (
    <div className="container-fs flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <FadeIn className="flex flex-col items-center">
        <p className="display text-[96px] font-bold leading-none text-primary sm:text-[120px]">
          404
        </p>
        <h1 className="mt-4 text-2xl sm:text-3xl">This page wandered off</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          We couldn&rsquo;t find what you were looking for. It may have been moved, renamed,
          or never existed in the first place.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Pressable>
            <Button asChild size="lg">
              <Link href="/">
                <Home aria-hidden="true" />
                Back to home
              </Link>
            </Button>
          </Pressable>
          <Button asChild variant="outline" size="lg">
            <Link href="/explore">
              <Compass aria-hidden="true" />
              Explore campaigns
            </Link>
          </Button>
        </div>
      </FadeIn>
    </div>
  );
}
