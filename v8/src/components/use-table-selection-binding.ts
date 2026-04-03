import type { Table } from "@tanstack/react-table";
import { useEffect, useMemo } from "react";

type SelectionBindingOptions<TData, TSelected> = {
  table: Table<TData>;
  onSelectionChange: (selected: TSelected[]) => void;
  mapRowToSelected: (row: TData, id: string) => TSelected;
  clearOnUnmount?: boolean;
};

export function useTableSelectionBinding<TData, TSelected>({
  table,
  onSelectionChange,
  mapRowToSelected,
  clearOnUnmount = false,
}: SelectionBindingOptions<TData, TSelected>) {
  const rowSelection = table.getState().rowSelection;
  const ids = useMemo(() => Object.keys(rowSelection ?? {}), [rowSelection]);

  useEffect(() => {
    const rowMap = new Map<string, TData>();
    for (const row of table.getRowModel().rows) {
      rowMap.set(row.id, row.original);
    }

    const selectedItems: TSelected[] = ids
      .map((id) => {
        const original = rowMap.get(id);
        if (!original) return null;
        return mapRowToSelected(original, id);
      })
      .filter((x): x is TSelected => x !== null);

    onSelectionChange(selectedItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(","), table.getRowModel().rows]);

  useEffect(() => {
    return () => {
      if (clearOnUnmount) onSelectionChange([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearOnUnmount]);

  return {
    clearTableSelection: () => table.setRowSelection({}),
  };
}
