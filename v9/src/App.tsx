/**
 * App.tsx — v9
 *
 * Mirrors domains.tsx (table-v9 branch) with Person data.
 * Key v9 characteristics:
 *  - Module-level createStore(getInitialTableState(features, initialState))
 *    so table state survives across component re-renders
 *  - useAppTable({ data, columns, store }) — no manual sorting/selection state
 *  - Sorting state read from store via useStore for data filtering
 *  - No useTableSelectionBinding (deleted in v9)
 *  - DataTable no longer has renderItem — rows rendered inside AppTable render prop
 *  - useDebouncedValue (500ms) + useDeferredValue for search (same as v8)
 */
import { useDebouncedValue } from "@tanstack/react-pacer";
import { useStore } from "@tanstack/react-store";
import { createStore } from "@tanstack/react-store";
import { getInitialTableState } from "@tanstack/react-table";
import { EyeIcon, RefreshCwIcon, SearchIcon, XIcon } from "lucide-react";
import {
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
} from "react";

import { ALL_PERSONS } from "./data/persons";
import type { Person } from "./types/person";
import { personTableColumns } from "./components/person-columns";
import { AppTable } from "./components/app-table";
import { features, useAppTable } from "./hooks/use-app-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

const PAGE_SIZE = 50;

/**
 * Module-level store — persists table state (columnVisibility, sorting, rowSelection)
 * across component re-renders WITHOUT causing React re-renders in the whole tree.
 * This is the core v9 state management difference vs v8's useState.
 */
const myTableStore = createStore(
  getInitialTableState(features, {
    columnVisibility: {
      id: false,
      tags: false,
      notes: false,
    },
  }),
);

export default function App() {
  // ── Search state ────────────────────────────────────────────────────────────
  const [filter, setFilter] = useState("");
  const [debouncedSearch] = useDebouncedValue(filter, { wait: 500 });
  const deferredSearch = useDeferredValue(debouncedSearch);

  // ── Read sorting from the store (v9 pattern — no useState for sorting) ──────
  const sorting = useStore(myTableStore, (s) => s.sorting);
  const sortBy = sorting[0]?.id ?? "";
  const sortDesc = sorting[0]?.desc ?? false;

  // ── Simulated infinite pagination ───────────────────────────────────────────
  const [loadedCount, setLoadedCount] = useState(PAGE_SIZE);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Derived data ────────────────────────────────────────────────────────────
  const filteredPersons = useMemo(() => {
    const q = deferredSearch.toLowerCase();
    let data = q
      ? ALL_PERSONS.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.email.toLowerCase().includes(q) ||
            p.department.toLowerCase().includes(q),
        )
      : ALL_PERSONS;

    if (sortBy) {
      data = [...data].sort((a, b) => {
        const aVal = a[sortBy as keyof Person] as string | number;
        const bVal = b[sortBy as keyof Person] as string | number;
        if (aVal < bVal) return sortDesc ? 1 : -1;
        if (aVal > bVal) return sortDesc ? -1 : 1;
        return 0;
      });
    }
    return data;
  }, [deferredSearch, sortBy, sortDesc]);

  const persons = useMemo(
    () => filteredPersons.slice(0, loadedCount),
    [filteredPersons, loadedCount],
  );

  const hasNextPage = loadedCount < filteredPersons.length;
  const totalCount = filteredPersons.length;
  const isPending = filter !== debouncedSearch;

  // ── Callbacks ───────────────────────────────────────────────────────────────
  const fetchNextPage = useCallback(() => {
    if (isFetchingNextPage || !hasNextPage) return;
    setIsFetchingNextPage(true);
    setTimeout(() => {
      setLoadedCount((prev) => prev + PAGE_SIZE);
      setIsFetchingNextPage(false);
    }, 80);
  }, [isFetchingNextPage, hasNextPage]);

  const handleRefreshState = useCallback(() => {
    setIsRefreshing(true);
    setLoadedCount(PAGE_SIZE);
    setTimeout(() => setIsRefreshing(false), 500);
  }, []);

  // ── Table instance (v9: takes a store instead of manual state) ───────────────
  const table = useAppTable({
    data: persons,
    columns: personTableColumns,
    store: myTableStore,
  });

  // handleRefresh uses table.setRowSelection which needs table instance
  const handleRefresh = useCallback(() => {
    handleRefreshState();
    table.setRowSelection({});
  }, [handleRefreshState, table]);

  // ── Column visibility dropdown ───────────────────────────────────────────────

  // ── Read selection count from store ─────────────────────────────────────────
  const rowSelectionCount = useStore(
    myTableStore,
    (s) => Object.keys(s.rowSelection).length,
  );

  // ── Selected row detail ──────────────────────────────────────────────────────
  const [detailId, setDetailId] = useState<string>("");

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-2">
        <span className="mr-2 text-sm font-semibold text-muted-foreground">
          TanStack Table{" "}
          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-bold text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            v9
          </span>
        </span>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search people..."
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setLoadedCount(PAGE_SIZE);
            }}
            className={`pl-8 pr-8${isPending ? " opacity-60" : ""}`}
          />
          {filter && (
            <button
              className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
              onClick={() => setFilter("")}
            >
              <XIcon className="size-4" />
            </button>
          )}
        </div>

        {/* Refresh */}
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCwIcon className={isRefreshing ? "animate-spin" : ""} />
          Refresh
        </Button>

        {/* Column visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <EyeIcon /> Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table.getAllColumns().map((col) => {
              if (!col.getCanHide()) return null;
              return (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={col.getIsVisible()}
                  onCheckedChange={(checked) => col.toggleVisibility(checked)}
                >
                  {col.columnDef.meta?.name || col.id}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Selection summary (reads from store — no useState) */}
        {rowSelectionCount > 0 && (
          <span className="ml-auto text-sm text-muted-foreground">
            {rowSelectionCount} selected
            <Button
              variant="link"
              size="sm"
              className="ml-1 h-auto p-0 text-xs"
              onClick={() => (() => table.setRowSelection({}))()}
            >
              Clear
            </Button>
          </span>
        )}
      </div>

      {/* Table — v9: no renderItem, rows rendered inside AppTable */}
      <div className="flex-1 overflow-hidden p-4">
        <AppTable
          table={table}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          totalCount={totalCount}
          label="People"
          isStale={isPending}
        />
      </div>

      {/* Detail panel */}
      {detailId && (
        <div className="fixed right-0 top-0 h-full w-80 overflow-auto border-l border-border bg-card p-4 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Person Detail</h2>
            <Button variant="ghost" size="icon-xs" onClick={() => setDetailId("")} className="text-muted-foreground hover:text-foreground">
              <XIcon className="size-4" />
            </Button>
          </div>
          {(() => {
            const person = persons.find((p) => p.id === detailId);
            if (!person) return <p className="text-sm text-muted-foreground">Not found</p>;
            return (
              <dl className="space-y-2 text-sm">
                {(Object.keys(person) as (keyof Person)[]).map((key) => (
                  <div key={key}>
                    <dt className="font-medium capitalize">{key}</dt>
                    <dd className="text-muted-foreground">{String(person[key])}</dd>
                  </div>
                ))}
              </dl>
            );
          })()}
        </div>
      )}
    </div>
  );
}
