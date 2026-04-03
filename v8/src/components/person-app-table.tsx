/**
 * PersonTableRow — mirrors domain-table-view.tsx from the main project.
 *
 * Key v8 perf feature: rows are wrapped in React.memo with a custom comparator
 * that only re-renders when selection state, column count, or row data changes.
 */
import { flexRender, type Row, type Table } from "@tanstack/react-table";
import { memo } from "react";

import { cn } from "../lib/utils";
import type { Person } from "../types/person";
import { AppTable } from "./app-table";

// ── Inner row component ──────────────────────────────────────────────────────

const PersonTableRow = ({
  row,
  onSelect,
}: {
  row: Row<Person>;
  isSelected: boolean; // passed as prop so memo comparator can watch it
  onSelect: (id: string) => void;
  visibleColumns: number; // passed so memo re-renders on column visibility change
}) => (
  <tr
    className={cn(
      "cursor-pointer hover:bg-accent/50 border-b border-border",
      row.getIsSelected() && "bg-accent/30",
    )}
    onClick={() => onSelect(row.getValue("id"))}
  >
    {row.getVisibleCells().map((cell) => (
      <td key={cell.id} className="p-2 text-sm">
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </td>
    ))}
  </tr>
);

// ── Memoized row — only re-renders when selection, column count, or data changes ──

const MemoizedPersonTableRow = memo(PersonTableRow, (prev, next) => {
  return (
    prev.visibleColumns === next.visibleColumns &&
    prev.isSelected === next.isSelected &&
    prev.row.original === next.row.original
  );
});

// ── Public wrapper used by App.tsx ───────────────────────────────────────────

export const PersonAppTable = ({
  table,
  onSelect,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  fetchNextPage,
  totalCount,
  label,
  isStale,
}: {
  table: Table<Person>;
  onSelect: (id: string) => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  isLoading?: boolean;
  fetchNextPage?: () => void;
  totalCount?: number;
  label?: string;
  isStale?: boolean;
}) => {
  return (
    <AppTable
      table={table}
      renderItem={(row) => (
        <MemoizedPersonTableRow
          key={row.id}
          row={row}
          onSelect={onSelect}
          isSelected={row.getIsSelected()}
          visibleColumns={table.getVisibleFlatColumns().length}
        />
      )}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isLoading={isLoading}
      fetchNextPage={fetchNextPage}
      totalCount={totalCount}
      label={label}
      isStale={isStale}
      maxBodyHeight="87vh"
    />
  );
};
