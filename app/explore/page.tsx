import { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ExploreClient } from "./explore-client";

export const metadata: Metadata = {
  title: "Explore campaigns — FundSpark",
  description:
    "Browse approved, live crowdfunding campaigns across technology, education, health, environment, community, and creative projects.",
};

export default function ExplorePage() {
  return (
    <>
      <Navbar />
      {/* Suspense boundary required by useSearchParams during prerender. */}
      <main className="grow">
        <Suspense>
          <ExploreClient />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
