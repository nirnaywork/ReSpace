import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../hooks/useAuth';
import { useBookings } from '../hooks/useBookings';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/formatPrice';
import { formatDate, formatMemberSince } from '../utils/formatDate';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import ListingCard from '../components/listings/ListingCard';
import { Calendar, Star, Clock, CheckCircle, XCircle, Heart, User, Phone, Camera, Bookmark } from 'lucide-react';
import { BOOKING_STATUS_COLORS } from '../utils/constants';

const BOOKING_TABS = ['Upcoming', 'Past', 'Cancelled'];

const RenterDashboard = () => {
  const { userProfile, refreshProfile } = useAuth();
  const { bookings, loading, fetchRenterBookings, cancelBooking, submitReview } = useBookings();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('Upcoming');
  const [savedListings, setSavedListings] = useState([]);
  const [reviewModal, setReviewModal] = useState(null); // booking object
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submitingReview, setSubmitingReview] = useState(false);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneValue, setPhoneValue] = useState(userProfile?.phone || '');

  useEffect(() => {
    fetchRenterBookings();
  }, []);

  useEffect(() => {
    if (userProfile?.savedListings?.length) {
      setSavedListings(userProfile.savedListings);
    }
  }, [userProfile]);

  const handleUpdatePhone = async () => {
    try {
      await api.put('/api/auth/me', { phone: phoneValue });
      await refreshProfile();
      toast.success('Phone updated!');
      setEditingPhone(false);
    } catch (err) {
      toast.error('Failed to update phone');
    }
  };

  const handleCancel = async () => {
    if (!cancelModal) return;
    setCancelling(true);
    try {
      await cancelBooking(cancelModal._id, cancelReason);
      await fetchRenterBookings();
      toast.success('Booking cancelled');
      setCancelModal(null);
      setCancelReason('');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewModal) return;
    setSubmitingReview(true);
    try {
      await submitReview(reviewModal._id, { rating: reviewRating, comment: reviewComment });
      await fetchRenterBookings();
      toast.success('Review submitted!');
      setReviewModal(null);
      setReviewRating(5);
      setReviewComment('');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to submit review');
    } finally {
      setSubmitingReview(false);
    }
  };

  // Tab filtering
  const now = new Date();
  const filteredBookings = bookings.filter((b) => {
    const slotDate = new Date(b.slot?.date);
    if (activeTab === 'Upcoming') return ['pending', 'confirmed'].includes(b.status) && slotDate >= now;
    if (activeTab === 'Past') return b.status === 'completed';
    if (activeTab === 'Cancelled') return b.status === 'cancelled';
    return true;
  });

  const STATUS_ICONS = {
    pending: <Clock className="w-4 h-4 text-amber-500" />,
    confirmed: <CheckCircle className="w-4 h-4 text-blue-500" />,
    completed: <CheckCircle className="w-4 h-4 text-green-500" />,
    cancelled: <XCircle className="w-4 h-4 text-red-500" />,
  };

  const initials = (name) => name ? name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() : '?';

  return (
    <>
      <Helmet>
        <title>My Dashboard – ReSpace</title>
      </Helmet>

      <div className="min-h-screen bg-brand-cream py-8">
        <div className="page-container space-y-8">
          {/* Profile Card */}
          <div className="card p-6">
            <div className="flex items-start gap-5 flex-wrap">
              {/* Avatar */}
              <div className="relative">
                {userProfile?.photoURL ? (
                  <img src={userProfile.photoURL} alt={userProfile.name} className="w-20 h-20 rounded-full object-cover border-4 border-brand-cream" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-brand-red text-white flex items-center justify-center text-2xl font-bold">
                    {initials(userProfile?.name)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-brand-dark">{userProfile?.name}</h1>
                <p className="text-brand-muted text-sm">{userProfile?.email}</p>
                <p className="text-xs text-brand-muted mt-1">Member since {formatMemberSince(userProfile?.createdAt)}</p>

                {/* Phone */}
                <div className="flex items-center gap-2 mt-3">
                  <Phone className="w-4 h-4 text-brand-muted flex-shrink-0" />
                  {editingPhone ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="tel"
                        value={phoneValue}
                        onChange={(e) => setPhoneValue(e.target.value)}
                        className="input-field h-8 text-sm w-40"
                        placeholder="+91 9876543210"
                        autoFocus
                      />
                      <Button size="sm" onClick={handleUpdatePhone} className="text-xs">Save</Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditingPhone(false)} className="text-xs">Cancel</Button>
                    </div>
                  ) : (
                    <button onClick={() => setEditingPhone(true)} className="text-sm text-brand-dark hover:text-brand-red transition-colors flex items-center gap-1">
                      {userProfile?.phone || <span className="text-brand-muted italic">Add phone number</span>}
                      <span className="text-xs text-brand-red">(edit)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Roles */}
              <div className="flex gap-2 flex-wrap">
                {userProfile?.roles?.map((role) => (
                  <span key={role} className={`text-xs px-3 py-1 rounded-full font-semibold capitalize ${role === 'owner' ? 'bg-brand-dark text-white' : 'bg-brand-red text-white'}`}>
                    {role}
                  </span>
                ))}
                {!userProfile?.roles?.includes('owner') && (
                  <Link to="/owner/add-space" className="text-xs px-3 py-1 rounded-full border border-brand-border text-brand-muted hover:border-brand-red hover:text-brand-red transition-colors">
                    + Become Owner
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Bookings */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-brand-border">
              <h2 className="font-semibold text-brand-dark mb-3">My Bookings</h2>
              <div className="flex gap-2">
                {BOOKING_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${activeTab === tab ? 'bg-brand-red text-white' : 'bg-gray-100 text-brand-muted hover:bg-gray-200'}`}
                    aria-pressed={activeTab === tab}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
            ) : filteredBookings.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="w-12 h-12 text-brand-muted mx-auto mb-4" />
                <p className="font-semibold text-brand-dark mb-2">No {activeTab.toLowerCase()} bookings</p>
                <p className="text-brand-muted text-sm mb-6">
                  {activeTab === 'Upcoming' ? "Ready to book your first space?" : "Nothing here yet."}
                </p>
                {activeTab === 'Upcoming' && (
                  <Link to="/listings" className="btn-primary inline-flex">Browse Spaces</Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-brand-border/50">
                {filteredBookings.map((booking) => (
                  <div key={booking._id} className="px-6 py-5 hover:bg-gray-50 transition-colors">
                    <div className="flex gap-4 flex-wrap">
                      {/* Space Image */}
                      {booking.listingId?.images?.[0] && (
                        <img src={booking.listingId.images[0]} alt={booking.listingId.propertyName} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                      )}

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <Link to={`/listings/${booking.listingId?._id}`} className="font-semibold text-brand-dark hover:text-brand-red transition-colors text-sm">
                            {booking.listingId?.propertyName}
                          </Link>
                          <div className="flex items-center gap-1.5">
                            {STATUS_ICONS[booking.status]}
                            <span className={`text-xs font-semibold capitalize ${BOOKING_STATUS_COLORS[booking.status]}`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-xs text-brand-muted">
                          <span>📅 {formatDate(booking.slot?.date)} · {booking.slot?.start}–{booking.slot?.end}</span>
                          <span>⏱ {booking.duration}h</span>
                          <span className="price-display font-medium">{formatPrice(booking.totalPrice)}</span>
                        </div>

                        {/* Refund status for cancelled */}
                        {booking.status === 'cancelled' && booking.refundStatus !== 'not_applicable' && (
                          <p className={`text-xs font-medium ${booking.refundStatus === 'processed' ? 'text-green-600' : 'text-brand-error'}`}>
                            Refund: {booking.refundStatus === 'processed' ? '✅ Processed' : booking.refundStatus === 'rejected' ? '❌ Not eligible' : booking.refundStatus}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 flex-wrap pt-1">
                          <Link to={`/bookings/${booking._id}`} className="text-xs btn-ghost py-1 px-2 min-h-0">
                            View Details
                          </Link>
                          {['pending', 'confirmed'].includes(booking.status) && new Date(booking.slot?.date) > new Date() && (
                            <button onClick={() => setCancelModal(booking)} className="text-xs text-brand-error hover:underline font-medium">
                              Cancel Booking
                            </button>
                          )}
                          {booking.status === 'completed' && !booking.isReviewed && (
                            <button
                              onClick={() => setReviewModal(booking)}
                              className="text-xs btn-primary py-1 px-3 min-h-0 flex items-center gap-1"
                            >
                              <Star className="w-3 h-3" /> Leave Review
                            </button>
                          )}
                          {booking.status === 'completed' && booking.isReviewed && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Reviewed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Spaces */}
          {savedListings.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Bookmark className="w-5 h-5 text-brand-red" />
                <h2 className="font-semibold text-brand-dark">Saved Spaces</h2>
                <span className="text-xs text-brand-muted">({savedListings.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedListings.map((listing) => (
                  <ListingCard key={listing._id || listing} listing={typeof listing === 'object' ? listing : { _id: listing }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <Modal isOpen={!!reviewModal} onClose={() => setReviewModal(null)} title="Leave a Review" size="sm">
        <div className="p-6 space-y-4">
          <p className="text-sm text-brand-muted">
            How was your experience at <strong>{reviewModal?.listingId?.propertyName}</strong>?
          </p>

          {/* Star selector */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setReviewRating(star)}
                className="transition-transform hover:scale-110"
                aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
              >
                <Star className={`w-8 h-8 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="review-comment" className="block text-sm font-medium text-brand-dark mb-1.5">
              Comment (optional)
            </label>
            <textarea
              id="review-comment"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share your experience..."
              maxLength={500}
              className="textarea-field w-full h-24"
            />
            <p className="text-xs text-brand-muted text-right mt-1">{reviewComment.length}/500</p>
          </div>

          <Button variant="primary" className="w-full" onClick={handleSubmitReview} loading={submitingReview}>
            Submit Review
          </Button>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal isOpen={!!cancelModal} onClose={() => setCancelModal(null)} title="Cancel Booking" size="sm">
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-sm text-amber-700">
              {cancelModal?.listingId?.refundPolicy
                ? `⚠️ Refund available if cancelled ${cancelModal.listingId.refundHours}+ hours before start.`
                : '❌ This booking is non-refundable.'}
            </p>
          </div>

          <div>
            <label htmlFor="cancel-reason" className="block text-sm font-medium text-brand-dark mb-1.5">
              Reason for cancellation
            </label>
            <textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please let us know why you're cancelling..."
              className="textarea-field w-full h-20"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setCancelModal(null)} className="flex-1">Keep Booking</Button>
            <Button variant="danger" onClick={handleCancel} loading={cancelling} className="flex-1">
              Cancel Booking
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default RenterDashboard;
