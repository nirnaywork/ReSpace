import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Wifi, Zap, Car, Thermometer, Shield, Bookmark, CheckCircle } from 'lucide-react';
import { formatPriceWithUnit } from '../../utils/formatPrice';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/api';

const AMENITY_ICONS = {
  WiFi: <Wifi className="w-3.5 h-3.5" />,
  'Power Backup': <Zap className="w-3.5 h-3.5" />,
  Parking: <Car className="w-3.5 h-3.5" />,
  AC: <Thermometer className="w-3.5 h-3.5" />,
  CCTV: <Shield className="w-3.5 h-3.5" />,
};

const ListingCard = ({ listing }) => {
  const { user, userProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
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
    'Warehouse':     'bg-amber-900/40 text-amber-300',
    'Kitchen':       'bg-teal-900/40 text-teal-300',
    'Event Hall':    'bg-violet-900/40 text-violet-300',
    'Office Space':  'bg-stone-700/50 text-stone-300',
    'Parking Space': 'bg-zinc-700/50 text-zinc-300',
    'Other':         'bg-rose-900/40 text-rose-300',
  };

  return (
    <div className="card card-hover flex flex-col md:flex-row p-5 gap-4 md:items-center">
      
      {/* Property Basics (Left) */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${typeColors[listing.propertyType] || 'bg-stone-800 text-stone-300'}`}>
            {listing.propertyType}
          </span>
          {listing.ownerId?.isVerified || listing.isVerified ? (
            <span className="bg-green-900/40 text-green-300 text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Verified
            </span>
          ) : null}
        </div>
        
        <h3 className="font-bold text-brand-dark text-lg mb-1 leading-snug">
          {listing.propertyName}
        </h3>
        
        <p className="flex items-center gap-1.5 text-sm text-brand-muted mb-2">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{listing.location?.address}, {listing.location?.city}</span>
        </p>

        {/* Desktop Amenities */}
        {visibleAmenities.length > 0 && (
          <div className="hidden md:flex flex-wrap gap-1.5 mt-2">
            {visibleAmenities.map((a) => (
              <span key={a} className="flex items-center gap-1 text-xs bg-brand-border border border-brand-border/50 px-2 py-0.5 rounded-full text-brand-muted">
                {AMENITY_ICONS[a]} {a}
              </span>
            ))}
            {extraAmenities > 0 && (
              <span className="text-xs text-brand-muted bg-gray-50 border border-brand-border px-2 py-0.5 rounded-full">
                +{extraAmenities}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Center column Context */}
      <div className="hidden md:flex flex-col justify-center px-4 border-x border-brand-border min-w-[150px]">
        {listing.reviewCount > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-amber-600 mb-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-bold">{listing.avgRating?.toFixed(1)}</span>
            <span className="text-brand-muted">({listing.reviewCount})</span>
          </div>
        )}
        <div className="text-xs text-brand-muted mt-1">
          {listing.refundPolicy ? (
            <span className="text-brand-success font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Refundable
            </span>
          ) : (
            <span className="text-brand-error/70 font-medium whitespace-nowrap">Non-refundable</span>
          )}
        </div>
      </div>

      {/* Mobile Context row */}
      <div className="md:hidden flex items-center justify-between border-t border-brand-border pt-3">
        {listing.reviewCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-amber-600">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold">{listing.avgRating?.toFixed(1)}</span>
            <span className="text-brand-muted">({listing.reviewCount})</span>
          </div>
        )}
         {listing.refundPolicy ? (
            <span className="text-brand-success text-xs font-medium">Refundable</span>
          ) : (
            <span className="text-brand-error/70 text-xs font-medium">Non-refundable</span>
        )}
      </div>

      {/* Pricing & Actions (Right) */}
      <div className="flex md:flex-col items-center justify-between md:items-end gap-3 md:min-w-[140px]">
        
        <div className="text-left md:text-right">
          <span className="price-display text-xl md:text-2xl">
            {priceLabel}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleBookmark}
            disabled={saving}
            className={`w-10 h-10 rounded-xl border border-brand-border flex items-center justify-center transition-all ${
              saved ? 'bg-brand-red border-brand-red text-white' : 'bg-brand-card text-brand-muted hover:text-brand-red hover:bg-brand-border'
            }`}
            aria-label={saved ? 'Remove from saved' : 'Save listing'}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          </button>
          
          <Link
            to={`/listings/${listing._id}`}
            className="btn-primary text-sm py-2 px-4 shadow-md hover:shadow-lg"
          >
            View Space
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
