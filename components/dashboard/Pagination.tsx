"use client";

import { Pagination as GravityPagination } from "@gravity-ui/uikit";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

/** Thin wrapper over Gravity's Pagination working in whole pages. */
export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <GravityPagination
      page={page}
      pageSize={1}
      total={totalPages}
      onUpdate={(nextPage) => onChange(nextPage)}
      compact
    />
  );
}
