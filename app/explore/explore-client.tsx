"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/FadeIn";
import {
  CampaignFilters,
  EMPTY_FILTERS,
  type ExploreFilters,
} from "@/components/campaigns/CampaignFilters";
import { CampaignGrid } from "@/components/campaigns/CampaignGrid";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useDebounce } from "@/hooks/useDebounce";
import { apiFetch } from "@/lib/api-client";
import type { Campaign } from "@/types";

interface CampaignsListResponse {
  campaigns: Campaign[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Translate UI filter state into the API's query parameters. The real server
 * only supports ?category, ?page, and ?limit (max 50) — search/deadline/goal
 * have no server-side equivalent (see the migration notes), so those filters
 * currently don't narrow results; they're still sent (harmlessly ignored)
 * pending a server change. limit=50 approximates "show everything" since
 * there's no pagination control wired into this view yet.
 */
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
  params.set("limit", "50");
  return `?${params.toString()}`;
}

interface ExploreClientProps {
  /** Dashboard variant: no page container/padding, smaller heading. */
  embedded?: boolean;
}

export function ExploreClient({ embedded = false }: ExploreClientProps) {
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
    queryFn: () => apiFetch<CampaignsListResponse>(`/campaigns${queryString}`, { public: true }),
  });

  const basePath = embedded ? "/dashboard/explore-campaigns" : "/explore";
  const handleFiltersChange = (next: ExploreFilters) => {
    setFilters(next);
    // Keep the category shareable in the URL (homepage tiles link with it).
    router.replace(next.category ? `${basePath}?category=${next.category}` : basePath, {
      scroll: false,
    });
  };

  const Heading = embedded ? "h2" : "h1";

  return (
    <div className={embedded ? undefined : "container-fs py-12"}>
      <FadeIn>
        <Heading>Explore campaigns</Heading>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Every campaign here has been reviewed and approved, and is still open for
          contributions.
        </p>
        <div className="mt-8">
          <CampaignFilters value={filters} onChange={handleFiltersChange} />
        </div>
      </FadeIn>

      <div className="mt-8">
        {isError ? (
          <ErrorState
            title="Couldn't load campaigns"
            message="Something went wrong while fetching campaigns."
            onRetry={() => refetch()}
          />
        ) : (
          <CampaignGrid
            campaigns={data?.campaigns}
            isLoading={isPending}
            emptyState={
              <EmptyState
                icon={Search}
                title="No campaigns match"
                subtitle="Try a different category, a wider deadline window, or clear the filters to see everything that's live."
                action={
                  <Button variant="outline" onClick={() => handleFiltersChange(EMPTY_FILTERS)}>
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
