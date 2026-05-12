'use client';

import { useState, useCallback } from 'react';
import { issuesApi } from '@/lib/api';
import { GeocodeResult } from '@/types';
import toast from 'react-hot-toast';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  address: string;
  city: string;
  isDetecting: boolean;
  error: string | null;
  hasLocation: boolean;
}

interface UseGeolocationReturn extends GeolocationState {
  detectLocation: () => Promise<void>;
  clearLocation: () => void;
  setManualLocation: (lat: number, lng: number, address: string) => void;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    address: '',
    city: '',
    isDetecting: false,
    error: null,
    hasLocation: false,
  });

  const detectLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      const errMsg = 'Geolocation is not supported by your browser';
      setState((prev) => ({ ...prev, error: errMsg }));
      toast.error(errMsg);
      return;
    }

    setState((prev) => ({ ...prev, isDetecting: true, error: null }));

    const toastId = toast.loading('Detecting your location...', {
      icon: '📍',
    });

    try {
      // Get coordinates from browser
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000,
          });
        }
      );

      const { latitude, longitude } = position.coords;

      // Reverse geocode using our backend (which calls OpenStreetMap)
      let geocodeResult: GeocodeResult = {
        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        city: '',
      };

      try {
        const response = await issuesApi.reverseGeocode({
          lat: latitude,
          lng: longitude,
        });
        geocodeResult = response.data.data as GeocodeResult;
      } catch {
        // Use coordinate string as fallback
      }

      setState({
        latitude,
        longitude,
        address: geocodeResult.address,
        city: geocodeResult.city || '',
        isDetecting: false,
        error: null,
        hasLocation: true,
      });

      toast.success('Location detected successfully! 📍', { id: toastId });
    } catch (err: unknown) {
      let errorMessage = 'Failed to detect location';

      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case GeolocationPositionError.PERMISSION_DENIED:
            errorMessage =
              'Location permission denied. Please allow location access.';
            break;
          case GeolocationPositionError.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case GeolocationPositionError.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
        }
      }

      setState((prev) => ({
        ...prev,
        isDetecting: false,
        error: errorMessage,
      }));

      toast.error(errorMessage, { id: toastId });
    }
  }, []);

  const clearLocation = useCallback(() => {
    setState({
      latitude: null,
      longitude: null,
      address: '',
      city: '',
      isDetecting: false,
      error: null,
      hasLocation: false,
    });
  }, []);

  const setManualLocation = useCallback(
    (lat: number, lng: number, address: string) => {
      setState({
        latitude: lat,
        longitude: lng,
        address,
        city: '',
        isDetecting: false,
        error: null,
        hasLocation: true,
      });
    },
    []
  );

  return {
    ...state,
    detectLocation,
    clearLocation,
    setManualLocation,
  };
};