'use client';

import React from 'react';

interface MobileTableProps {
  data: any[];
  columns: {
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
    hideOnMobile?: boolean;
    priority?: 'high' | 'medium' | 'low';
  }[];
  className?: string;
}

export function MobileTable({ data, columns, className = '' }: MobileTableProps) {
  if (data.length === 0) {
    return (
      <div className={`bg-white rounded-lg border p-6 text-center text-gray-600 ${className}`}>
        No data available
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Mobile Cards */}
      <div className="block sm:hidden space-y-3">
        {data.map((row, index) => (
          <div key={index} className="bg-white border rounded-lg p-4 space-y-3">
            {columns
              .filter(col => !col.hideOnMobile)
              .map(col => (
                <div key={col.key} className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-600 min-w-[100px]">
                    {col.label}:
                  </span>
                  <span className="text-sm text-gray-900 text-right flex-1 ml-2">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </span>
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg border">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    col.priority === 'low' ? 'hidden lg:table-cell' : ''
                  } ${col.priority === 'medium' ? 'hidden md:table-cell' : ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {columns.map(col => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-sm text-gray-900 ${
                      col.priority === 'low' ? 'hidden lg:table-cell' : ''
                    } ${col.priority === 'medium' ? 'hidden md:table-cell' : ''}`}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper component for action buttons in tables
interface TableActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function TableActions({ children, className = '' }: TableActionsProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {children}
    </div>
  );
}
