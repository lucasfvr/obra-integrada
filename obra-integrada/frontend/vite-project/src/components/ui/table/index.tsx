import type { HTMLAttributes, ReactNode } from "react";

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode;
}

interface TableSectionProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

interface RowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
}

interface CellProps extends HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  isHeader?: boolean;
}

export function Table({ children, className = "w-full border-collapse", ...rest }: TableProps) {
  return (
    <table className={className} {...rest}>
      {children}
    </table>
  );
}

export function TableHeader({ children, className = "", ...rest }: TableSectionProps) {
  return (
    <thead className={className} {...rest}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = "", ...rest }: TableSectionProps) {
  return (
    <tbody className={className} {...rest}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = "", ...rest }: RowProps) {
  return (
    <tr className={className} {...rest}>
      {children}
    </tr>
  );
}

export function TableCell({
  isHeader,
  children,
  className = "",
  ...rest
}: CellProps) {
  if (isHeader) {
    return (
      <th className={className} scope="col" {...rest}>
        {children}
      </th>
    );
  }

  return (
    <td className={className} {...rest}>
      {children}
    </td>
  );
}
