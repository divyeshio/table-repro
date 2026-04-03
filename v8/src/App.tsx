/**
 * App.tsx — v8
 *
 * Mirrors domains.tsx (main branch) with Person data instead of DomainAsset.
 * Key v8 characteristics:
 *  - useReactTable with manual rowSelection/sorting state via useState
 *  - onSortingChange callback syncs sorting state
 *  - MemoizedPersonTableRow with custom React.memo comparator
 *  - useTableSelectionBinding syncs row selection to a local selection list
 *  - useDebouncedValue (500ms) + useDeferredValue for search
 */
import { useDebouncedValue } from "@tanstack/react-pacer";
import {
  getCoreRowModel,
  type RowSelectionState,
  type SortingState,
  type Updater,
  type VisibilityState,
  useReactTable,
} from "@tanstack/react-table";
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
import { PersonAppTable } from "./components/person-app-table";
import { useTableSelectionBinding } from "./components/use-table-selection-binding";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

const PAGE_SIZE = 50;

const INITIAL_COLUMN_VISIBILITY = {
  id: false,
  tags: false,
  notes: false,
};

const INITIAL_COLUMN_ORDER = [
  "isNew",
  "selectAction",
  "name",
  "email",
  "department",
  "status",
  "role",
  "age",
  "salary",
  "isLiked",
  "actions",
];

export default function App() {
  // ── Search state ────────────────────────────────────────────────────────────
  const [filter, setFilter] = useState("");
  const [debouncedSearch] = useDebouncedValue(filter, { wait: 500 });
  const deferredSearch = useDeferredValue(debouncedSearch);

  // ── Sort state ──────────────────────────────────────────────────────────────
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

  // ── Row selection state ─────────────────────────────────────────────────────
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

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
        if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [deferredSearch, sortBy, sortOrder]);

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

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setLoadedCount(PAGE_SIZE);
    setRowSelection({});
    setTimeout(() => setIsRefreshing(false), 500);
  }, []);

  // ── Sorting state for table ─────────────────────────────────────────────────
  const sorting = useMemo<SortingState>(
    () => (sortBy ? [{ id: sortBy, desc: sortOrder === "desc" }] : []),
    [sortBy, sortOrder],
  );

  // ── Column visibility ───────────────────────────────────────────────────────
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(INITIAL_COLUMN_VISIBILITY);

  const handleColumnVisibilityChange = useCallback(
    (updaterOrValue: Updater<VisibilityState>) => {
      setColumnVisibility((prev) =>
        typeof updaterOrValue === "function" ? updaterOrValue(prev) : updaterOrValue,
      );
    },
    [],
  );

  // ── Table instance ──────────────────────────────────────────────────────────
  const table = useReactTable({
    data: persons,
    columns: personTableColumns,
    enableRowSelection: true,
    enableSorting: true,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    initialState: {
      columnOrder: INITIAL_COLUMN_ORDER,
    },
    state: {
      rowSelection,
      sorting,
      columnVisibility,
    },
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onSortingChange: (updaterOrValue) => {
      const next =
        typeof updaterOrValue === "function" ? updaterOrValue(sorting) : updaterOrValue;
      const first = next[0];
      if (first) {
        setSortBy(first.id);
        setSortOrder(first.desc ? "desc" : "asc");
      } else {
        setSortBy("");
        setSortOrder(null);
      }
    },
  });

  // ── Sync selection → local list (mirrors useTableSelectionBinding usage) ────
  const [selectedItems, setSelectedItems] = useState<{ id: string; name: string }[]>([]);

  useTableSelectionBinding<Person, { id: string; name: string }>({
    table,
    onSelectionChange: setSelectedItems,
    mapRowToSelected: (row, id) => ({ id, name: row?.name ?? id }),
  });

  // ── Selected row detail ──────────────────────────────────────────────────────
  const [detailId, setDetailId] = useState<string>("");

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-2">
        <span className="mr-2 text-sm font-semibold text-muted-foreground">
          TanStack Table{" "}
          <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-xs font-bold text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            v8
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

        {/* Selection summary */}
        {selectedItems.length > 0 && (
          <span className="ml-auto text-sm text-muted-foreground">
            {selectedItems.length} selected
            <Button
              variant="link"
              size="sm"
              className="ml-1 h-auto p-0 text-xs"
              onClick={() => table.setRowSelection({})}
            >
              Clear
            </Button>
          </span>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden p-4">
        <PersonAppTable
          table={table}
          onSelect={(id) => setDetailId(id === detailId ? "" : id)}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isLoading={false}
          fetchNextPage={fetchNextPage}
          totalCount={totalCount}
          label="People"
          isStale={isPending}
        />
      </div>

      {/* Detail panel (simplified — shows selected person info) */}
      {detailId && (
        <div className="fixed right-0 top-0 h-full w-80 overflow-auto border-l border-border bg-card p-4 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Person Detail</h2>
            <Button variant="ghost" size="icon-xs" onClick={() => setDetailId("")}
              className="text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-4" />
            </Button>
          </div>
          {(() => {
            const person = persons.find((p) => p.id === detailId);
            if (!person) return <p className="text-muted-foreground text-sm">Not found</p>;
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
