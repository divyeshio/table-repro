/**
 * HeaderComponents — mirrors apps/frontend/src/components/tables/header-components.tsx
 * from the table-v9 branch.
 *
 * These components are passed to createTableHook and become accessible as
 * header.SelectionHeader, header.DataTableColumnHeader inside column definitions.
 *
 * SelectionHeader uses table.Subscribe so it only re-renders when rowSelection changes.
 */
import { type RowData } from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon, EyeOffIcon, XIcon } from "lucide-react";
import { type HTMLAttributes, useRef, useState } from "react";

import { type AppColumn, useTableContext } from "../hooks/use-app-table";
import { cn } from "../lib/utils";

// ── DataTableColumnHeader ────────────────────────────────────────────────────

interface AppTableColumnHeaderProps<TData extends RowData, TValue>
  extends HTMLAttributes<HTMLDivElement> {
  column: AppColumn<TData, TValue>;
  title: string;
}

export function AppTableColumnHeader<TData extends RowData, TValue>({
  column,
  title,
  className,
}: AppTableColumnHeaderProps<TData, TValue>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative mx-2 flex items-center justify-center", className)}
    >
      <button
        className={cn(
          "-ml-3 flex h-8 items-center gap-1 rounded px-2 text-sm font-medium hover:bg-accent",
          open && "bg-accent",
        )}
        onClick={() => setOpen((v) => !v)}
        onBlur={(e) => {
          if (!containerRef.current?.contains(e.relatedTarget as Node)) {
            setOpen(false);
          }
        }}
      >
        <span>{title}</span>
        {column.getIsSorted() === "desc" ? (
          <ArrowDownIcon className="size-3" />
        ) : column.getIsSorted() === "asc" ? (
          <ArrowUpIcon className="size-3" />
        ) : null}
      </button>

      {open && (
        <div className="absolute left-0 top-9 z-50 min-w-[130px] rounded-md border border-border bg-card py-1 shadow-lg">
          <button
            className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent"
            onMouseDown={() => {
              column.toggleSorting(false);
              setOpen(false);
            }}
          >
            <ArrowUpIcon className="size-3" /> Asc
          </button>
          <button
            className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent"
            onMouseDown={() => {
              column.toggleSorting(true);
              setOpen(false);
            }}
          >
            <ArrowDownIcon className="size-3" /> Desc
          </button>
          <div className="my-1 h-px bg-border" />
          <button
            className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent"
            onMouseDown={() => {
              column.clearSorting();
              setOpen(false);
            }}
          >
            <XIcon className="size-3" /> Clear
          </button>
          <button
            className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent"
            onMouseDown={() => {
              column.toggleVisibility(false);
              setOpen(false);
            }}
          >
            <EyeOffIcon className="size-3" /> Hide
          </button>
        </div>
      )}
    </div>
  );
}

// ── SelectionHeader ──────────────────────────────────────────────────────────

/**
 * Select-all checkbox header.
 * Uses table.Subscribe to only re-render when rowSelection changes.
 */
export function SelectionHeader() {
  const table = useTableContext();
  return (
    <table.Subscribe selector={(state) => ({ rowSelection: state.rowSelection })}>
      {() => (
        <div className="flex h-full w-full items-center justify-center">
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            ref={(el) => {
              if (el) el.indeterminate = table.getIsSomeRowsSelected();
            }}
            onChange={table.getToggleAllRowsSelectedHandler()}
            aria-label="Select all"
            className="h-4 w-4 cursor-pointer"
          />
        </div>
      )}
    </table.Subscribe>
  );
}

export const HeaderComponents = {
  AppTableColumnHeader,
  SelectionHeader,
};
