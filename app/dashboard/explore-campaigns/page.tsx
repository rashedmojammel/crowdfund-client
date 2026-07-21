import { Suspense } from "react";
import { ExploreClient } from "@/app/explore/explore-client";

/** Same campaign grid as /explore, inside the dashboard shell. */
export default function DashboardExploreCampaignsPage() {
  return (
    // Suspense boundary required by useSearchParams during prerender.
    <Suspense>
      <ExploreClient embedded />
    </Suspense>
  );
}
