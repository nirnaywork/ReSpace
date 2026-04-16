const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  renterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  slot: {
    date: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
  },
  duration: { type: Number },
  totalPrice: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  payment: {
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed'],
      default: 'pending',
    },
  },
  refundStatus: {
    type: String,
    enum: ['not_applicable', 'eligible', 'processed', 'rejected'],
    default: 'not_applicable',
  },
  cancellationReason: { type: String, default: '' },
  ownerNotes: { type: String, default: '' },
  isReviewed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', bookingSchema);
