/**
 * CellComponents — mirrors apps/frontend/src/components/tables/cell-components.tsx
 * from the table-v9 branch.
 *
 * These components are passed to createTableHook and become accessible as
 * cell.SelectionCell, cell.TextCell inside column definitions.
 *
 * The key mechanism:
 *  - useCellContext() reads the typed cell context
 *  - useTableContext() reads the table instance
 *  - table.Subscribe with a selector provides granular state subscriptions
 *    so only the exact rows whose selection state changed re-render
 */
import { Checkbox } from "@/components/ui/checkbox";
import { useCellContext, useTableContext } from "@/hooks/use-app-table";

/** Generic text cell renderer */
export function TextCell() {
  const cell = useCellContext<string>();
  return <span>{cell.getValue()}</span>;
}

/**
 * Row selection checkbox cell.
 * Uses table.Subscribe to only re-render when THIS row's selection state changes.
 */
export function SelectionCell() {
  const cell = useCellContext<boolean>();
  const table = useTableContext();
  const row = cell.row;

  return (
    <table.Subscribe selector={(state) => state.rowSelection[row.id]}>
      {() => (
        <div className="flex w-full items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={(checked) => row.toggleSelected(checked === true)}
            onClick={(e) => e.stopPropagation()}
            aria-label="Select row"
          />
        </div>
      )}
    </table.Subscribe>
  );
}

export const CellComponents = {
  TextCell,
  SelectionCell,
};
