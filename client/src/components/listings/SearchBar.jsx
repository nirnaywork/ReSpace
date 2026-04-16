import React, { useState } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { POPULAR_CITIES } from '../../utils/constants';

const SearchBar = ({ onSearch, initialValue = '', initialCity = '' }) => {
  const [search, setSearch] = useState(initialValue);
  const [city, setCity] = useState(initialCity);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ search: search.trim(), city: city.trim() });
  };

  const filteredCities = POPULAR_CITIES.filter((c) =>
    c.toLowerCase().includes(city.toLowerCase()) && city.length > 0
  );

  return (
    <form onSubmit={handleSubmit} className="relative w-full" role="search">
      <div className="flex rounded-xl overflow-hidden border border-brand-border shadow-sm bg-white focus-within:ring-2 focus-within:ring-brand-red/30 focus-within:border-brand-red transition-all">
        {/* Search input */}
        <div className="flex items-center flex-1 px-4 gap-2">
          <Search className="w-5 h-5 text-brand-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="Search warehouses, kitchens, event halls..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 h-12 bg-transparent focus:outline-none text-sm text-brand-dark placeholder:text-brand-muted"
            aria-label="Search spaces"
          />
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); onSearch({ search: '', city }); }}
              className="text-brand-muted hover:text-brand-dark"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="w-px bg-brand-border my-3" />

        {/* City input */}
        <div className="relative flex items-center px-4 gap-2 min-w-[160px]">
          <MapPin className="w-4 h-4 text-brand-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => { setCity(e.target.value); setShowCitySuggestions(true); }}
            onFocus={() => setShowCitySuggestions(true)}
            onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
            className="flex-1 h-12 bg-transparent focus:outline-none text-sm text-brand-dark placeholder:text-brand-muted w-full"
            aria-label="Filter by city"
          />
          {showCitySuggestions && filteredCities.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-brand-border rounded-lg shadow-lg z-20 py-1">
              {filteredCities.slice(0, 6).map((c) => (
                <button
                  key={c}
                  type="button"
                  onMouseDown={() => { setCity(c); setShowCitySuggestions(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-brand-dark hover:bg-gray-50 transition-colors"
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search button */}
        <button
          type="submit"
          className="btn-primary rounded-none rounded-r-xl px-6 text-sm font-semibold"
          aria-label="Search"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
