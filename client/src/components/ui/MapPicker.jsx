import React, { useState } from 'react';
import { MapPin } from 'lucide-react';

// Simple Map Picker using Google Maps embed when API key is available
// Falls back to a styled placeholder with location input
const MapPicker = ({
  lat,
  lng,
  onLocationSelect,
  address,
  className = '',
}) => {
  const hasApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY &&
    !import.meta.env.VITE_GOOGLE_MAPS_API_KEY.includes('your_');

  if (!hasApiKey) {
    return (
      <div className={`rounded-xl overflow-hidden border border-brand-border ${className}`}>
        <div className="bg-gray-100 h-48 flex flex-col items-center justify-center gap-3">
          <MapPin className="w-8 h-8 text-brand-muted" />
          <div className="text-center">
            <p className="text-sm font-medium text-brand-dark">Map View</p>
            <p className="text-xs text-brand-muted mt-1">
              {address || 'Enter address above to set location'}
            </p>
            {lat && lng && (
              <p className="text-xs font-mono text-brand-red mt-1">
                {lat.toFixed(4)}, {lng.toFixed(4)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl overflow-hidden border border-brand-border ${className}`}>
      <iframe
        title="Location Map"
        src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(address || 'India')}&zoom=14`}
        className="w-full h-48 border-0"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
};

export default MapPicker;
