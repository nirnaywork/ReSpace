import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import AvailabilityCalendar from './AvailabilityCalendar';
import TimeSlotPicker from './TimeSlotPicker';
import { formatPrice, calcPlatformFee, calcTotal } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';
import { useBookings } from '../../hooks/useBookings';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Clock, CreditCard, Info } from 'lucide-react';

const BookingModal = ({ isOpen, onClose, listing }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { createBooking, verifyPayment } = useBookings();
  const toast = useToast();
  const navigate = useNavigate();

  if (!listing) return null;

  const hours = selectedSlot
    ? (function () {
        const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
        return (toMin(selectedSlot.end) - toMin(selectedSlot.start)) / 60;
      })()
    : 0;

  const basePrice = listing.price?.type === 'hour'
    ? listing.price.amount * hours
    : listing.price.amount;
  const platformFee = calcPlatformFee(basePrice);
  const totalPrice = calcTotal(basePrice);

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot) {
      toast.error('Please select a date and time slot');
      return;
    }

    setLoading(true);
    try {
      // Create booking + get Razorpay order
      const orderData = await createBooking({
        listingId: listing._id,
        slot: { date: selectedDate, start: selectedSlot.start, end: selectedSlot.end },
        duration: hours,
      });

      // Check if Razorpay is available
      if (orderData.keyId && !orderData.keyId.includes('placeholder') && typeof window.Razorpay !== 'undefined') {
        // Real Razorpay checkout
        const rzp = new window.Razorpay({
          key: orderData.keyId,
          amount: orderData.amount * 100,
          currency: orderData.currency,
          name: 'ReSpace',
          description: `Booking: ${listing.propertyName}`,
          order_id: orderData.orderId,
          handler: async (response) => {
            try {
              await verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                bookingId: orderData.bookingId,
              });
              toast.success('Booking confirmed! Check your email for details.');
              onClose();
              navigate('/renter/dashboard');
            } catch (err) {
              toast.error('Payment verification failed. Please contact support.');
            }
          },
          prefill: { name: '', email: '', contact: '' },
          theme: { color: '#F0D8A1' },
          modal: {
            ondismiss: () => {
              toast.warning('Payment cancelled. Your slot has not been reserved.');
            },
          },
        });
        rzp.open();
      } else {
        // Mock payment for development
        await verifyPayment({
          razorpayOrderId: orderData.orderId,
          razorpayPaymentId: `pay_mock_${Date.now()}`,
          razorpaySignature: 'mock_signature',
          bookingId: orderData.bookingId,
        });
        toast.success('Booking confirmed! (Mock payment in dev mode)');
        onClose();
        navigate('/renter/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message;
      if (msg?.includes('slot') || msg?.includes('conflict')) {
        toast.error('This slot was just booked by someone else. Please pick a different time.');
      } else {
        toast.error(msg || 'Booking failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedDate('');
    setSelectedSlot(null);
    setStep(1);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Book This Space" size="lg">
      <div className="p-6 space-y-6">
        {/* Space summary */}
        <div className="flex gap-3 p-3 bg-brand-cream rounded-xl">
          {listing.images?.[0] && (
            <img
              src={listing.images[0]}
              alt={listing.propertyName}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
          )}
          <div className="min-w-0">
            <h4 className="font-semibold text-brand-dark truncate">{listing.propertyName}</h4>
            <p className="text-xs text-brand-muted">{listing.location?.address}</p>
            <p className="price-display text-sm mt-0.5">
              {formatPrice(listing.price?.amount)}/{listing.price?.type}
            </p>
          </div>
        </div>

        {/* Date Picker */}
        <div>
          <h4 className="flex items-center gap-2 text-sm font-semibold text-brand-dark mb-3">
            <CalendarDays className="w-4 h-4 text-brand-red" /> Select Date
          </h4>
          <AvailabilityCalendar
            listingId={listing._id}
            availability={listing.availability}
            selectedDate={selectedDate}
            onDateSelect={(date) => { setSelectedDate(date); setSelectedSlot(null); }}
          />
        </div>

        {/* Time Slot */}
        {selectedDate && (
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold text-brand-dark mb-3">
              <Clock className="w-4 h-4 text-brand-red" /> Select Time Slot
            </h4>
            <TimeSlotPicker
              availability={listing.availability}
              bookedSlots={[]}
              selectedDate={selectedDate}
              selectedStart={selectedSlot?.start}
              selectedEnd={selectedSlot?.end}
              onSlotSelect={setSelectedSlot}
            />
          </div>
        )}

        {/* Price Breakdown */}
        {selectedSlot && (
          <div className="bg-brand-cream rounded-xl p-4 space-y-2 border border-brand-border">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-brand-dark">
              <CreditCard className="w-4 h-4 text-brand-red" /> Price Breakdown
            </h4>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-brand-dark">
                <span>
                  {formatPrice(listing.price?.amount)} × {hours} {listing.price?.type}
                  {listing.price?.type === 'hour' && hours !== 1 ? 's' : ''}
                </span>
                <span>{formatPrice(basePrice)}</span>
              </div>
              <div className="flex justify-between text-brand-muted text-xs">
                <span className="flex items-center gap-1">
                  Platform fee (5%)
                  <Info className="w-3 h-3" />
                </span>
                <span>{formatPrice(platformFee)}</span>
              </div>
              <div className="border-t border-brand-border pt-1.5 flex justify-between font-bold text-brand-dark">
                <span>Total</span>
                <span className="price-display">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            {/* Refund policy */}
            <div className={`text-xs mt-2 px-3 py-2 rounded-lg ${listing.refundPolicy ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {listing.refundPolicy
                ? `✅ Refund available if cancelled ${listing.refundHours}+ hours before start`
                : '❌ This booking is non-refundable'}
            </div>
          </div>
        )}

        {/* Summary line */}
        {selectedDate && selectedSlot && (
          <div className="text-sm text-brand-dark bg-blue-50 px-4 py-3 rounded-xl border border-blue-200">
            📅 <strong>{formatDate(selectedDate)}</strong> from <strong>{selectedSlot.start}</strong> to <strong>{selectedSlot.end}</strong>
          </div>
        )}

        {/* CTA */}
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleBook}
          disabled={!selectedDate || !selectedSlot}
          loading={loading}
        >
          {loading ? 'Processing...' : `Confirm & Pay ${selectedSlot ? formatPrice(totalPrice) : ''}`}
        </Button>

        <p className="text-center text-xs text-brand-muted">
          🔒 Secure payment powered by Razorpay
        </p>
      </div>
    </Modal>
  );
};

export default BookingModal;
