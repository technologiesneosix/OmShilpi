import React from 'react';
import { Search, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  searchQuery = '',
  onSearchChange,
  pagination = null,
  onPageChange,
  onRefresh,
  emptyMessage = 'No records found.',
}) => {
  return (
    <div className="bg-[#16171d] border border-slate-800 rounded-lg overflow-hidden space-y-4">
      {/* Table Toolbar */}
      {(onSearchChange || onRefresh) && (
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          {onSearchChange && (
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-[#1f2028] border border-slate-700 text-xs text-white pl-9 pr-3 py-2 rounded outline-none focus:border-[#7b5818] placeholder-slate-500"
              />
            </div>
          )}

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 bg-[#1f2028] hover:bg-slate-800 text-slate-300 rounded text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          )}
        </div>
      )}

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#1f2028] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-semibold">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="p-3.5">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="p-12 text-center text-slate-400">
                  <div className="flex justify-center items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#b98f4a]" /> Loading table records...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-12 text-center text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr key={row.id || rowIdx} className="hover:bg-slate-800/50 transition">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="p-3.5 align-middle">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {pagination && pagination.totalPages > 1 && (
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Page <strong className="text-white">{pagination.page}</strong> of {pagination.totalPages} ({pagination.total} total items)
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 bg-[#1f2028] border border-slate-700 rounded disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 bg-[#1f2028] border border-slate-700 rounded disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
