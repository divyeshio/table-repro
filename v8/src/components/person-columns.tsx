import { createColumnHelper } from "@tanstack/react-table";
import type { Table } from "@tanstack/react-table";
import { HeartIcon, MoreHorizontalIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Person } from "@/types/person";
import { AppTableColumnHeader } from "./app-table-column-header";

const columnHelper = createColumnHelper<Person>();

function computeIsNew(lastAccessedOn: string, updatedOn: string): boolean {
  const updated = new Date(updatedOn).getTime();
  const lastAccessed = new Date(lastAccessedOn).getTime();
  return updated > lastAccessed;
}

export const personTableColumns = [
  columnHelper.accessor((row) => computeIsNew(row.lastAccessedOn, row.updatedOn), {
    id: "isNew",
    meta: { name: "New" },
    size: 30,
    maxSize: 30,
    enableResizing: false,
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
    enableResizing: false,
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => (
      <div className="flex h-full w-full items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          ref={(el) => {
            if (el) {
              const input = el as unknown as HTMLInputElement;
              input.indeterminate = table.getIsSomePageRowsSelected();
            }
          }}
          onCheckedChange={(checked) =>
            table.toggleAllPageRowsSelected(checked === true)
          }
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex w-full items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onClick={(e) => e.stopPropagation()}
          onCheckedChange={(checked) => row.toggleSelected(checked === true)}
          aria-label="Select row"
        />
      </div>
    ),
  }),

  columnHelper.accessor("name", {
    minSize: 250,
    size: 400,
    enableHiding: false,
    meta: { name: "Name" },
    enableColumnFilter: true,
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
        <Badge variant={info.getValue() === "Active" ? "success" : "secondary"}>
          {info.getValue()}
        </Badge>
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
        <Badge variant="secondary">{info.getValue()}</Badge>
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
    sortingFn: (rowA, rowB) => rowA.original.salary - rowB.original.salary,
    cell: (info) => (
      <div className="text-center text-sm">${info.getValue().toLocaleString()}</div>
    ),
  }),

  columnHelper.accessor("isLiked", {
    size: 30,
    maxSize: 30,
    enableResizing: false,
    meta: { name: "❤" },
    header: ({ column }) => (
      <AppTableColumnHeader
        column={column}
        title={column.columnDef.meta?.name ?? ""}
        className="text-center"
      />
    ),
    cell: (info) => <LikeCell initialLiked={info.getValue()} />,
  }),

  // Hidden by default (mirrors id, tags, screenshotUrl, title, port in domains)
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
          <Badge key={tag} variant="outline">{tag}</Badge>
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
    enableSorting: false,
    enableMultiSort: false,
    enableHiding: false,
    enableResizing: false,
    cell: (info) => (
      <RowActionsCell
        id={info.row.getValue<string>("id")}
        table={info.table as Table<Person>}
      />
    ),
  }),
];

function LikeCell({ initialLiked }: { initialLiked: boolean }) {
  const [liked, setLiked] = useState(initialLiked);
  return (
    <div className="flex w-full items-center justify-center">
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={(e) => {
          e.stopPropagation();
          setLiked((v) => !v);
        }}
        aria-label="Toggle like"
      >
        <HeartIcon
          className={cn(
            "size-4",
            liked ? "fill-red-500 text-red-500" : "text-muted-foreground",
          )}
        />
      </Button>
    </div>
  );
}

function RowActionsCell({ id, table }: { id: string; table: Table<Person> }) {
  const _assets = useMemo(() => [id], [id]);
  void table;

  return (
    <div className="flex items-center justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={(e) => e.stopPropagation()}
            aria-label="Row actions"
          >
            <MoreHorizontalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>View Profile</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Deactivate</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
