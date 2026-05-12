'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IssueFilters as IssueFiltersType } from '@/types';
import {
  ISSUE_CATEGORIES,
  ISSUE_STATUSES,
  URGENCY_LEVELS,
  SORT_OPTIONS,
} from '@/lib/constants';
import { useDebouncedSearch } from '@/hooks/useDebounce';

interface IssueFiltersProps {
  filters: IssueFiltersType;
  onFilterChange: (filters: Partial<IssueFiltersType>) => void;
  onReset: () => void;
  resultCount?: number;
}

function SelectFilter({
  label,
  value,
  options,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'appearance-none w-full pl-3 pr-8 py-2 rounded-xl text-sm',
          'bg-white dark:bg-gray-800',
          'border border-gray-200 dark:border-gray-700',
          'text-gray-700 dark:text-gray-200',
          'focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20',
          'transition-all duration-150 cursor-pointer',
          value ? 'border-blue-400 text-blue-600 dark:text-blue-400' : ''
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
    </div>
  );
}

export function IssueFilters({
  filters,
  onFilterChange,
  onReset,
  resultCount,
}: IssueFiltersProps) {
  const [expanded, setExpanded] = useState(false);

  const { searchValue, handleSearch, clearSearch } = useDebouncedSearch(
    (value) => onFilterChange({ search: value }),
    400
  );

  const hasActiveFilters =
    !!filters.status ||
    !!filters.category ||
    !!filters.urgency ||
    !!filters.search;

  const activeFilterCount = [
    filters.status,
    filters.category,
    filters.urgency,
    filters.search,
  ].filter(Boolean).length;

  const handleReset = () => {
    clearSearch();
    onReset();
  };

  return (
    <div className="civic-card p-4 space-y-3">
      {/* Top Row */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search issues by title, description..."
            className={cn(
              'w-full pl-9 pr-9 py-2.5 rounded-xl text-sm',
              'bg-gray-50 dark:bg-gray-700/50',
              'border border-gray-200 dark:border-gray-600',
              'text-gray-700 dark:text-gray-200 placeholder:text-gray-400',
              'focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20',
              'transition-all duration-150'
            )}
          />
          {searchValue && (
            <button
              onClick={() => { clearSearch(); onFilterChange({ search: '' }); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className={cn(
            'flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium',
            'transition-all duration-150',
            expanded || hasActiveFilters
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          )}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-white/30 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Reset */}
        {hasActiveFilters && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </motion.button>
        )}
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <SelectFilter
                label="Status"
                value={filters.status || ''}
                options={ISSUE_STATUSES.map((s) => ({
                  value: s.value,
                  label: s.label,
                }))}
                onChange={(v) => onFilterChange({ status: v as IssueFiltersType['status'] })}
                placeholder="All Statuses"
              />
              <SelectFilter
                label="Category"
                value={filters.category || ''}
                options={ISSUE_CATEGORIES.map((c) => ({ value: c, label: c }))}
                onChange={(v) => onFilterChange({ category: v as IssueFiltersType['category'] })}
                placeholder="All Categories"
              />
              <SelectFilter
                label="Urgency"
                value={filters.urgency || ''}
                options={URGENCY_LEVELS.map((u) => ({
                  value: u.value,
                  label: u.label,
                }))}
                onChange={(v) => onFilterChange({ urgency: v as IssueFiltersType['urgency'] })}
                placeholder="All Urgencies"
              />
              <SelectFilter
                label="Sort By"
                value={filters.sort || '-priorityScore'}
                options={SORT_OPTIONS.map((s) => ({
                  value: s.value,
                  label: s.label,
                }))}
                onChange={(v) => onFilterChange({ sort: v })}
                placeholder="Sort By"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result count */}
      {resultCount !== undefined && (
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-gray-100 dark:bg-gray-700" />
          <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
            {resultCount.toLocaleString()} issue{resultCount !== 1 ? 's' : ''} found
          </span>
          <div className="h-px flex-1 bg-gray-100 dark:bg-gray-700" />
        </div>
      )}
    </div>
  );
}