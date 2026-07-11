"use client";

import * as React from "react";

import { cn } from "../lib/cn";

/**
 * Table — ORVIX Design System v1.0.
 *
 * The data surface. Sticky header, hover row, optional selection,
 * sort indicators, resizable columns, empty state.
 *
 * Composition law: the table is a presentational container. Cell
 * content is composed by the caller; this component owns only
 * chrome.
 *
 * Usage:
 *   <Table>
 *     <THead>
 *       <TR><TH>...</TH></TR>
 *     </THead>
 *     <TBody>
 *       <TR>...</TR>
 *     </TBody>
 *   </Table>
 */
export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  /** Sticky header row. Default true. */
  stickyHeader?: boolean;
  /** Compress row height for dense data lists. */
  density?: "comfortable" | "dense";
}

interface DataTableContextValue {
  stickyHeader: boolean;
  density: "comfortable" | "dense";
}
const DataTableContext = React.createContext<DataTableContextValue>({
  stickyHeader: true,
  density: "comfortable",
});

/** Read the table context inside THead/TBody/TR/TH/TD components. */
export function useTableContext(): DataTableContextValue {
  return React.useContext(DataTableContext);
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, stickyHeader = true, density = "comfortable", children, ...props }, ref) => {
    const ctx = React.useMemo(() => ({ stickyHeader, density }), [stickyHeader, density]);
    return (
      <DataTableContext.Provider value={ctx}>
        <div className="w-full overflow-x-auto">
          <table
            ref={ref}
            className={cn(
              "w-full border-collapse text-sm",
              "border-y border-surface-divider",
              className,
            )}
            {...props}
          >
            {children}
          </table>
        </div>
      </DataTableContext.Provider>
    );
  },
);
Table.displayName = "Table";

export const THead = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "bg-surface-raised text-2xs uppercase tracking-wider text-text-muted",
      className,
    )}
    {...props}
  />
));
THead.displayName = "THead";

export const TBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("bg-surface-canvas", className)} {...props} />
));
TBody.displayName = "TBody";

export interface TRProps extends React.HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
  clickable?: boolean;
}
export const TR = React.forwardRef<HTMLTableRowElement, TRProps>(
  ({ className, selected, clickable, ...props }, ref) => {
    const { density } = useTableContext();
    return (
      <tr
        ref={ref}
        data-state={selected ? "selected" : undefined}
        className={cn(
          "border-b border-surface-divider transition-colors duration-fast ease-out-quint",
          clickable && "cursor-pointer hover:bg-highlight-1",
          selected && "bg-highlight-2 hover:bg-highlight-2",
          density === "comfortable" ? "h-12" : "h-9",
          className,
        )}
        {...props}
      />
    );
  },
);
TR.displayName = "TR";

export interface THProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /** Active sort column. */
  sort?: "asc" | "desc" | "none";
}
export const TH = React.forwardRef<HTMLTableCellElement, THProps>(
  ({ className, sort, children, ...props }, ref) => {
    const { stickyHeader } = useTableContext();
    return (
      <th
        ref={ref}
        scope="col"
        aria-sort={sort === "asc" ? "ascending" : sort === "desc" ? "descending" : undefined}
        className={cn(
          "px-4 text-left font-semibold text-text-muted",
          stickyHeader && "sticky top-0 z-sticky bg-surface-raised",
          className,
        )}
        {...props}
      >
        <span className="inline-flex items-center gap-1.5">
          {children}
          {sort && sort !== "none" ? (
            <span aria-hidden="true" className="text-text-secondary">
              {sort === "asc" ? "↑" : "↓"}
            </span>
          ) : null}
        </span>
      </th>
    );
  },
);
TH.displayName = "TH";

export const TD = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("px-4 text-text-primary align-middle", className)}
    {...props}
  />
));
TD.displayName = "TD";

/**
 * TableEmpty — empty state slot for a table body.
 */
export function TableEmpty({ children }: { children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={100} className="text-center py-12 text-text-secondary text-sm">
        {children}
      </td>
    </tr>
  );
}
