'use client';

// This is the inner Leaflet implementation — only ever runs in the browser
// Parent MapView.tsx loads this with next/dynamic + ssr:false

import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { Issue, IssueCategory } from '@/types';
import { categoryColors, categoryIcons, categoryLabels, formatTimeAgo, statusConfig } from '@/lib/utils';

// Fix webpack-broken default icons once at module level
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ─── Build a DivIcon for each issue category ───────────────────────────────
function buildCategoryIcon(category: IssueCategory, voteCount: number, status: string): L.DivIcon {
  const color = categoryColors[category] || '#6b7280';
  const emoji = categoryIcons[category] || '📌';
  const isResolved = status === 'resolved';

  // size scales slightly with vote count — heavy issues are visually larger
  const baseSize = 32;
  const scaledSize = Math.min(baseSize + Math.floor(voteCount / 10) * 2, 52);

  const html = `
    <div class="v2a-marker-icon" style="
      width: ${scaledSize}px;
      height: ${scaledSize}px;
      background-color: ${isResolved ? '#10b981' : color};
      opacity: ${isResolved ? 0.75 : 1};
      font-size: ${Math.round(scaledSize * 0.44)}px;
    ">
      ${emoji}
    </div>
  `;

  return L.divIcon({
    html,
    className: '',
    iconSize: [scaledSize, scaledSize],
    iconAnchor: [scaledSize / 2, scaledSize / 2],
    popupAnchor: [0, -(scaledSize / 2) - 4],
  });
}

// ─── Build popup HTML (no React — just clean HTML string) ─────────────────
function buildPopupHTML(issue: Issue): string {
  const statusColors: Record<string, string> = {
    pending: '#f59e0b',
    in_progress: '#3b82f6',
    resolved: '#10b981',
  };
  const statusLabel: Record<string, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    resolved: 'Resolved',
  };

  const color = statusColors[issue.status] || '#94a3b8';
  const label = statusLabel[issue.status] || issue.status;
  const catColor = categoryColors[issue.category] || '#6b7280';
  const catIcon = categoryIcons[issue.category] || '📌';
  const catLabel = categoryLabels[issue.category] || issue.category;

  const descSnippet =
    issue.description.length > 110
      ? issue.description.slice(0, 110) + '...'
      : issue.description;

  const locationText = issue.location.address
    ? (issue.location.address.length > 60
        ? issue.location.address.slice(0, 60) + '...'
        : issue.location.address)
    : `${issue.location.lat.toFixed(5)}, ${issue.location.lng.toFixed(5)}`;

  return `
    <div style="
      font-family: Inter, system-ui, sans-serif;
      min-width: 220px;
      max-width: 260px;
      padding: 14px 16px 12px;
    ">
      <div style="display:flex; align-items:flex-start; gap:10px; margin-bottom:10px;">
        <div style="
          width:32px; height:32px; border-radius:50%;
          background:${catColor}18;
          display:flex; align-items:center; justify-content:center;
          font-size:16px; flex-shrink:0;
        ">${catIcon}</div>

        <div style="flex:1; min-width:0;">
          <div style="font-size:13px; font-weight:600; color:#0f172a; line-height:1.35; margin-bottom:4px;">
            ${issue.title}
          </div>
          <span style="
            display:inline-block;
            background:${color}18; color:${color};
            font-size:10px; font-weight:600;
            padding:2px 8px; border-radius:20px;
            border:1px solid ${color}30;
            letter-spacing:0.3px;
          ">${label.toUpperCase()}</span>
        </div>
      </div>

      <p style="font-size:12px; color:#64748b; line-height:1.55; margin:0 0 10px;">
        ${descSnippet}
      </p>

      <div style="
        display:flex; align-items:center; gap:6px;
        font-size:10px; color:#94a3b8;
        border-top:1px solid #f1f5f9; padding-top:8px;
        flex-wrap:wrap;
      ">
        <span style="
          background:${catColor}12; color:${catColor};
          padding:2px 7px; border-radius:20px;
          font-weight:500; font-size:10px;
        ">${catLabel}</span>
        <span>▲ ${issue.voteCount} votes</span>
        <span style="margin-left:auto;">${formatTimeAgo(issue.createdAt)}</span>
      </div>

      <div style="font-size:10px; color:#94a3b8; margin-top:6px; display:flex; align-items:center; gap:4px;">
        <span>📍</span>
        <span>${locationText}</span>
      </div>
    </div>
  `;
}

// ─── Heatmap via weighted circle markers ─────────────────────────────────
// We build it with Leaflet CircleMarkers so no external heatmap plugin is needed
function buildHeatmapLayer(issues: Issue[]): L.LayerGroup {
  const group = L.layerGroup();

  for (const issue of issues) {
    if (issue.status === 'resolved') continue;

    // weight from 1–20 based on vote count
    const weight = Math.min(Math.log1p(issue.voteCount) * 3 + 4, 20);

    // outer glow ring
    L.circleMarker([issue.location.lat, issue.location.lng], {
      radius: weight * 2.5,
      fillColor: '#ef4444',
      fillOpacity: 0.08,
      stroke: false,
      className: 'v2a-heatpoint',
    }).addTo(group);

    // inner hot spot
    L.circleMarker([issue.location.lat, issue.location.lng], {
      radius: weight,
      fillColor: issue.priorityScore > 60
        ? '#ef4444'
        : issue.priorityScore > 30
          ? '#f97316'
          : '#facc15',
      fillOpacity: 0.5,
      stroke: true,
      color: 'white',
      weight: 1,
    }).addTo(group);
  }

  return group;
}

// ─── Component ────────────────────────────────────────────────────────────

interface LeafletMapInnerProps {
  issues: Issue[];
  onIssueClick?: (issue: Issue) => void;
  showHeatmap: boolean;
}

export default function LeafletMapInner({
  issues,
  onIssueClick,
  showHeatmap,
}: LeafletMapInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);

  // ─── Compute map center from issues ───────────────────────────────────
  const getCenter = useCallback((): [number, number] => {
    if (issues.length === 0) return [51.505, -0.09]; // London default

    const avgLat = issues.reduce((s, i) => s + i.location.lat, 0) / issues.length;
    const avgLng = issues.reduce((s, i) => s + i.location.lng, 0) / issues.length;
    return [avgLat, avgLng];
  }, [issues]);

  // ─── Rebuild markers layer ─────────────────────────────────────────────
  const rebuildMarkers = useCallback((map: L.Map) => {
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    } else {
      markersLayerRef.current = L.layerGroup().addTo(map);
    }

    for (const issue of issues) {
      const icon = buildCategoryIcon(issue.category, issue.voteCount, issue.status);

      const marker = L.marker([issue.location.lat, issue.location.lng], { icon })
        .addTo(markersLayerRef.current!);

      const popup = L.popup({
        maxWidth: 280,
        minWidth: 220,
        className: 'v2a-popup',
        closeButton: true,
        autoPan: true,
      }).setContent(buildPopupHTML(issue));

      marker.bindPopup(popup);

      marker.on('click', () => {
        onIssueClick?.(issue);
      });
    }
  }, [issues, onIssueClick]);

  // ─── Rebuild heatmap layer ─────────────────────────────────────────────
  const rebuildHeatmap = useCallback((map: L.Map) => {
    if (heatmapLayerRef.current) {
      map.removeLayer(heatmapLayerRef.current);
      heatmapLayerRef.current = null;
    }

    if (!showHeatmap) return;

    heatmapLayerRef.current = buildHeatmapLayer(issues);
    heatmapLayerRef.current.addTo(map);
  }, [issues, showHeatmap]);

  // ─── Mount map once ────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const center = getCenter();

    const map = L.map(containerRef.current, {
      center,
      zoom: issues.length > 0 ? 13 : 12,
      zoomControl: true,
      attributionControl: true,
      // slightly smoother zoom for polished feel
      zoomAnimation: true,
      markerZoomAnimation: true,
    });

    // ── OpenStreetMap tile layer ───────────────────────────────────────
    // Primary OSM endpoint — no API key, attribution required
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
      // slightly increases tile timeout for slow connections
      keepBuffer: 4,
    }).addTo(map);

    mapRef.current = map;

    rebuildMarkers(map);
    rebuildHeatmap(map);

    return () => {
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
      heatmapLayerRef.current = null;
    };
    // only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Update markers when issues list changes ───────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    rebuildMarkers(mapRef.current);
    rebuildHeatmap(mapRef.current);
  }, [issues, rebuildMarkers, rebuildHeatmap]);

  // ─── Toggle heatmap independently ─────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    rebuildHeatmap(mapRef.current);
  }, [showHeatmap, rebuildHeatmap]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: '300px' }}
    />
  );
}