'use client';

import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Issue } from '@/types';
import {
  getMarkerColor,
  getStatusConfig,
  getCategoryIcon,
  timeAgo,
  truncate,
} from '@/lib/utils';
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  DEFAULT_LOCATION_ZOOM,
  ROUTES,
} from '@/lib/constants';

// Fix Leaflet default icon issue with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface CivicMapProps {
  issues: Issue[];
  userLocation: { lat: number; lng: number } | null;
  onIssueClick?: (issue: Issue) => void;
  height?: string;
  zoom?: number;
  center?: [number, number];
}

// Create custom colored marker
function createCustomMarker(color: string, status: string): L.DivIcon {
  const pulseClass = status === 'pending' ? 'animate-pulse' : '';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: transform 0.2s;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -36],
  });
}

// Create user location marker
function createUserMarker(): L.DivIcon {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background: #3B82F6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 0 4px rgba(59,130,246,0.3), 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

export default function CivicMap({
  issues,
  userLocation,
  onIssueClick,
  height = '100%',
  zoom = DEFAULT_MAP_ZOOM,
  center = DEFAULT_MAP_CENTER,
}: CivicMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: false,
      attributionControl: true,
    });

    // OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Custom zoom control position
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Markers layer group
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when issues change
  useEffect(() => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    issues.forEach((issue) => {
      const [lng, lat] = issue.location.coordinates;
      if (!lat || !lng) return;

      const color = getMarkerColor(issue.status);
      const marker = L.marker([lat, lng], {
        icon: createCustomMarker(color, issue.status),
      });

      const categoryIcon = getCategoryIcon(issue.category);
      const statusCfg = getStatusConfig(issue.status);

      // Popup content
      const popupContent = `
        <div style="min-width: 220px; font-family: Inter, sans-serif;">
          <div style="padding: 12px; border-bottom: 1px solid #f3f4f6;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <span style="font-size: 18px;">${categoryIcon}</span>
              <span style="
                font-size: 11px; font-weight: 600;
                padding: 2px 8px; border-radius: 99px;
                background: ${statusCfg.color.includes('green') ? '#d1fae5' : statusCfg.color.includes('blue') ? '#dbeafe' : statusCfg.color.includes('yellow') ? '#fef3c7' : statusCfg.color.includes('red') ? '#fee2e2' : '#f3f4f6'};
                color: ${statusCfg.color.includes('green') ? '#065f46' : statusCfg.color.includes('blue') ? '#1e40af' : statusCfg.color.includes('yellow') ? '#92400e' : statusCfg.color.includes('red') ? '#991b1b' : '#374151'};
              ">
                ${statusCfg.label}
              </span>
            </div>
            <h3 style="font-size: 14px; font-weight: 700; color: #111827; margin: 0 0 4px 0; line-height: 1.3;">
              ${truncate(issue.title, 50)}
            </h3>
            <p style="font-size: 12px; color: #6b7280; margin: 0 0 4px 0;">
              ${issue.category}
            </p>
            <p style="font-size: 11px; color: #9ca3af; margin: 0;">
              📍 ${truncate(issue.address, 40)}
            </p>
          </div>
          <div style="padding: 10px 12px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; gap: 12px; font-size: 12px; color: #6b7280;">
              <span>👍 ${issue.votesCount}</span>
              <span>💬 ${issue.commentsCount}</span>
              <span>🕐 ${timeAgo(issue.createdAt)}</span>
            </div>
            <a
              href="${ROUTES.ISSUES}/${issue._id}"
              style="
                font-size: 11px; font-weight: 600; color: #2563eb;
                text-decoration: none;
                padding: 4px 10px; border-radius: 8px;
                background: #eff6ff;
              "
            >
              View →
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 280,
        className: 'civic-popup',
      });

      marker.on('click', () => {
        onIssueClick?.(issue);
      });

      markersLayer.addLayer(marker);
    });
  }, [issues, onIssueClick]);

  // Update user location marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userLocation) {
      const userMarker = L.marker(
        [userLocation.lat, userLocation.lng],
        { icon: createUserMarker() }
      )
        .addTo(map)
        .bindPopup('<div style="padding:8px;font-weight:600;font-size:13px;">📍 Your Location</div>');

      userMarkerRef.current = userMarker;

      map.flyTo(
        [userLocation.lat, userLocation.lng],
        DEFAULT_LOCATION_ZOOM,
        { duration: 1.5 }
      );
    }
  }, [userLocation]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: '100%' }}
      className="z-0"
    />
  );
}