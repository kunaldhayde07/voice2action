interface ReverseGeocodeResult {
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
}

export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult> => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Voice2Action/1.0 (civic-tech-platform)',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json() as {
      display_name?: string;
      address?: {
        city?: string;
        town?: string;
        village?: string;
        county?: string;
        state?: string;
        country?: string;
        postcode?: string;
      };
    };

    const addr = data.address || {};

    return {
      address: data.display_name || `${latitude}, ${longitude}`,
      city: addr.city || addr.town || addr.village || addr.county,
      state: addr.state,
      country: addr.country,
      postcode: addr.postcode,
    };
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return {
      address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
    };
  }
};