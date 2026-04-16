import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Edit2, Eye, Trash2, TrendingUp, Building2, Calendar, DollarSign, ToggleLeft, ToggleRight, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useBookings } from '../hooks/useBookings';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/formatPrice';
import { formatDate, formatDateTime } from '../utils/formatDate';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { ListingCardSkeleton } from '../components/ui/Skeleton';
import { BOOKING_STATUS_COLORS } from '../utils/constants';

const BOOKING_TABS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

const OwnerDashboard = () => {
  const { userProfile } = useAuth();
  const { bookings, loading: bookingsLoading, fetchOwnerBookings, completeBooking } = useBookings();
  const toast = useToast();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [activeBookingTab, setActiveBookingTab] = useState('All');

  useEffect(() => {
    fetchOwnerBookings();
    loadListings();
  }, []);

  const loadListings = async () => {
    setListingsLoading(true);
    try {
      const res = await api.get('/api/listings/owner/my-spaces');
      if (res.data.success) setListings(res.data.data.listings);
    } catch (err) {
      toast.error('Failed to load listings');
    } finally {
      setListingsLoading(false);
    }
  };

  const handleTogglePublish = async (listingId) => {
    try {
      const res = await api.post(`/api/listings/${listingId}/publish`);
      if (res.data.success) {
        setListings((prev) => prev.map((l) => l._id === listingId ? { ...l, isPublished: res.data.data.isPublished } : l));
        toast.success(res.data.data.isPublished ? 'Listing published!' : 'Listing unpublished');
      }
    } catch (err) {
      toast.error('Failed to toggle publish status');
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.delete(`/api/listings/${listingId}`);
      setListings((prev) => prev.filter((l) => l._id !== listingId));
      toast.success('Listing deleted');
    } catch (err) {
      toast.error('Failed to delete listing');
    }
  };

  const handleComplete = async (bookingId) => {
    try {
      await completeBooking(bookingId);
      await fetchOwnerBookings();
      toast.success('Booking marked as completed');
    } catch (err) {
      toast.error('Failed to complete booking');
    }
  };

  // Stats
  const totalSpaces = listings.length;
  const publishedCount = listings.filter((l) => l.isPublished).length;
  const totalBookingsCount = bookings.length;
  const totalRevenue = bookings.filter((b) => b.status === 'completed' && b.payment?.status === 'paid').reduce((sum, b) => sum + b.totalPrice, 0);

  // Revenue chart (last 7 days)
  const revenueData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const dayRevenue = bookings
      .filter((b) => b.createdAt?.startsWith(dateStr) && b.payment?.status === 'paid')
      .reduce((sum, b) => sum + b.totalPrice, 0);
    return {
      day: date.toLocaleDateString('en-IN', { weekday: 'short' }),
      revenue: dayRevenue,
    };
  });

  const filteredBookings = activeBookingTab === 'All'
    ? bookings
    : bookings.filter((b) => b.status.toLowerCase() === activeBookingTab.toLowerCase());

  const STATUS_ICONS = {
    pending: <Clock className="w-4 h-4 text-amber-500" />,
    confirmed: <CheckCircle className="w-4 h-4 text-blue-500" />,
    completed: <CheckCircle className="w-4 h-4 text-green-500" />,
    cancelled: <XCircle className="w-4 h-4 text-red-500" />,
  };

  return (
    <>
      <Helmet>
        <title>Owner Dashboard – ReSpace</title>
      </Helmet>

      <div className="min-h-screen bg-brand-cream py-8">
        <div className="page-container space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-brand-dark font-bold">
                Welcome back, {userProfile?.name?.split(' ')[0] || 'Owner'}! 👋
              </h1>
              <p className="text-brand-muted text-sm mt-1">Manage your spaces and bookings</p>
            </div>
            <Link to="/owner/add-space" className="btn-primary" id="add-new-space-btn">
              <Plus className="w-4 h-4" /> Add New Space
            </Link>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Spaces', value: totalSpaces, icon: <Building2 className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Published', value: publishedCount, icon: <Eye className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Total Bookings', value: totalBookingsCount, icon: <Calendar className="w-5 h-5" />, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: <TrendingUp className="w-5 h-5" />, color: 'text-brand-red', bg: 'bg-red-50', mono: true },
            ].map(({ label, value, icon, color, bg, mono }) => (
              <div key={label} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider">{label}</span>
                  <div className={`w-8 h-8 rounded-lg ${bg} ${color} flex items-center justify-center`}>{icon}</div>
                </div>
                <p className={`text-2xl font-bold text-brand-dark ${mono ? 'font-mono' : ''}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Revenue Chart */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-brand-dark">Revenue (Last 7 Days)</h2>
              <p className="text-sm font-bold price-display">
                This Month: {formatPrice(bookings.filter((b) => {
                  const thisMonth = new Date().toISOString().slice(0, 7);
                  return b.createdAt?.startsWith(thisMonth) && b.payment?.status === 'paid';
                }).reduce((sum, b) => sum + b.totalPrice, 0))}
              </p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={revenueData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatPrice(v)} contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="revenue" fill="#731919" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* My Spaces */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between">
              <h2 className="font-semibold text-brand-dark">My Spaces</h2>
              <span className="text-xs text-brand-muted">{listings.length} total</span>
            </div>

            {listingsLoading ? (
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => <ListingCardSkeleton key={i} />)}
              </div>
            ) : listings.length === 0 ? (
              <div className="p-12 text-center">
                <Building2 className="w-12 h-12 text-brand-muted mx-auto mb-4" />
                <p className="font-semibold text-brand-dark mb-2">You haven't listed any spaces yet</p>
                <p className="text-brand-muted text-sm mb-6">Start earning by listing your first commercial space.</p>
                <Link to="/owner/add-space" className="btn-primary inline-flex">+ Add Your First Space</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-brand-border">
                      {['Space', 'Type', 'Status', 'Price', 'Bookings', 'Rating', 'Actions'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((listing) => (
                      <tr key={listing._id} className="border-b border-brand-border/50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {listing.images?.[0] ? (
                              <img src={listing.images[0]} alt={listing.propertyName} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0" />
                            )}
                            <p className="text-sm font-medium text-brand-dark truncate max-w-[150px]">{listing.propertyName}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge propertyType={listing.propertyType}>{listing.propertyType}</Badge>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleTogglePublish(listing._id)}
                            className={`flex items-center gap-1.5 text-xs font-medium transition-all ${listing.isPublished ? 'text-green-600' : 'text-brand-muted'}`}
                            aria-label={listing.isPublished ? 'Unpublish listing' : 'Publish listing'}
                          >
                            {listing.isPublished
                              ? <><ToggleRight className="w-5 h-5 text-green-500" /> Published</>
                              : <><ToggleLeft className="w-5 h-5" /> Unpublished</>
                            }
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <span className="price-display text-sm">{formatPrice(listing.price?.amount)}/{listing.price?.type}</span>
                        </td>
                        <td className="px-4 py-4 text-sm text-brand-dark">{listing.totalBookings || 0}</td>
                        <td className="px-4 py-4">
                          {listing.reviewCount > 0 ? (
                            <span className="text-sm text-amber-600 font-medium">⭐ {listing.avgRating?.toFixed(1)}</span>
                          ) : (
                            <span className="text-xs text-brand-muted">No reviews</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Link to={`/listings/${listing._id}`} className="p-1.5 rounded-lg hover:bg-gray-100 text-brand-muted hover:text-brand-dark" aria-label="View listing">
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link to={`/owner/edit-space/${listing._id}`} className="p-1.5 rounded-lg hover:bg-gray-100 text-brand-muted hover:text-brand-dark" aria-label="Edit listing">
                              <Edit2 className="w-4 h-4" />
                            </Link>
                            <button onClick={() => handleDeleteListing(listing._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-brand-muted hover:text-brand-error" aria-label="Delete listing">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Incoming Bookings */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-brand-border">
              <h2 className="font-semibold text-brand-dark mb-3">Incoming Bookings</h2>
              <div className="flex gap-2 overflow-x-auto">
                {BOOKING_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveBookingTab(tab)}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${activeBookingTab === tab ? 'bg-brand-red text-white' : 'bg-gray-100 text-brand-muted hover:bg-gray-200'}`}
                    aria-pressed={activeBookingTab === tab}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {bookingsLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="w-12 h-12 text-brand-muted mx-auto mb-4" />
                <p className="text-brand-muted">No {activeBookingTab !== 'All' ? activeBookingTab.toLowerCase() : ''} bookings yet</p>
              </div>
            ) : (
              <div className="divide-y divide-brand-border/50">
                {filteredBookings.map((booking) => (
                  <div key={booking._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4 flex-wrap">
                      {/* Renter */}
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <div className="w-8 h-8 rounded-full bg-brand-dark text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {booking.renterId?.name?.charAt(0) || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-brand-dark truncate">{booking.renterId?.name}</p>
                          <p className="text-xs text-brand-muted truncate">{booking.listingId?.propertyName}</p>
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="text-xs text-brand-muted">
                        <p>{formatDate(booking.slot?.date)}</p>
                        <p>{booking.slot?.start} – {booking.slot?.end}</p>
                      </div>

                      {/* Amount */}
                      <span className="price-display text-sm">{formatPrice(booking.totalPrice)}</span>

                      {/* Status */}
                      <div className="flex items-center gap-1.5">
                        {STATUS_ICONS[booking.status]}
                        <span className={BOOKING_STATUS_COLORS[booking.status]}>{booking.status}</span>
                      </div>

                      {/* Actions */}
                      <div className="ml-auto flex gap-2">
                        {booking.status === 'confirmed' && (
                          <Button variant="secondary" size="sm" onClick={() => handleComplete(booking._id)}>
                            Mark Complete
                          </Button>
                        )}
                        <Link to={`/bookings/${booking._id}`} className="btn-ghost text-sm py-1 px-2 min-h-0 text-xs">
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OwnerDashboard;
