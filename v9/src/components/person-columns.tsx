/**
 * PersonColumns.tsx — v9
 *
 * Mirrors domain-table-columns.tsx from the table-v9 branch.
 * Key v9 differences from v8:
 *  - createAppColumnHelper<T>() instead of createColumnHelper<T>()
 *  - columnHelper.columns([...]) wrapper instead of plain array
 *  - selectAction column uses cell.SelectionCell / header.SelectionHeader
 *    (built into createTableHook — no manual Checkbox JSX)
 *  - enableResizing removed (v9 cleanup)
 *  - sortingFn removed from statusCodeChain equivalent
 *  - Table type cast uses AppTable<T> instead of Table<T>
 */
import { HeartIcon, MoreHorizontalIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "../lib/utils";
import type { Person } from "../types/person";
import { AppColumn, AppTable, createAppColumnHelper } from "../hooks/use-app-table";
import { AppTableColumnHeader } from "./header-components";

const columnHelper = createAppColumnHelper<Person>();

function computeIsNew(lastAccessedOn: string, updatedOn: string): boolean {
  const updated = new Date(updatedOn).getTime();
  const lastAccessed = new Date(lastAccessedOn).getTime();
  return updated > lastAccessed;
}

export const personTableColumns = columnHelper.columns([
  columnHelper.accessor((row) => computeIsNew(row.lastAccessedOn, row.updatedOn), {
    id: "isNew",
    meta: { name: "New" },
    size: 30,
    maxSize: 30,
    // enableResizing removed in v9
    header: () => (
      <div className="flex w-full items-center justify-center">
        <div className="h-2 w-2 rounded-full bg-primary" />
      </div>
    ),
    cell: (info) => (
      <div className="flex items-center justify-center">
        {info.getValue() && <div className="h-2 w-2 rounded-full bg-primary" />}
      </div>
    ),
  }),

  columnHelper.display({
    id: "selectAction",
    size: 30,
    maxSize: 30,
    // enableResizing removed in v9
    enableSorting: false,
    enableHiding: false,
    // v9: uses built-in header/cell components from createTableHook
    header: ({ header }) => <header.SelectionHeader />,
    cell: ({ cell }) => <cell.SelectionCell />,
  }),

  columnHelper.accessor("name", {
    minSize: 250,
    size: 400,
    enableHiding: false,
    meta: { name: "Name" },
    // enableColumnFilter removed in v9
    header: ({ column }) => (
      <AppTableColumnHeader column={column} title={column.columnDef.meta?.name ?? ""} />
    ),
    cell: (info) => (
      <div className="truncate font-medium text-blue-600 dark:text-blue-400">
        {info.getValue()}
      </div>
    ),
  }),

  columnHelper.accessor("email", {
    size: 200,
    meta: { name: "Email" },
    header: ({ column }) => (
      <AppTableColumnHeader column={column} title={column.columnDef.meta?.name ?? ""} />
    ),
    cell: (info) => (
      <div className="truncate text-sm text-muted-foreground">{info.getValue()}</div>
    ),
  }),

  columnHelper.accessor("department", {
    size: 140,
    meta: { name: "Department" },
    header: ({ column }) => (
      <AppTableColumnHeader column={column} title={column.columnDef.meta?.name ?? ""} />
    ),
    cell: (info) => <span className="text-sm">{info.getValue()}</span>,
  }),

  columnHelper.accessor("status", {
    size: 80,
    maxSize: 80,
    meta: { name: "Status" },
    header: ({ column }) => (
      <AppTableColumnHeader column={column} title={column.columnDef.meta?.name ?? ""} />
    ),
    cell: (info) => (
      <div className="flex items-center justify-center">
        <span
          className={cn(
            "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
            info.getValue() === "Active"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
          )}
        >
          {info.getValue()}
        </span>
      </div>
    ),
  }),

  columnHelper.accessor("role", {
    size: 100,
    meta: { name: "Role" },
    header: ({ column }) => (
      <AppTableColumnHeader column={column} title={column.columnDef.meta?.name ?? ""} />
    ),
    cell: (info) => (
      <div className="flex items-center justify-center">
        <span className="inline-flex rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
          {info.getValue()}
        </span>
      </div>
    ),
  }),

  columnHelper.accessor("age", {
    size: 70,
    maxSize: 70,
    meta: { name: "Age" },
    header: ({ column }) => (
      <AppTableColumnHeader
        column={column}
        title={column.columnDef.meta?.name ?? ""}
        className="text-center"
      />
    ),
    cell: (info) => <div className="text-center text-sm">{info.getValue()}</div>,
  }),

  columnHelper.accessor("salary", {
    size: 120,
    meta: { name: "Salary" },
    header: ({ column }) => (
      <AppTableColumnHeader
        column={column}
        title={column.columnDef.meta?.name ?? ""}
        className="text-center"
      />
    ),
    // sortingFn removed in v9
    cell: (info) => (
      <div className="text-center text-sm">${info.getValue().toLocaleString()}</div>
    ),
  }),

  columnHelper.accessor("isLiked", {
    size: 30,
    maxSize: 30,
    // enableResizing removed in v9
    meta: { name: "❤" },
    header: ({ column }) => (
      <AppTableColumnHeader
        column={column}
        title={column.columnDef.meta?.name ?? ""}
        className="text-center"
      />
    ),
    cell: (info) => (
      <LikeCell
        initialLiked={info.getValue()}
        column={info.column as AppColumn<Person, unknown>}
        table={info.table}
      />
    ),
  }),

  // Hidden by default
  columnHelper.accessor("id", {
    enableSorting: false,
    enableHiding: false,
  }),

  columnHelper.accessor("tags", {
    meta: { name: "Tags" },
    enableSorting: false,
    header: ({ column }) => (
      <AppTableColumnHeader column={column} title={column.columnDef.meta?.name ?? ""} />
    ),
    cell: (info) => (
      <div className="flex flex-wrap gap-1">
        {info.getValue().map((tag) => (
          <span
            key={tag}
            className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800"
          >
            {tag}
          </span>
        ))}
      </div>
    ),
  }),

  columnHelper.accessor("notes", {
    meta: { name: "Notes" },
    enableSorting: false,
    enableHiding: false,
    cell: (info) => (
      <span className="text-sm text-muted-foreground">{info.getValue()}</span>
    ),
  }),

  columnHelper.display({
    id: "actions",
    size: 40,
    enableMultiSort: false,
    enableSorting: false,
    enableHiding: false,
    // enableResizing, enableColumnFilter, enableGlobalFilter, enableGrouping removed in v9
    cell: (info) => (
      <RowActionsCell
        id={info.row.getValue<string>("id")}
        table={info.table as AppTable<Person>}
      />
    ),
  }),
]);

function LikeCell({
  initialLiked,
  column: _column,
  table: _table,
}: {
  initialLiked: boolean;
  column: AppColumn<Person, unknown>;
  table: AppTable<Person>;
}) {
  // In repro: local state (no API)
  const [liked, setLiked] = useState(initialLiked);
  return (
    <div className="flex w-full items-center justify-center">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setLiked((v) => !v);
        }}
        className="rounded p-1 hover:bg-accent"
        aria-label="Toggle like"
      >
        <HeartIcon
          className={cn(
            "size-4",
            liked ? "fill-red-500 text-red-500" : "text-muted-foreground",
          )}
        />
      </button>
    </div>
  );
}

function RowActionsCell({ id, table: _table }: { id: string; table: AppTable<Person> }) {
  const [open, setOpen] = useState(false);
  const _assets = useMemo(() => [id], [id]);

  return (
    <div className="relative flex items-center justify-center">
      <button
        className="rounded p-1 hover:bg-accent"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        aria-label="Row actions"
      >
        <MoreHorizontalIcon className="size-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-7 z-50 min-w-[140px] rounded-md border border-border bg-card py-1 shadow-lg">
          <button
            className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent"
            onMouseDown={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
          >
            View Profile
          </button>
          <button
            className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            onMouseDown={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
          >
            Deactivate
          </button>
        </div>
      )}
    </div>
  );
}
