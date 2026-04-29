'use client';

// This file is ONLY ever loaded client-side (via dynamic import in LocationPicker)
// Leaflet absolutely cannot run in SSR — this pattern is the correct Next.js solution

import { useEffect, useRef } from 'react';
import L from 'leaflet';

// Fix the broken default icon paths that webpack causes
// This is a well-known Leaflet + webpack issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LeafletPickerInnerProps {
  lat: number;
  lng: number;
  isPinSet: boolean;
  onMapClick: (lat: number, lng: number) => void;
}

export default function LeafletPickerInner({
  lat,
  lng,
  isPinSet,
  onMapClick,
}: LeafletPickerInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // initialise map
    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: true,
      attributionControl: true,
    });

    // OpenStreetMap tile layer
    // This is the standard OSM tile endpoint — free, no API key
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
      maxZoom: 19,
      // subdomains a, b, c spread load across OSM tile servers
      subdomains: ['a', 'b', 'c'],
    }).addTo(map);

    // click handler — place or move marker
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;

      if (markerRef.current) {
        markerRef.current.setLatLng([clickLat, clickLng]);
      } else {
        const marker = L.marker([clickLat, clickLng], {
          draggable: true,
        }).addTo(map);

        // dragging the marker also fires the callback
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          onMapClick(pos.lat, pos.lng);
        });

        markerRef.current = marker;
      }

      onMapClick(clickLat, clickLng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // intentionally empty deps — map init runs once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when parent updates lat/lng (e.g. geolocation), fly the map there
  useEffect(() => {
    if (!mapRef.current) return;

    mapRef.current.flyTo([lat, lng], 16, { animate: true, duration: 1 });

    if (isPinSet) {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        const marker = L.marker([lat, lng], { draggable: true }).addTo(mapRef.current);

        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          onMapClick(pos.lat, pos.lng);
        });

        markerRef.current = marker;
      }
    }
  }, [lat, lng, isPinSet]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: '256px' }}
    />
  );
}