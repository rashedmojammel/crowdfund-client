"use client";

import { FadeIn } from "@/components/animations/FadeIn";
import { MyContributionsTable } from "@/components/dashboard/supporter/MyContributionsTable";

export default function MyContributionsPage() {
  return (
    <FadeIn className="flex flex-col gap-6">
      <div>
        <h2>My Contributions</h2>
        <p className="mt-2 text-sm opacity-70">
          Everything you&rsquo;ve backed — pending contributions are waiting on the creator,
          rejected ones were refunded to your wallet.
        </p>
      </div>
      <MyContributionsTable />
    </FadeIn>
  );
}
