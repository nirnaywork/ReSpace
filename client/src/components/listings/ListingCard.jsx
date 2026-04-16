import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Wifi, Zap, Car, Thermometer, Shield, BookOpen, Bookmark, BadgeCheck, CheckCircle } from 'lucide-react';
import { formatPriceWithUnit } from '../../utils/formatPrice';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/api';
import Badge from '../ui/Badge';

const AMENITY_ICONS = {
  WiFi: <Wifi className="w-3.5 h-3.5" />,
  'Power Backup': <Zap className="w-3.5 h-3.5" />,
  Parking: <Car className="w-3.5 h-3.5" />,
  AC: <Thermometer className="w-3.5 h-3.5" />,
  CCTV: <Shield className="w-3.5 h-3.5" />,
};

const ListingCard = ({ listing, compact = false, aiMatch = false, aiReasoning = '' }) => {
  const { user, userProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [imgSrc, setImgSrc] = useState(listing.images?.[0] || null);
  const [saved, setSaved] = useState(
    userProfile?.savedListings?.some(
      (id) => id === listing._id || id?._id === listing._id
    ) || false
  );
  const [saving, setSaving] = useState(false);

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate('/auth'); return; }
    setSaving(true);
    try {
      // Toggle save in user profile
      const savedIds = userProfile?.savedListings?.map((l) => l._id || l) || [];
      const isSaved = savedIds.includes(listing._id);
      await api.put('/api/auth/me', {
        savedListings: isSaved
          ? savedIds.filter((id) => id !== listing._id)
          : [...savedIds, listing._id],
      });
      setSaved(!isSaved);
      await refreshProfile();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const priceLabel = formatPriceWithUnit(listing.price?.amount, listing.price?.type);

  const visibleAmenities = (listing.amenities || []).slice(0, 4);
  const extraAmenities = (listing.amenities || []).length - 4;

  const typeColors = {
    'Warehouse': 'bg-amber-100 text-amber-800',
    'Kitchen': 'bg-teal-100 text-teal-800',
    'Event Hall': 'bg-blue-100 text-blue-800',
    'Office Space': 'bg-purple-100 text-purple-800',
    'Parking Space': 'bg-gray-100 text-gray-700',
    'Other': 'bg-pink-100 text-pink-800',
  };

  return (
    <div className={`card card-hover overflow-hidden relative flex flex-col ${aiMatch ? 'ring-2 ring-brand-red' : ''}`}>
      {/* AI Match Ribbon */}
      {aiMatch && (
        <div className="absolute top-3 left-0 bg-brand-red text-white text-xs font-bold px-3 py-1 z-10 rounded-r-full shadow-md">
          🤖 AI Match
        </div>
      )}

      {/* Image */}
      <div className="relative overflow-hidden" style={{ paddingBottom: '56.25%' }}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={listing.propertyName}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
            onError={() => setImgSrc(null)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-gray-400" />
          </div>
        )}

        {/* Type badge */}
        <span className={`absolute top-2.5 left-2.5 text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[listing.propertyType] || 'bg-gray-100 text-gray-700'}`}>
          {listing.propertyType}
        </span>

        {/* Bookmark */}
        <button
          onClick={handleBookmark}
          disabled={saving}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
            saved ? 'bg-brand-red text-white' : 'bg-white text-brand-muted hover:text-brand-red'
          }`}
          aria-label={saved ? 'Remove from saved' : 'Save listing'}
        >
          <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        {/* Name + Verified */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-brand-dark line-clamp-2 text-base leading-snug flex-1">
            {listing.propertyName}
          </h3>
          {listing.ownerId?.isVerified || listing.isVerified ? (
            <span className="badge-verified flex-shrink-0">
              <CheckCircle className="w-3 h-3" /> Verified
            </span>
          ) : null}
        </div>

        {/* Location */}
        <p className="flex items-center gap-1 text-xs text-brand-muted">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{listing.location?.city || listing.location?.address}</span>
        </p>

        {/* Rating */}
        {listing.reviewCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-amber-600">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold">{listing.avgRating?.toFixed(1)}</span>
            <span className="text-brand-muted">({listing.reviewCount} reviews)</span>
          </div>
        )}

        {/* Amenities */}
        {visibleAmenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {visibleAmenities.map((a) => (
              <span key={a} className="flex items-center gap-1 text-xs bg-gray-50 border border-brand-border px-2 py-0.5 rounded-full text-brand-muted">
                {AMENITY_ICONS[a]}
                {a}
              </span>
            ))}
            {extraAmenities > 0 && (
              <span className="text-xs text-brand-muted bg-gray-50 border border-brand-border px-2 py-0.5 rounded-full">
                +{extraAmenities}
              </span>
            )}
          </div>
        )}

        {/* Price + Refund */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-brand-border">
          <span className="price-display text-lg">
            {priceLabel}
          </span>
          {listing.refundPolicy ? (
            <span className="badge-refund text-xs">Refundable</span>
          ) : (
            <span className="badge-no-refund text-xs">Non-refund</span>
          )}
        </div>

        {/* AI reasoning tooltip */}
        {aiMatch && aiReasoning && (
          <p className="text-xs text-brand-red italic border-l-2 border-brand-red pl-2 mt-1">
            {aiReasoning}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-2">
          <Link
            to={`/listings/${listing._id}`}
            className="btn-secondary text-sm py-1.5 px-3 min-h-0 flex-1 justify-center"
          >
            View Details
          </Link>
          <Link
            to={`/listings/${listing._id}#book`}
            className="btn-primary text-sm py-1.5 px-3 min-h-0 flex-1 justify-center"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
