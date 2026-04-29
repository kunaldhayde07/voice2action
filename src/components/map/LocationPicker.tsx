'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useGeolocation } from '@/hooks/useGeolocation';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

// ─── Nominatim reverse geocode (same helper as hook, local to avoid import cycle)
async function fetchAddress(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: {
          'User-Agent': 'Voice2Action-CivicPlatform/1.0',
          'Accept-Language': 'en',
        },
      }
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

// ─── The actual map — dynamic import prevents SSR issues with Leaflet
const LeafletPicker = dynamic(() => import('./LeafletPickerInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 rounded-xl bg-slate-100 animate-pulse flex items-center justify-center">
      <p className="text-sm text-slate-400">Loading map...</p>
    </div>
  ),
});

interface LocationPickerProps {
  onLocationChange: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
  className?: string;
}

export default function LocationPicker({
  onLocationChange,
  initialLat,
  initialLng,
  className,
}: LocationPickerProps) {
  const [currentLat, setCurrentLat] = useState<number>(initialLat || 51.505);
  const [currentLng, setCurrentLng] = useState<number>(initialLng || -0.09);
  const [currentAddress, setCurrentAddress] = useState('');
  const [isPinSet, setIsPinSet] = useState(false);

  const { lat: geoLat, lng: geoLng, loading: geoLoading, error: geoError, getLocation } = useGeolocation();

  // when geolocation resolves, move the map
  useEffect(() => {
    if (geoLat && geoLng) {
      setCurrentLat(geoLat);
      setCurrentLng(geoLng);
      setIsPinSet(true);

      fetchAddress(geoLat, geoLng).then((addr) => {
        setCurrentAddress(addr);
        onLocationChange(geoLat, geoLng, addr);
      });
    }
  }, [geoLat, geoLng]);

  const handleMapClick = async (lat: number, lng: number) => {
    setCurrentLat(lat);
    setCurrentLng(lng);
    setIsPinSet(true);

    const addr = await fetchAddress(lat, lng);
    setCurrentAddress(addr);
    onLocationChange(lat, lng, addr);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* toolbar */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          loading={geoLoading}
          onClick={getLocation}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        >
          Use My Location
        </Button>

        {currentAddress && (
          <span className="text-xs text-slate-500 truncate flex-1 ml-1">
            📍 {currentAddress}
          </span>
        )}
      </div>

      {/* geolocation error */}
      {geoError && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {geoError}
        </p>
      )}

      {/* map */}
      <div className="w-full h-64 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <LeafletPicker
          lat={currentLat}
          lng={currentLng}
          isPinSet={isPinSet}
          onMapClick={handleMapClick}
        />
      </div>

      {/* hint */}
      <p className="text-xs text-slate-400">
        Click anywhere on the map to pin the exact location, or drag the marker after placing it.
      </p>

      {/* coordinates display */}
      {isPinSet && (
        <div className="flex items-center gap-4 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
          <span>Lat: <strong className="text-slate-700">{currentLat.toFixed(6)}</strong></span>
          <span>Lng: <strong className="text-slate-700">{currentLng.toFixed(6)}</strong></span>
        </div>
      )}
    </div>
  );
}