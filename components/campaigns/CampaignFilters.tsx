"use client";

import { Button, Select, TextInput } from "@gravity-ui/uikit";
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

/** Category / deadline / goal filters + search. No animation — filters are instant. */
export function CampaignFilters({ value, onChange }: CampaignFiltersProps) {
  const set = <K extends keyof ExploreFilters>(key: K, v: ExploreFilters[K]) =>
    onChange({ ...value, [key]: v });

  const hasActiveFilters =
    value.category !== "" || value.deadline !== "" || value.goal !== "" || value.search !== "";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-full sm:w-64">
        <TextInput
          size="l"
          type="search"
          placeholder="Search campaigns"
          value={value.search}
          onUpdate={(v) => set("search", v)}
          hasClear
        />
      </div>

      <Select
        size="l"
        placeholder="All categories"
        value={value.category ? [value.category] : []}
        onUpdate={(v) => set("category", v[0] ?? "")}
        options={[
          { value: "", content: "All categories" },
          ...CATEGORIES.map((c) => ({ value: c.value, content: c.label })),
        ]}
      />

      <Select
        size="l"
        placeholder="Any deadline"
        value={value.deadline ? [value.deadline] : []}
        onUpdate={(v) => set("deadline", (v[0] ?? "") as ExploreFilters["deadline"])}
        options={[
          { value: "", content: "Any deadline" },
          { value: "30", content: "Ending within 30 days" },
          { value: "90", content: "Ending within 90 days" },
        ]}
      />

      <Select
        size="l"
        placeholder="Any goal size"
        value={value.goal ? [value.goal] : []}
        onUpdate={(v) => set("goal", (v[0] ?? "") as ExploreFilters["goal"])}
        options={[
          { value: "", content: "Any goal size" },
          { value: "under-50k", content: "Under 50,000 credits" },
          { value: "50k-100k", content: "50,000 – 100,000 credits" },
          { value: "over-100k", content: "Over 100,000 credits" },
        ]}
      />

      {hasActiveFilters ? (
        <Button size="l" view="flat" onClick={() => onChange(EMPTY_FILTERS)}>
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
