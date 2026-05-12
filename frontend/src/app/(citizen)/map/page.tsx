'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import {
  Map as MapIcon,
  Filter,
  X,
  Layers,
  Navigation,
  RefreshCw,
} from 'lucide-react';
import { useIssues } from '@/hooks/useIssues';
import { useGeolocation } from '@/hooks/useGeolocation';
import { PageHeader } from '@/components/shared/PageHeader';
import { IssueStatusBadge } from '@/components/issues/IssueStatusBadge';
import { cn } from '@/lib/utils';
import { ISSUE_CATEGORIES, ISSUE_STATUSES } from '@/lib/constants';
import { Issue } from '@/types';
import { PageLoader } from '@/components/shared/LoadingSpinner';

// Dynamically import Leaflet map (no SSR)
const CivicMap = dynamic(() => import('@/components/map/CivicMap'), {
  ssr: false,
  loading: () => <PageLoader label="Loading map..." />,
});

// ─── Map Filter Panel ─────────────────────────────────────────────────────────

interface MapFiltersState {
  status: string;
  category: string;
}

function MapFilterPanel({
  filters,
  onChange,
  onReset,
  isOpen,
  onClose,
}: {
  filters: MapFiltersState;
  onChange: (f: Partial<MapFiltersState>) => void;
  onReset: () => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const hasFilters = !!filters.status || !!filters.category;

  return (
    <motion.div
      initial={false}
      animate={isOpen ? { x: 0, opacity: 1 } : { x: '110%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      className={cn(
        'absolute top-4 right-4 z-[1000] w-72',
        'bg-white dark:bg-gray-800 rounded-2xl shadow-xl',
        'border border-gray-100 dark:border-gray-700',
        'p-5'
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
          Map Filters
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Status
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onChange({ status: '' })}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                !filters.status
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
            >
              All
            </button>
            {ISSUE_STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => onChange({ status: s.value })}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                  filters.status === s.value
                    ? s.color
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => onChange({ category: e.target.value })}
            className="w-full px-3 py-2 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-400 transition-colors"
          >
            <option value="">All Categories</option>
            {ISSUE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Reset */}
        {hasFilters && (
          <button
            onClick={onReset}
            className="w-full py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            Reset Filters
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Map Legend ───────────────────────────────────────────────────────────────

function MapLegend() {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute bottom-4 left-4 z-[1000]">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <Layers className="w-4 h-4 text-blue-600" />
        Legend
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-4 w-48"
        >
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Issue Status
          </p>
          {ISSUE_STATUSES.map((s) => (
            <div key={s.value} className="flex items-center gap-2 mb-1.5">
              <div className={cn('w-3 h-3 rounded-full', s.dot)} />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {s.label}
              </span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ─── Map Page ─────────────────────────────────────────────────────────────────

export default function MapPage() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [mapFilters, setMapFilters] = useState<MapFiltersState>({
    status: '',
    category: '',
  });

  const { mapIssues, fetchMapIssues } = useIssues({ autoFetch: false });
  const geo = useGeolocation();

  const loadMapIssues = useCallback(() => {
    const params: Record<string, string | number> = {};
    if (mapFilters.status) params.status = mapFilters.status;
    if (mapFilters.category) params.category = mapFilters.category;
    fetchMapIssues(params);
  }, [mapFilters, fetchMapIssues]);

  useEffect(() => {
    loadMapIssues();
  }, [loadMapIssues]);

  const handleFilterChange = (f: Partial<MapFiltersState>) => {
    setMapFilters((prev) => ({ ...prev, ...f }));
  };

  const handleReset = () => {
    setMapFilters({ status: '', category: '' });
  };

  const activeFilterCount = Object.values(mapFilters).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Civic Issue Map"
        description={`${mapIssues.length} issues plotted on the map`}
        icon={MapIcon}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => geo.detectLocation()}
              disabled={geo.isDetecting}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Navigation className={cn('w-4 h-4', geo.isDetecting && 'animate-spin')} />
              <span className="hidden sm:inline">My Location</span>
            </button>

            <button
              onClick={loadMapIssues}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => setFiltersOpen((p) => !p)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                filtersOpen || activeFilterCount > 0
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              )}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-white/20 text-white text-xs font-bold px-1.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        }
      />

      {/* Map Container */}
      <div className="relative civic-card overflow-hidden" style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
        <CivicMap
          issues={mapIssues}
          userLocation={
            geo.hasLocation && geo.latitude && geo.longitude
              ? { lat: geo.latitude, lng: geo.longitude }
              : null
          }
          onIssueClick={setSelectedIssue}
        />

        {/* Filter Panel */}
        <MapFilterPanel
          filters={mapFilters}
          onChange={handleFilterChange}
          onReset={handleReset}
          isOpen={filtersOpen}
          onClose={() => setFiltersOpen(false)}
        />

        {/* Legend */}
        <MapLegend />

        {/* Issue count badge */}
        <div className="absolute top-4 left-4 z-[1000]">
          <div className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200">
            📍 {mapIssues.length} issues
          </div>
        </div>
      </div>
    </div>
  );
}