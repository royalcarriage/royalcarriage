import React from "react";
import type { ReactNode } from "react";

interface TableProps<T> {
  columns: { key: keyof T | string; label: string; render?: (row: any) => ReactNode }[];
  data: T[];
  empty?: string;
}

export function Table<T>({ columns, data, empty }: TableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row) => (
            <tr
              key={(row as any).id ?? JSON.stringify(row)}
              className="hover:bg-slate-50"
            >
              {columns.map((col) => (
                <td key={String(col.key)} className="px-4 py-2 text-sm text-slate-800">
                  {col.render ? col.render(row) : (row as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                className="px-4 py-4 text-center text-sm text-slate-500"
                colSpan={columns.length}
              >
                {empty || "No records"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
