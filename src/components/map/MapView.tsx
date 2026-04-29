'use client';

// MapView renders the full city-wide issue map with markers, popups, and optional heatmap
// Uses Leaflet for rendering, OpenStreetMap for tiles — no paid APIs

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Issue, IssueCategory } from '@/types';
import Spinner from '@/components/ui/Spinner';
import { categoryColors, categoryLabels, categoryIcons } from '@/lib/utils';

interface MapViewProps {
  issues: Issue[];
  onIssueClick?: (issue: Issue) => void;
  showHeatmap?: boolean;
  height?: string;
}

// Dynamic import — Leaflet is browser-only
const LeafletMapInner = dynamic(() => import('./LeafletMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Spinner size="lg" className="mx-auto mb-3" />
        <p className="text-sm text-slate-500">Loading map...</p>
      </div>
    </div>
  ),
});

export default function MapView({
  issues,
  onIssueClick,
  showHeatmap = false,
  height = '600px',
}: MapViewProps) {
  const [heatmapOn, setHeatmapOn] = useState(showHeatmap);
  const [filterCategory, setFilterCategory] = useState<IssueCategory | 'all'>('all');

  const filteredIssues =
    filterCategory === 'all'
      ? issues
      : issues.filter((i) => i.category === filterCategory);

  // categories that actually have issues — only show those in legend
  const activeCategories = Array.from(new Set(issues.map((i) => i.category))) as IssueCategory[];

  return (
    <div className="relative w-full" style={{ height }}>
      {/* map fills container */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <LeafletMapInner
          issues={filteredIssues}
          onIssueClick={onIssueClick}
          showHeatmap={heatmapOn}
        />
      </div>

      {/* ── Top-right controls overlay ── */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        {/* heatmap toggle */}
        <button
          onClick={() => setHeatmapOn(!heatmapOn)}
          className={`
            px-3 py-2 rounded-xl text-xs font-semibold shadow-md transition-all duration-200
            border backdrop-blur-sm
            ${heatmapOn
              ? 'bg-brand-600 text-white border-brand-700 shadow-brand-200'
              : 'bg-white/90 text-slate-700 border-slate-200 hover:bg-white'
            }
          `}
        >
          {heatmapOn ? '🔥 Heatmap ON' : '🗺️ Heatmap OFF'}
        </button>

        {/* category legend */}
        {activeCategories.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-md border border-slate-200 text-xs">
            <p className="font-semibold text-slate-700 mb-2">Filter by Category</p>

            <button
              onClick={() => setFilterCategory('all')}
              className={`
                w-full text-left flex items-center gap-2 mb-1 px-2 py-1 rounded-lg transition-colors
                ${filterCategory === 'all' ? 'bg-slate-100 font-medium' : 'hover:bg-slate-50'}
              `}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 flex-shrink-0" />
              <span className="text-slate-600">All Categories</span>
              <span className="ml-auto text-slate-400">{issues.length}</span>
            </button>

            {activeCategories.map((cat) => {
              const count = issues.filter((i) => i.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`
                    w-full text-left flex items-center gap-2 mb-1 px-2 py-1 rounded-lg transition-colors
                    ${filterCategory === cat ? 'bg-slate-100 font-medium' : 'hover:bg-slate-50'}
                  `}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: categoryColors[cat] }}
                  />
                  <span className="text-slate-600">
                    {categoryIcons[cat]} {categoryLabels[cat]}
                  </span>
                  <span className="ml-auto text-slate-400">{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Bottom-left: issue count ── */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md border border-slate-200">
          <p className="text-xs font-medium text-slate-700">
            {filteredIssues.length} issue{filteredIssues.length !== 1 ? 's' : ''} shown
          </p>
        </div>
      </div>
    </div>
  );
}