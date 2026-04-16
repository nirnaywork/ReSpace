import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import SearchBar from '../components/listings/SearchBar';
import ListingFilters from '../components/listings/ListingFilters';
import ListingGrid from '../components/listings/ListingGrid';
import SortDropdown from '../components/listings/SortDropdown';
import SmartMatchBox from '../components/ai/SmartMatchBox';
import Button from '../components/ui/Button';
import { useListings } from '../hooks/useListings';
import { ChevronLeft, ChevronRight, WifiOff, X, SlidersHorizontal } from 'lucide-react';

const Listings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { listings, loading, error, usingFallback, pagination, fetchListings } = useListings();
  const [showFilters, setShowFilters] = useState(false);
  const [aiMatchedIds, setAiMatchedIds] = useState([]);

  const getFilters = useCallback(() => ({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    type: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    amenities: searchParams.get('amenities') || '',
    available: searchParams.get('available') || '',
    sort: searchParams.get('sort') || 'newest',
    page: Number(searchParams.get('page')) || 1,
    limit: 12,
  }), [searchParams]);

  useEffect(() => {
    const filters = getFilters();
    fetchListings(filters);
  }, [searchParams, fetchListings]);

  const updateFilters = (newFilters) => {
    const params = {};
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '' && v !== 0) params[k] = String(v);
    });
    setSearchParams(params, { replace: true });
  };

  const handleSearch = ({ search, city }) => {
    updateFilters({ ...getFilters(), search, city, page: 1 });
  };

  const handleFiltersChange = (newFilters) => {
    updateFilters({ ...newFilters, page: 1 });
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  const handleSortChange = (sort) => {
    updateFilters({ ...getFilters(), sort, page: 1 });
  };

  const handlePageChange = (page) => {
    updateFilters({ ...getFilters(), page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentFilters = getFilters();
  const hasActiveFilters = currentFilters.type || currentFilters.minPrice || currentFilters.maxPrice ||
    currentFilters.amenities || currentFilters.available || currentFilters.search;

  // Pagination component
  const Pagination = () => {
    if (pagination.totalPages <= 1) return null;
    const pages = Array.from({ length: Math.min(7, pagination.totalPages) }, (_, i) => i + 1);

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page <= 1}
          className="p-2 rounded-lg border border-brand-border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => handlePageChange(p)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
              p === pagination.page ? 'bg-brand-red text-white' : 'border border-brand-border hover:bg-gray-50 text-brand-dark'
            }`}
            aria-label={`Page ${p}`}
            aria-current={p === pagination.page ? 'page' : undefined}
          >
            {p}
          </button>
        ))}

        {pagination.totalPages > 7 && pagination.page < pagination.totalPages - 3 && (
          <>
            <span className="text-brand-muted">…</span>
            <button
              onClick={() => handlePageChange(pagination.totalPages)}
              className="w-9 h-9 rounded-lg text-sm font-medium border border-brand-border hover:bg-gray-50"
            >
              {pagination.totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages}
          className="p-2 rounded-lg border border-brand-border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Find Spaces – ReSpace</title>
        <meta name="description" content="Browse verified warehouses, kitchens, event halls, and office spaces across India. Filter by type, price, amenities, and availability." />
      </Helmet>

      <div className="bg-brand-cream min-h-screen">
        {/* Header */}
        <div className="bg-brand-dark py-10">
          <div className="page-container">
            <h1 className="text-white text-3xl font-bold mb-2">Find Your Space</h1>
            <p className="text-gray-400 text-sm mb-6">
              {pagination.total > 0 ? `${pagination.total} spaces available` : 'Searching...'}
            </p>
            <SearchBar
              onSearch={handleSearch}
              initialValue={currentFilters.search}
              initialCity={currentFilters.city}
            />
          </div>
        </div>

        <div className="page-container py-8">
          {/* AI Smart Match */}
          <div className="mb-6">
            <SmartMatchBox onMatchResults={setAiMatchedIds} />
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Filters (Desktop) */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <ListingFilters
                  filters={currentFilters}
                  onChange={handleFiltersChange}
                  onClear={handleClearFilters}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Results bar */}
              <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  {/* Mobile filter toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden btn-secondary text-sm py-2 px-3 min-h-0"
                    aria-expanded={showFilters}
                    aria-label="Toggle filters"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                    {hasActiveFilters && <span className="bg-brand-red text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">!</span>}
                  </button>

                  <p className="text-sm text-brand-muted">
                    {loading ? 'Loading...' : (
                      <>
                        Showing <span className="font-semibold text-brand-dark">{listings.length}</span> of{' '}
                        <span className="font-semibold text-brand-dark">{pagination.total}</span> spaces
                        {currentFilters.city ? ` in ${currentFilters.city}` : ''}
                      </>
                    )}
                  </p>
                </div>

                <SortDropdown value={currentFilters.sort} onChange={handleSortChange} />
              </div>

              {/* Mobile Filters */}
              {showFilters && (
                <div className="lg:hidden mb-4 animate-slide-up">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-brand-dark">Filters</h3>
                    <button onClick={() => setShowFilters(false)} aria-label="Close filters">
                      <X className="w-4 h-4 text-brand-muted" />
                    </button>
                  </div>
                  <ListingFilters
                    filters={currentFilters}
                    onChange={handleFiltersChange}
                    onClear={handleClearFilters}
                  />
                </div>
              )}

              {/* Active filter pills */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.entries({
                    type: currentFilters.type,
                    search: currentFilters.search,
                    city: currentFilters.city,
                    ...(currentFilters.minPrice && { 'min ₹': currentFilters.minPrice }),
                    ...(currentFilters.maxPrice && { 'max ₹': currentFilters.maxPrice }),
                  }).filter(([, v]) => v).map(([key, val]) => (
                    <span key={key} className="flex items-center gap-1.5 bg-red-50 border border-brand-red/20 text-brand-red text-xs px-3 py-1.5 rounded-full font-medium">
                      {key}: {val}
                      <button onClick={() => updateFilters({ ...currentFilters, [key.replace(' ₹', 'Price')]: '', page: 1 })} aria-label={`Remove ${key} filter`}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <button onClick={handleClearFilters} className="text-xs text-brand-muted hover:text-brand-error">Clear all</button>
                </div>
              )}

              {/* Offline / Fallback banner */}
              {usingFallback && !loading && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs px-4 py-2.5 rounded-xl mb-4">
                  <WifiOff className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Showing cached listings — live search &amp; filters still work. Start the backend server for real-time data.</span>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-brand-error/20 rounded-xl p-4 mb-4 text-sm text-brand-error">
                  {error}
                </div>
              )}

              {/* Listing Grid */}
              <ListingGrid
                listings={listings}
                loading={loading}
                aiMatchedIds={aiMatchedIds}
                emptyMessage="No spaces found. Try clearing some filters."
                emptyAction={
                  <Button variant="primary" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                }
              />

              {/* Pagination */}
              <Pagination />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Listings;
