/**
 * use-app-table.ts — mirrors apps/frontend/src/hooks/use-app-table.ts from the table-v9 branch.
 *
 * Key v9 characteristics:
 *  - tableFeatures() explicitly declares which features are used
 *  - createTableHook() creates a typed hook + cell/header components with selector-based subscriptions
 *  - The returned useAppTable hook takes a TanStack Store instance for state management
 *  - getRowId, manualSorting/Filtering/Pagination are set once here for all tables
 */
import {
  type Column,
  type ColumnDef,
  columnFilteringFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createTableHook,
  globalFilteringFeature,
  type Row,
  type RowData,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  type Table,
  tableFeatures,
} from "@tanstack/react-table";

import { CellComponents } from "../components/cell-components";
import { HeaderComponents } from "../components/header-components";

export const features = tableFeatures({
  columnSizingFeature,
  columnVisibilityFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  rowSelectionFeature,
});

export const {
  createAppColumnHelper,
  useAppTable,
  useTableContext,
  useCellContext,
  useHeaderContext,
  appFeatures,
} = createTableHook({
  // Features are set once here and shared across all tables
  features: features,

  // Cell-level components (accessible via cell.ComponentName inside AppCell)
  cellComponents: CellComponents,

  // Header-level components (accessible via header.ComponentName inside AppHeader)
  headerComponents: HeaderComponents,

  // Default options applied to every useAppTable call
  getRowId: (row: Record<string, unknown>) => row["id"] as string,
  manualSorting: true,
  manualFiltering: true,
  manualPagination: true,
});

export type AppFeatures = typeof appFeatures;
export type AppTable<TData extends RowData> = Table<AppFeatures, TData>;
export type AppRow<TData extends RowData> = Row<AppFeatures, TData>;
export type AppColumn<TData extends RowData, TValue = unknown> = Column<
  AppFeatures,
  TData,
  TValue
>;
export type AppColumnDef<TData extends RowData, TValue = unknown> = ColumnDef<
  AppFeatures,
  TData,
  TValue
>;
