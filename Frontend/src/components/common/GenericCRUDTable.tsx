import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export interface CustomAction<T> {
  key: string;
  label: string;
  icon?: React.ReactNode;
  className?: string;
  onClick: (item: T) => void;
  showIf?: (item: T) => boolean;
}

interface GenericCRUDTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onCreate?: () => void;
  createLabel?: string;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  customActions?: CustomAction<T>[];
  filterComponent?: React.ReactNode;
  searchFilter?: (item: T, query: string) => boolean;
  pageSize?: number;
  emptyMessage?: string;
}

export function GenericCRUDTable<T>({
  data,
  columns,
  keyExtractor,
  onCreate,
  createLabel,
  onEdit,
  onDelete,
  customActions = [],
  filterComponent,
  searchFilter,
  pageSize = 10,
  emptyMessage = 'Nenhum registo encontrado'
}: GenericCRUDTableProps<T>) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter by search
  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim()) return data;
    if (searchFilter) {
      return data.filter(item => searchFilter(item, searchQuery.toLowerCase()));
    }
    // Generic fallback filter across all string values
    return data.filter(item =>
      Object.values(item as any).some(val =>
        typeof val === 'string' && val.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [data, searchQuery, searchFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-navy-100 overflow-hidden">
      {/* Top Bar: Search & Action Buttons */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A44C]/30 focus:border-[#C9A44C] transition-all"
            />
          </div>
          {filterComponent}
        </div>

        <div className="flex items-center gap-2">
          {onCreate && (
            <button
              onClick={onCreate}
              className="flex items-center gap-2 px-4 py-2 bg-[#14243B] text-white rounded-xl text-sm font-medium hover:bg-[#1E3554] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 text-[#C9A44C]" />
              <span>{createLabel || t('create')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-[#14243B]/5 text-xs uppercase font-semibold text-[#14243B] tracking-wider border-b border-slate-200/80">
            <tr>
              {columns.map(col => (
                <th key={col.key} className={`px-5 py-3.5 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete || customActions.length > 0) && (
                <th className="px-5 py-3.5 text-right font-semibold">
                  {t('actions')}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onEdit || onDelete || customActions.length > 0 ? 1 : 0)}
                  className="px-5 py-12 text-center text-slate-400 font-medium"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map(item => {
                const itemId = keyExtractor(item);
                return (
                  <tr key={itemId} className="hover:bg-slate-50/70 transition-colors">
                    {columns.map(col => (
                      <td key={col.key} className={`px-5 py-3.5 align-middle ${col.className || ''}`}>
                        {col.render ? col.render(item) : (item as any)[col.key]}
                      </td>
                    ))}
                    {(onEdit || onDelete || customActions.length > 0) && (
                      <td className="px-5 py-3.5 align-middle text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {customActions.map(action => {
                            if (action.showIf && !action.showIf(item)) return null;
                            return (
                              <button
                                key={action.key}
                                onClick={() => action.onClick(item)}
                                title={action.label}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                                  action.className || 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                              >
                                {action.icon}
                                <span>{action.label}</span>
                              </button>
                            );
                          })}

                          {onEdit && (
                            <button
                              onClick={() => onEdit(item)}
                              title={t('edit')}
                              className="p-1.5 text-slate-500 hover:text-[#14243B] hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {onDelete && (
                            <button
                              onClick={() => onDelete(item)}
                              title={t('delete')}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/30">
        <span>
          {filteredData.length} {t('records')}
        </span>
        <div className="flex items-center gap-2">
          <span>
            Pág. {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
