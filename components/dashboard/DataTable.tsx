"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Icon } from "@gravity-ui/uikit";
import { ChevronDown, ChevronUp } from "@gravity-ui/icons";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  title: string;
  render: (row: T) => ReactNode;
  /** Enables client-side sorting; provide sortValue for non-trivial cells. */
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  /** Use "right" for numbers and for the trailing actions column. */
  align?: "left" | "right";
}

interface DataTableProps<T> {
  columns: Array<DataTableColumn<T>>;
  rows: T[];
  rowKey: (row: T) => string;
  /** Rendered instead of the table when rows is empty. */
  emptyState?: ReactNode;
}

type SortState = { key: string; dir: "asc" | "desc" } | null;

/**
 * Reusable dashboard table: sortable headers (arrow indicator, no animation),
 * subtle row hover, horizontal scroll on narrow screens. Rows are shown
 * as-is — short tables are never padded with empty rows.
 */
export function DataTable<T>({ columns, rows, rowKey, emptyState = null }: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState>(null);

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((c) => c.key === sort.key);
    if (!column) return rows;
    const valueOf = column.sortValue ?? ((row: T) => String(column.render(row) ?? ""));
    return [...rows].sort((a, b) => {
      const av = valueOf(a);
      const bv = valueOf(b);
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, columns, sort]);

  if (rows.length === 0) return <>{emptyState}</>;

  const toggleSort = (key: string) =>
    setSort((prev) =>
      prev?.key === key
        ? prev.dir === "asc"
          ? { key, dir: "desc" }
          : null
        : { key, dir: "asc" }
    );

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--g-color-line-generic)]">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-[var(--g-color-line-generic)]">
            {columns.map((column) => {
              const isSorted = sort?.key === column.key;
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={
                    isSorted ? (sort.dir === "asc" ? "ascending" : "descending") : undefined
                  }
                  className={cn(
                    "px-4 py-3 font-medium opacity-70",
                    column.align === "right" ? "text-right" : "text-left"
                  )}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className={cn(
                        "inline-flex cursor-pointer items-center gap-1",
                        column.align === "right" && "flex-row-reverse"
                      )}
                    >
                      {column.title}
                      {isSorted ? (
                        <Icon data={sort.dir === "asc" ? ChevronUp : ChevronDown} size={14} />
                      ) : null}
                    </button>
                  ) : (
                    column.title
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <tr
              key={rowKey(row)}
              className="border-b border-[var(--g-color-line-generic)] transition-colors last:border-b-0 hover:bg-[var(--g-color-base-simple-hover)]"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn("px-4 py-3", column.align === "right" && "text-right")}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
