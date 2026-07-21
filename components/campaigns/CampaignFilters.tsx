"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/constants";

export interface ExploreFilters {
  category: string;
  /** Days until deadline: "" (any), "30", or "90". */
  deadline: "" | "30" | "90";
  /** Funding-goal bucket in credits. */
  goal: "" | "under-50k" | "50k-100k" | "over-100k";
  search: string;
}

export const EMPTY_FILTERS: ExploreFilters = {
  category: "",
  deadline: "",
  goal: "",
  search: "",
};

interface CampaignFiltersProps {
  value: ExploreFilters;
  onChange: (next: ExploreFilters) => void;
}

// Radix Select doesn't allow an empty-string item value, so "any/all" options
// use this sentinel and get mapped back to "" at the boundary.
const ANY = "__any__";

/** Category / deadline / goal filters + search. No animation — filters are instant. */
export function CampaignFilters({ value, onChange }: CampaignFiltersProps) {
  const set = <K extends keyof ExploreFilters>(key: K, v: ExploreFilters[K]) =>
    onChange({ ...value, [key]: v });

  const hasActiveFilters =
    value.category !== "" || value.deadline !== "" || value.goal !== "" || value.search !== "";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-full sm:w-64">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Search campaigns"
          value={value.search}
          onChange={(e) => set("search", e.target.value)}
          className="pl-9"
        />
      </div>

      <Select
        value={value.category || ANY}
        onValueChange={(v) => set("category", v === ANY ? "" : v)}
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>All categories</SelectItem>
          {CATEGORIES.map((c) => (
            <SelectItem key={c.value} value={c.value}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.deadline || ANY}
        onValueChange={(v) =>
          set("deadline", v === ANY ? "" : (v as ExploreFilters["deadline"]))
        }
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Any deadline" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>Any deadline</SelectItem>
          <SelectItem value="30">Ending within 30 days</SelectItem>
          <SelectItem value="90">Ending within 90 days</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={value.goal || ANY}
        onValueChange={(v) => set("goal", v === ANY ? "" : (v as ExploreFilters["goal"]))}
      >
        <SelectTrigger className="w-full sm:w-52">
          <SelectValue placeholder="Any goal size" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>Any goal size</SelectItem>
          <SelectItem value="under-50k">Under 50,000 credits</SelectItem>
          <SelectItem value="50k-100k">50,000 – 100,000 credits</SelectItem>
          <SelectItem value="over-100k">Over 100,000 credits</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters ? (
        <Button variant="ghost" onClick={() => onChange(EMPTY_FILTERS)}>
          <X aria-hidden="true" />
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
