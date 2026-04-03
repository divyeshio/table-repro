import { type Column } from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon, EyeOffIcon, XIcon } from "lucide-react";
import { type HTMLAttributes, useRef, useState } from "react";

import { cn } from "../lib/utils";

interface AppTableColumnHeaderProps<TData, TValue> extends HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function AppTableColumnHeader<TData, TValue>({
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
