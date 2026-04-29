import { useState, useCallback } from "react";

interface GeolocationState {
  lat: number | null;
  lng: number | null;
  address: string;
  loading: boolean;
  error: string | null;
  accuracy: number | null;
}

async function reverseGeocodeNominatim(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "User-Agent": "Voice2Action-CivicPlatform/1.0", "Accept-Language": "en" } }
    );
    if (!res.ok) return "";
    const data = await res.json();
    return data.display_name || "";
  } catch {
    return "";
  }
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    lat: null, lng: null, address: "", loading: false, error: null, accuracy: null,
  });

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({ ...prev, error: "Geolocation is not supported by your browser" }));
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setState((prev) => ({ ...prev, lat: latitude, lng: longitude, accuracy, loading: false }));
        const address = await reverseGeocodeNominatim(latitude, longitude);
        if (address) setState((prev) => ({ ...prev, address }));
      },
      (err) => {
        const messages: Record<number, string> = {
          1: "Location permission denied.",
          2: "Location unavailable.",
          3: "Location request timed out.",
        };
        setState((prev) => ({ ...prev, loading: false, error: messages[err.code] || "Unable to get location" }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  return { ...state, getLocation };
}
