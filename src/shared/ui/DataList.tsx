import type { ReactNode } from 'react';

export interface DataListRow {
  label: string;
  value: ReactNode;
}

interface DataListProps {
  rows: readonly DataListRow[];
}

export function DataList({ rows }: DataListProps) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between gap-3 border-b border-slate-100 py-1">
          <dt className="text-xs text-slate-500">{row.label}</dt>
          <dd className="text-right text-sm font-medium text-slate-900">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
