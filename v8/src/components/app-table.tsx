import { flexRender, type Row, type RowData, type Table } from "@tanstack/react-table";
import { Loader2Icon } from "lucide-react";
import { type ReactNode } from "react";

import { cn } from "../lib/utils";
import { useVirtualInfiniteScroll } from "./use-virtual-infinite-scroll";

declare module "@tanstack/table-core" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    updateData?: (rowIndex: number, columnId: string, value: unknown) => void;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    name?: string;
    isGrow?: boolean;
  }
}

export function AppTable<TData>({
  table,
  renderItem,
  overscan = 5,
  estimatedRowHeight = 48,
  maxBodyHeight = "90vh",
  hasNextPage = false,
  isFetchingNextPage = false,
  isLoading = false,
  fetchNextPage,
  totalCount,
  label,
  isStale = false,
}: {
  table: Table<TData>;
  renderItem: (row: Row<TData>) => ReactNode;
  overscan?: number;
  estimatedRowHeight?: number;
  maxBodyHeight?: string | number;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  isLoading?: boolean;
  fetchNextPage?: () => void;
  totalCount?: number;
  label?: string;
  isStale?: boolean;
}) {
  const rows = table.getRowModel().rows;

  const { parentRef, virtualItems, totalSize } = useVirtualInfiniteScroll({
    rowCount: rows.length,
    overscan,
    estimatedRowHeight,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  return (
    <div className="space-y-4">
      <div
        className="no-scrollbar relative rounded-md border border-border focus:outline-none"
        autoFocus
        ref={parentRef}
        style={{ maxHeight: maxBodyHeight, overflow: "auto" }}
        tabIndex={0}
      >
        <table style={{ tableLayout: rows.length > 0 ? "fixed" : "auto", width: "100%", borderCollapse: "collapse" }}>
          {/* Sticky header */}
          <thead className="sticky top-0 z-20 border-b border-border bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers
                  .filter((header) => header.column.getIsVisible())
                  .map((header) => (
                    <th
                      key={header.id}
                      className="sticky top-0 z-20 border-r border-border bg-background p-2 text-left text-sm font-bold"
                      style={{
                        width: header.column.columnDef.meta?.isGrow
                          ? "auto"
                          : `${header.getSize()}px`,
                        minWidth: header.column.columnDef.meta?.isGrow
                          ? `${header.column.columnDef.minSize ?? 0}px`
                          : undefined,
                      }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
              </tr>
            ))}
          </thead>

          {/* Virtual body */}
          <tbody className={cn("transition-opacity duration-200", isStale && "opacity-50")}>
            {isLoading && rows.length === 0 ? (
              <tr>
                <td
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                    <span>Loading {label || "items"}...</span>
                  </div>
                </td>
              </tr>
            ) : rows.length ? (
              <>
                {/* Top spacer */}
                <tr aria-hidden>
                  <td
                    colSpan={table.getVisibleLeafColumns().length || 1}
                    style={{ padding: 0, height: virtualItems[0]?.start ?? 0 }}
                  />
                </tr>

                {virtualItems.map((vi) => renderItem(rows[vi.index]!))}

                {/* Bottom spacer */}
                <tr aria-hidden>
                  <td
                    colSpan={table.getVisibleLeafColumns().length || 1}
                    style={{
                      padding: 0,
                      height:
                        (virtualItems.length
                          ? totalSize - (virtualItems[virtualItems.length - 1]?.end ?? 0)
                          : 0) || 0,
                    }}
                  />
                </tr>
              </>
            ) : (
              <tr>
                <td
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Infinite scroll loading indicator */}
        {isFetchingNextPage && (
          <div className="sticky bottom-0 z-10 border-t border-border bg-background/80 p-4 text-center backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2Icon className="h-4 w-4 animate-spin" />
              <span>Loading more {label || "items"}...</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer: row count */}
      <div className="flex items-center px-2">
        {totalCount !== undefined && (
          <div className="text-sm text-muted-foreground">
            Showing {rows.length} of {totalCount} {label || "items"}
          </div>
        )}
      </div>
    </div>
  );
}
