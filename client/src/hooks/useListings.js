import { useState, useCallback } from 'react';
import api from '../utils/api';
import FALLBACK_LISTINGS from '../data/fallbackListings';

// ─── Client-side filtering on fallback data ───────────────────────────────────
const applyFilters = (listings, filters) => {
  let result = [...listings];

  if (filters.type) {
    result = result.filter((l) => l.propertyType === filters.type);
  }
  if (filters.city) {
    result = result.filter((l) =>
      l.location?.city?.toLowerCase().includes(filters.city.toLowerCase())
    );
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (l) =>
        l.propertyName?.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q) ||
        l.location?.address?.toLowerCase().includes(q) ||
        l.location?.city?.toLowerCase().includes(q)
    );
  }
  if (filters.minPrice) {
    result = result.filter((l) => l.price?.amount >= Number(filters.minPrice));
  }
  if (filters.maxPrice) {
    result = result.filter((l) => l.price?.amount <= Number(filters.maxPrice));
  }
  if (filters.amenities) {
    const needed = filters.amenities.split(',').map((a) => a.trim());
    result = result.filter((l) => needed.every((a) => l.amenities?.includes(a)));
  }

  // Sort
  if (filters.sort === 'price_asc') {
    result.sort((a, b) => a.price?.amount - b.price?.amount);
  } else if (filters.sort === 'price_desc') {
    result.sort((a, b) => b.price?.amount - a.price?.amount);
  } else if (filters.sort === 'rating') {
    result.sort((a, b) => b.avgRating - a.avgRating);
  } else if (filters.sort === 'popular') {
    result.sort((a, b) => b.totalBookings - a.totalBookings);
  }
  // default: newest — keep original order

  return result;
};

const paginate = (arr, page = 1, limit = 12) => {
  const total = arr.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pageNum = Math.max(1, Math.min(page, totalPages));
  const start = (pageNum - 1) * limit;
  return {
    items: arr.slice(start, start + limit),
    total,
    page: pageNum,
    totalPages,
  };
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  const fetchListings = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    // ── 1. Try real API ────────────────────────────────────────────────────────
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '') params.append(k, v);
      });

      const res = await api.get(`/api/listings?${params.toString()}`);

      if (res.data.success) {
        const d = res.data.data;
        setListings(d.listings);
        setPagination({ total: d.total, page: d.page, totalPages: d.totalPages });
        setUsingFallback(false);
        setLoading(false);
        return;
      }
    } catch (_) {
      // API unreachable or failed — fall through to static data
    }

    // ── 2. Fallback to static data ─────────────────────────────────────────────
    try {
      const filtered = applyFilters(FALLBACK_LISTINGS, filters);
      const limit = Number(filters.limit) || 12;
      const { items, total, page, totalPages } = paginate(filtered, Number(filters.page) || 1, limit);
      setListings(items);
      setPagination({ total, page, totalPages });
      setUsingFallback(true);
    } catch (fallbackErr) {
      setError('Unable to load listings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchListing = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    // ── 1. Try API ─────────────────────────────────────────────────────────────
    try {
      const res = await api.get(`/api/listings/${id}`);
      if (res.data.success) {
        setLoading(false);
        return res.data.data;
      }
    } catch (_) {
      // fall through
    }

    // ── 2. Look up in fallback data ────────────────────────────────────────────
    const found = FALLBACK_LISTINGS.find((l) => l._id === id);
    setLoading(false);
    if (found) {
      return {
        listing: found,
        reviews: [],
        starBreakdown: {},
        similar: FALLBACK_LISTINGS.filter(
          (l) => l._id !== id && l.propertyType === found.propertyType
        ).slice(0, 3),
      };
    }

    setError('Listing not found.');
    return null;
  }, []);

  return {
    listings,
    loading,
    error,
    usingFallback,
    pagination,
    fetchListings,
    fetchListing,
    setListings,
  };
};
