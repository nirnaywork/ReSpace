import React from 'react';
import { PROPERTY_TYPES, AMENITIES, SORT_OPTIONS } from '../../utils/constants';
import { SlidersHorizontal, X } from 'lucide-react';

const ListingFilters = ({ filters, onChange, onClear }) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value, page: 1 });
  };

  const toggleAmenity = (amenity) => {
    const current = filters.amenities ? filters.amenities.split(',').filter(Boolean) : [];
    const updated = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];
    handleChange('amenities', updated.join(','));
  };

  const hasActiveFilters = filters.type || filters.minPrice || filters.maxPrice ||
    filters.amenities || filters.available;

  return (
    <div className="card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-brand-dark flex items-center gap-2 text-sm">
          <SlidersHorizontal className="w-4 h-4 text-brand-red" />
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="text-xs text-brand-red hover:underline flex items-center gap-1"
            aria-label="Clear all filters"
          >
            <X className="w-3 h-3" /> Clear All
          </button>
        )}
      </div>

      {/* Property Type */}
      <div>
        <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2.5">
          Property Type
        </label>
        <div className="flex flex-wrap gap-2">
          {['All', ...PROPERTY_TYPES].map((type) => (
            <button
              key={type}
              onClick={() => handleChange('type', type === 'All' ? '' : type)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                (type === 'All' && !filters.type) || filters.type === type
                  ? 'bg-brand-red text-white border-brand-red'
                  : 'border-brand-border text-brand-muted hover:border-brand-red hover:text-brand-red bg-white'
              }`}
              aria-pressed={(type === 'All' && !filters.type) || filters.type === type}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2.5">
          Price Range (₹/unit)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => handleChange('minPrice', e.target.value)}
            className="input-field text-xs h-9 w-full"
            min={0}
            aria-label="Minimum price"
          />
          <span className="text-brand-muted text-xs font-medium">to</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
            className="input-field text-xs h-9 w-full"
            min={0}
            aria-label="Maximum price"
          />
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2.5">
          Amenities
        </label>
        <div className="flex flex-wrap gap-2">
          {['WiFi', 'AC', 'Parking', 'Power Backup', 'CCTV'].map((amenity) => {
            const activeAmenities = filters.amenities ? filters.amenities.split(',').filter(Boolean) : [];
            const isActive = activeAmenities.includes(amenity);
            return (
              <button
                key={amenity}
                onClick={() => toggleAmenity(amenity)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                  isActive
                    ? 'bg-brand-red text-white border-brand-red'
                    : 'border-brand-border text-brand-muted hover:border-brand-red hover:text-brand-red bg-white'
                }`}
                aria-pressed={isActive}
              >
                {amenity}
              </button>
            );
          })}
        </div>
      </div>

      {/* Available Date */}
      <div>
        <label htmlFor="available-date" className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2.5">
          Available On
        </label>
        <input
          id="available-date"
          type="date"
          value={filters.available || ''}
          onChange={(e) => handleChange('available', e.target.value)}
          className="input-field text-xs h-9"
          min={new Date().toISOString().split('T')[0]}
        />
      </div>
    </div>
  );
};

export default ListingFilters;
