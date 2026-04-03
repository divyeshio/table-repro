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
import { type HTMLAttributes } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type AppColumn, useTableContext } from "@/hooks/use-app-table";
import { cn } from "@/lib/utils";

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
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("mx-2 flex items-center justify-center", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "-ml-3 flex h-8 items-center gap-1 rounded px-2 text-sm font-medium hover:bg-accent focus-visible:outline-none",
              column.getIsSorted() && "bg-accent",
            )}
          >
            <span>{title}</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDownIcon className="size-3" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUpIcon className="size-3" />
            ) : null}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUpIcon className="size-3" /> Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDownIcon className="size-3" /> Desc
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.clearSorting()}>
            <XIcon className="size-3" /> Clear
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeOffIcon className="size-3" /> Hide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            ref={(el) => {
              if (el) {
                const input = el as unknown as HTMLInputElement;
                input.indeterminate = table.getIsSomeRowsSelected();
              }
            }}
            onCheckedChange={(checked) => table.toggleAllRowsSelected(checked === true)}
            aria-label="Select all"
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
