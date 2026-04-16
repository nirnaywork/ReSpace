import { useState, useCallback } from 'react';
import api from '../utils/api';

export const useBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRenterBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/bookings/renter/mine');
      if (res.data.success) setBookings(res.data.data.bookings);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOwnerBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/bookings/owner/mine');
      if (res.data.success) setBookings(res.data.data.bookings);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  const createBooking = useCallback(async (bookingData) => {
    const res = await api.post('/api/bookings', bookingData);
    return res.data.data;
  }, []);

  const verifyPayment = useCallback(async (paymentData) => {
    const res = await api.post('/api/bookings/verify-payment', paymentData);
    return res.data.data;
  }, []);

  const cancelBooking = useCallback(async (bookingId, cancellationReason) => {
    const res = await api.put(`/api/bookings/${bookingId}/cancel`, { cancellationReason });
    return res.data.data;
  }, []);

  const completeBooking = useCallback(async (bookingId) => {
    const res = await api.put(`/api/bookings/${bookingId}/complete`);
    return res.data.data;
  }, []);

  const submitReview = useCallback(async (bookingId, reviewData) => {
    const res = await api.post(`/api/bookings/${bookingId}/review`, reviewData);
    return res.data.data;
  }, []);

  return {
    bookings,
    loading,
    error,
    fetchRenterBookings,
    fetchOwnerBookings,
    createBooking,
    verifyPayment,
    cancelBooking,
    completeBooking,
    submitReview,
  };
};
