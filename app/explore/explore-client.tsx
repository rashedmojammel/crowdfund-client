"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button } from "@gravity-ui/uikit";
import { Magnifier } from "@gravity-ui/icons";
import { FadeIn } from "@/components/animations/FadeIn";
import {
  CampaignFilters,
  EMPTY_FILTERS,
  type ExploreFilters,
} from "@/components/campaigns/CampaignFilters";
import { CampaignGrid } from "@/components/campaigns/CampaignGrid";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useDebounce } from "@/hooks/useDebounce";
import { apiFetch } from "@/lib/api-client";
import type { Campaign } from "@/types";

/** Translate UI filter state into the API's query parameters. */
function toQueryString(filters: ExploreFilters, search: string): string {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (search) params.set("search", search);
  if (filters.deadline) params.set("deadlineWithinDays", filters.deadline);
  if (filters.goal === "under-50k") params.set("maxGoal", "50000");
  if (filters.goal === "50k-100k") {
    params.set("minGoal", "50000");
    params.set("maxGoal", "100000");
  }
  if (filters.goal === "over-100k") params.set("minGoal", "100000");
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function ExploreClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<ExploreFilters>({
    ...EMPTY_FILTERS,
    category: searchParams.get("category") ?? "",
  });
  const debouncedSearch = useDebounce(filters.search);

  const queryString = useMemo(
    () => toQueryString(filters, debouncedSearch),
    [filters, debouncedSearch]
  );

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["campaigns", "list", queryString],
    queryFn: () => apiFetch<Campaign[]>(`/campaigns${queryString}`),
  });

  const handleFiltersChange = (next: ExploreFilters) => {
    setFilters(next);
    // Keep the category shareable in the URL (homepage tiles link with it).
    router.replace(next.category ? `/explore?category=${next.category}` : "/explore", {
      scroll: false,
    });
  };

  return (
    <div className="container-page py-12">
      <FadeIn>
        <h1>Explore campaigns</h1>
        <p className="mt-2 max-w-xl text-sm opacity-70">
          Every campaign here has been reviewed and approved, and is still open for
          contributions.
        </p>
        <div className="mt-8">
          <CampaignFilters value={filters} onChange={handleFiltersChange} />
        </div>
      </FadeIn>

      <div className="mt-8">
        {isError ? (
          <Alert
            theme="danger"
            title="Couldn't load campaigns"
            message="Something went wrong while fetching campaigns."
            actions={<Alert.Action onClick={() => refetch()}>Try again</Alert.Action>}
          />
        ) : (
          <CampaignGrid
            campaigns={data}
            isLoading={isPending}
            emptyState={
              <EmptyState
                icon={Magnifier}
                title="No campaigns match"
                subtitle="Try a different category, a wider deadline window, or clear the filters to see everything that's live."
                action={
                  <Button size="l" view="outlined" onClick={() => handleFiltersChange(EMPTY_FILTERS)}>
                    Clear all filters
                  </Button>
                }
              />
            }
          />
        )}
      </div>
    </div>
  );
}
