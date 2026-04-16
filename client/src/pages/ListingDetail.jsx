import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  MapPin, Star, Wifi, Zap, Car, Thermometer, Shield, ShieldCheck,
  Coffee, ArrowUpDown, User2, Phone, Mail, CheckCircle, ChevronLeft,
  ChevronRight, Share2, Heart, ExternalLink, Clock
} from 'lucide-react';
import { useListings } from '../hooks/useListings';
import { useAuth } from '../hooks/useAuth';
import BookingModal from '../components/booking/BookingModal';
import AvailabilityCalendar from '../components/booking/AvailabilityCalendar';
import TimeSlotPicker from '../components/booking/TimeSlotPicker';
import ListingCard from '../components/listings/ListingCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import MapPicker from '../components/ui/MapPicker';
import { ListingCardSkeleton } from '../components/ui/Skeleton';
import { formatPrice, formatPriceWithUnit, calcPlatformFee, calcTotal } from '../utils/formatPrice';
import { formatDate, formatMemberSince } from '../utils/formatDate';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

const AMENITY_ICONS = {
  WiFi: <Wifi className="w-4 h-4" />,
  'Power Backup': <Zap className="w-4 h-4" />,
  Parking: <Car className="w-4 h-4" />,
  AC: <Thermometer className="w-4 h-4" />,
  CCTV: <Shield className="w-4 h-4" />,
  'Security Guard': <ShieldCheck className="w-4 h-4" />,
  Cafeteria: <Coffee className="w-4 h-4" />,
  Lift: <ArrowUpDown className="w-4 h-4" />,
};

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Star key={star} className={`w-4 h-4 ${star <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
    ))}
  </div>
);

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const { fetchListing, loading } = useListings();

  const [data, setData] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    const load = async () => {
      const result = await fetchListing(id);
      if (result) {
        setData(result);
        setReviews(result.reviews || []);
        setTotalReviews(result.listing?.reviewCount || 0);
      }
    };
    load();
  }, [id]);

  const loadMoreReviews = async () => {
    setReviewsLoading(true);
    try {
      const nextPage = reviewPage + 1;
      const res = await api.get(`/api/reviews/listing/${id}?page=${nextPage}`);
      if (res.data.success) {
        setReviews((prev) => [...prev, ...res.data.data.reviews]);
        setReviewPage(nextPage);
      }
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  const hours = selectedSlot
    ? (() => {
        const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
        return (toMin(selectedSlot.end) - toMin(selectedSlot.start)) / 60;
      })()
    : 0;

  const basePrice = data?.listing
    ? (data.listing.price?.type === 'hour' ? data.listing.price.amount * hours : data.listing.price.amount)
    : 0;
  const platformFee = calcPlatformFee(basePrice);
  const totalPrice = calcTotal(basePrice);

  if (loading || !data) {
    return (
      <div className="page-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="skeleton h-96 rounded-xl" />
            <div className="skeleton h-8 w-2/3" />
            <div className="skeleton h-4 w-1/2" />
          </div>
          <div className="lg:col-span-2">
            <div className="card p-6 space-y-4">
              <div className="skeleton h-8 w-1/2" />
              <div className="skeleton h-64 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data.listing) {
    return (
      <div className="page-container py-20 text-center">
        <h2 className="text-2xl font-bold text-brand-dark mb-3">Space Not Found</h2>
        <p className="text-brand-muted mb-6">This space is no longer listed on ReSpace.</p>
        <Link to="/listings" className="btn-primary">Browse All Spaces</Link>
      </div>
    );
  }

  const { listing, starBreakdown = {}, similar = [] } = data;
  const images = listing.images?.length ? listing.images : [];
  const owner = listing.ownerId;

  const initials = (name) => name ? name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() : '?';

  return (
    <>
      <Helmet>
        <title>{listing.propertyName} – ReSpace</title>
        <meta name="description" content={listing.description?.slice(0, 150)} />
      </Helmet>

      <div className="bg-brand-cream min-h-screen py-6">
        <div className="page-container">
          {/* Back */}
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-brand-muted hover:text-brand-dark text-sm mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to listings
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* LEFT: Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Image Gallery */}
              <div className="space-y-2">
                <div className="relative rounded-xl overflow-hidden bg-gray-100" style={{ paddingBottom: '60%' }}>
                  {images[activeImage] ? (
                    <img
                      src={images[activeImage]}
                      alt={`${listing.propertyName} image ${activeImage + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="eager"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                      <p className="text-brand-muted">No image available</p>
                    </div>
                  )}

                  {images.length > 1 && (
                    <>
                      <button onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center"
                        aria-label="Previous image">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center"
                        aria-label="Next image">
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                          <button key={i} onClick={() => setActiveImage(i)}
                            className={`w-2 h-2 rounded-full transition-all ${i === activeImage ? 'bg-white' : 'bg-white/50'}`}
                            aria-label={`Image ${i + 1}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnail row */}
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.slice(0, 6).map((img, i) => (
                      <button key={i} onClick={() => setActiveImage(i)}
                        className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === activeImage ? 'border-brand-red' : 'border-transparent'}`}
                        aria-label={`View image ${i + 1}`}>
                        <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Property Header */}
              <div className="card p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge propertyType={listing.propertyType}>{listing.propertyType}</Badge>
                      {listing.isVerified && <span className="badge-verified"><CheckCircle className="w-3 h-3" /> Verified Space</span>}
                    </div>
                    <h1 className="text-2xl font-bold text-brand-dark leading-tight">{listing.propertyName}</h1>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-2 text-brand-muted">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-red" />
                  <div>
                    <p className="text-sm">{listing.location?.address}</p>
                    {listing.location?.city && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.location.address)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-xs text-brand-red hover:underline flex items-center gap-1 mt-0.5"
                      >
                        View on Google Maps <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Rating */}
                {listing.reviewCount > 0 && (
                  <div className="flex items-center gap-2">
                    <StarRating rating={listing.avgRating} />
                    <span className="text-sm font-semibold text-brand-dark">{listing.avgRating?.toFixed(1)}</span>
                    <span className="text-sm text-brand-muted">({listing.reviewCount} reviews)</span>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h2 className="text-lg font-semibold text-brand-dark mb-2">About this Space</h2>
                  <p className={`text-sm text-brand-muted leading-relaxed ${!showFullDesc ? 'line-clamp-3' : ''}`}>
                    {listing.description}
                  </p>
                  {listing.description?.length > 200 && (
                    <button onClick={() => setShowFullDesc(!showFullDesc)} className="text-xs text-brand-red hover:underline mt-1 font-medium">
                      {showFullDesc ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>
              </div>

              {/* Amenities */}
              {listing.amenities?.length > 0 && (
                <div className="card p-6">
                  <h2 className="text-lg font-semibold text-brand-dark mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {listing.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2 text-sm text-brand-dark">
                        <span className="text-brand-red">{AMENITY_ICONS[amenity] || <CheckCircle className="w-4 h-4" />}</span>
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Map */}
              {listing.location && (
                <div className="card p-6">
                  <h2 className="text-lg font-semibold text-brand-dark mb-4">Location</h2>
                  <MapPicker 
                    lat={listing.location?.lat} 
                    lng={listing.location?.lng} 
                    address={`${listing.location?.address}, ${listing.location?.city}, ${listing.location?.state}`}
                  />
                </div>
              )}

              {/* Reviews */}
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-brand-dark mb-4">
                  Reviews
                  {listing.reviewCount > 0 && ` (${listing.reviewCount})`}
                </h2>

                {/* Star breakdown */}
                {listing.reviewCount > 0 && (
                  <div className="space-y-2 mb-6">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = starBreakdown[star] || 0;
                      const pct = listing.reviewCount ? (count / listing.reviewCount) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2 text-xs">
                          <span className="w-4 text-right text-brand-muted">{star}★</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-amber-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-4 text-brand-muted">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Review cards */}
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-sm text-brand-muted text-center py-4">No reviews yet. Be the first to review!</p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review._id} className="border-b border-brand-border pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-dark text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {initials(review.renterId?.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-brand-dark">{review.renterId?.name}</p>
                              <p className="text-xs text-brand-muted">{formatDate(review.createdAt)}</p>
                            </div>
                            <StarRating rating={review.rating} />
                            {review.comment && <p className="text-sm text-brand-muted mt-2 leading-relaxed">{review.comment}</p>}
                            {review.ownerReply && (
                              <div className="mt-2 pl-3 border-l-2 border-brand-red">
                                <p className="text-xs font-semibold text-brand-dark">Owner replied:</p>
                                <p className="text-xs text-brand-muted">{review.ownerReply}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {reviews.length < totalReviews && (
                  <Button variant="ghost" onClick={loadMoreReviews} loading={reviewsLoading} className="w-full mt-4">
                    Load More Reviews
                  </Button>
                )}
              </div>

              {/* Similar Spaces */}
              {similar.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-brand-dark">Similar Spaces</h2>
                    <Link to={`/listings?type=${encodeURIComponent(listing.propertyType)}`} className="text-sm text-brand-red hover:underline">
                      View more →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {similar.map((s) => <ListingCard key={s._id} listing={s} compact />)}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Booking Panel (sticky) */}
            <div className="lg:col-span-2" id="book">
              <div className="sticky top-24 space-y-4">
                {/* Price Card */}
                <div className="card p-6">
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <span className="text-3xl font-bold price-display">
                        {formatPrice(listing.price?.amount)}
                      </span>
                      <span className="text-brand-muted text-sm">/{listing.price?.type}</span>
                    </div>
                    {listing.refundPolicy ? (
                      <span className="badge-refund">Refundable</span>
                    ) : (
                      <span className="badge-no-refund">Non-refundable</span>
                    )}
                  </div>

                  {listing.refundPolicy && (
                    <p className="text-xs text-green-600 mb-4">
                      ✅ Free cancellation up to {listing.refundHours} hours before your booking starts
                    </p>
                  )}

                  {/* Calendar */}
                  <div className="mb-4">
                    <AvailabilityCalendar
                      listingId={listing._id}
                      availability={listing.availability}
                      selectedDate={selectedDate}
                      onDateSelect={(date) => { setSelectedDate(date); setSelectedSlot(null); }}
                    />
                  </div>

                  {/* Time Slots */}
                  {selectedDate && (
                    <div className="mb-4">
                      <TimeSlotPicker
                        availability={listing.availability}
                        bookedSlots={listing.bookedSlots || []}
                        selectedDate={selectedDate}
                        selectedStart={selectedSlot?.start}
                        selectedEnd={selectedSlot?.end}
                        onSlotSelect={setSelectedSlot}
                      />
                    </div>
                  )}

                  {/* Price breakdown */}
                  {selectedSlot && (
                    <div className="bg-brand-cream rounded-xl p-4 mb-4 space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-brand-muted">{formatPrice(listing.price?.amount)} × {hours} hr{hours !== 1 ? 's' : ''}</span>
                        <span>{formatPrice(basePrice)}</span>
                      </div>
                      <div className="flex justify-between text-brand-muted text-xs">
                        <span>Platform fee (5%)</span>
                        <span>{formatPrice(platformFee)}</span>
                      </div>
                      <div className="border-t border-brand-border pt-1.5 flex justify-between font-bold">
                        <span>Total</span>
                        <span className="price-display">{formatPrice(totalPrice)}</span>
                      </div>
                    </div>
                  )}

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      if (!user) { navigate('/auth'); return; }
                      setBookingModalOpen(true);
                    }}
                  >
                    {selectedSlot ? `Book Now · ${formatPrice(totalPrice)}` : 'Book Now'}
                  </Button>

                  {!user && (
                    <p className="text-center text-xs text-brand-muted mt-2">
                      <Link to="/auth" className="text-brand-red hover:underline">Sign in</Link> to book this space
                    </p>
                  )}
                </div>

                {/* Owner Card */}
                <div className="card p-5">
                  <h3 className="font-semibold text-brand-dark mb-3 text-sm">About the Owner</h3>
                  <div className="flex items-center gap-3 mb-3">
                    {owner?.photoURL ? (
                      <img src={owner.photoURL} alt={owner.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-brand-red text-white flex items-center justify-center font-bold">
                        {initials(owner?.name)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-brand-dark text-sm">{owner?.name}</p>
                      <p className="text-xs text-brand-muted">Member since {formatMemberSince(owner?.createdAt)}</p>
                      {owner?.isVerified && <span className="badge-verified text-xs">Verified</span>}
                    </div>
                  </div>

                  {/* Contact info — only show if exists */}
                  {owner?.phone && (
                    <a href={`tel:${owner.phone}`} className="flex items-center gap-2 text-sm text-brand-dark hover:text-brand-red transition-colors mb-2">
                      <Phone className="w-4 h-4 text-brand-muted" />
                      {owner.phone}
                    </a>
                  )}
                  {owner?.email && (
                    <a href={`mailto:${owner.email}`} className="flex items-center gap-2 text-sm text-brand-dark hover:text-brand-red transition-colors">
                      <Mail className="w-4 h-4 text-brand-muted" />
                      {owner.email}
                    </a>
                  )}
                  {!owner?.phone && !owner?.email && (
                    <Button variant="secondary" className="w-full mt-2 text-sm">
                      Contact Owner
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        listing={listing}
      />
    </>
  );
};

export default ListingDetail;
