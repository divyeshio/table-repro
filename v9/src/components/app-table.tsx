/**
 * app-table.tsx — v9
 *
 * Key v9 differences from v8:
 *  - No renderItem prop — rows rendered inside AppTable render prop
 *  - table.AppTable / table.AppHeader / table.AppCell with selectors for targeted re-renders
 *  - header.FlexRender / cell.FlexRender replaces flexRender()
 *  - Standard spacer-rows virtualization — avoids measureElement feedback loops
 */
import { type RowData, type TableFeatures } from "@tanstack/react-table";
import { Loader2Icon } from "lucide-react";

import { cn } from "../lib/utils";
import { useAppTable } from "../hooks/use-app-table";
import { useVirtualInfiniteScroll } from "./use-virtual-infinite-scroll";

declare module "@tanstack/table-core" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TFeatures extends TableFeatures, TData extends RowData> {
    updateData?: (rowIndex: number, columnId: string, value: unknown) => void;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TFeatures extends TableFeatures, TData extends RowData, TValue> {
    name?: string;
    isGrow?: boolean;
  }
}

export function AppTable<TData extends RowData>({
  table,
  overscan = 5,
  estimatedRowHeight = 48,
  maxBodyHeight = "90vh",
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
  totalCount = 0,
  label,
  isStale = false,
}: {
  table: ReturnType<typeof useAppTable<TData>>;
  overscan?: number;
  estimatedRowHeight?: number;
  maxBodyHeight?: string | number;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  totalCount?: number;
  label?: string;
  isStale?: boolean;
}) {
  const rows = table.getRowModel().rows;

  const { parentRef, virtualItems, totalSize } = useVirtualInfiniteScroll({
    rowCount: rows.length,
    totalCount,
    overscan,
    estimatedRowHeight,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  return (
    <div className="space-y-4">
      <div
        className="no-scrollbar rounded-md border border-border focus:outline-none"
        autoFocus
        ref={parentRef}
        style={{ maxHeight: maxBodyHeight, overflow: "auto" }}
        tabIndex={0}
      >
        <table.AppTable
          selector={(state) => ({
            sorting: state.sorting,
            columnVisibility: state.columnVisibility,
          })}
        >
          {(_state) => (
            <table
              style={{
                tableLayout: rows.length > 0 ? "fixed" : "auto",
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead className="sticky top-0 z-20 border-b border-border bg-background">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers
                      .filter((h) => h.column.getIsVisible())
                      .map((header) => (
                        <table.AppHeader
                          key={header.id}
                          header={header}
                          selector={(state) => ({
                            vis: state.columnVisibility[header.column.id],
                            sel: state.rowSelection,
                          })}
                        >
                          {(h) => (
                            <th
                              className="sticky top-0 z-20 border-r border-border bg-background p-2 text-left text-sm font-bold"
                              style={{
                                width: h.column.columnDef.meta?.isGrow
                                  ? "auto"
                                  : `${h.getSize()}px`,
                                minWidth: h.column.columnDef.meta?.isGrow
                                  ? `${h.column.columnDef.minSize ?? 0}px`
                                  : undefined,
                              }}
                            >
                              <h.FlexRender />
                            </th>
                          )}
                        </table.AppHeader>
                      ))}
                  </tr>
                ))}
              </thead>

              <tbody className={cn("transition-opacity duration-200", isStale && "opacity-50")}>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={table.getAllColumns().length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No results.
                    </td>
                  </tr>
                ) : (
                  <>
                    <tr aria-hidden>
                      <td
                        colSpan={table.getVisibleLeafColumns().length || 1}
                        style={{ padding: 0, height: virtualItems[0]?.start ?? 0 }}
                      />
                    </tr>

                    {virtualItems.map((vi) => {
                      const row = rows[vi.index];
                      if (!row) return null;
                      return (
                        <tr
                          key={row.id}
                          className="cursor-pointer border-b border-border hover:bg-accent/50"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <table.AppCell key={cell.id} cell={cell}>
                              {(c) => (
                                <td
                                  className="p-2 text-sm"
                                  style={{ width: c.column.getSize() }}
                                >
                                  <c.FlexRender />
                                </td>
                              )}
                            </table.AppCell>
                          ))}
                        </tr>
                      );
                    })}

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
                )}
              </tbody>
            </table>
          )}
        </table.AppTable>

        {isFetchingNextPage && (
          <div className="sticky bottom-0 z-10 border-t border-border bg-background/80 p-4 text-center backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2Icon className="h-4 w-4 animate-spin" />
              <span>Loading more {label || "items"}...</span>
            </div>
          </div>
        )}
      </div>

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
