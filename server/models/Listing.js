const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyName: { type: String, required: true, trim: true, maxLength: 100 },
  propertyType: {
    type: String,
    enum: ['Warehouse', 'Kitchen', 'Event Hall', 'Office Space', 'Parking Space', 'Other'],
    required: true,
  },
  description: { type: String, required: true, maxLength: 2000 },
  location: {
    address: { type: String, required: true },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
  price: {
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['hour', 'day', 'week'], required: true },
    currency: { type: String, default: 'INR' },
  },
  securityDeposit: { type: Number, default: 0 },
  refundPolicy: { type: Boolean, default: false },
  refundHours: { type: Number, default: 24 },
  availability: {
    days: [{ type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }],
    openTime: { type: String, default: '09:00' },
    closeTime: { type: String, default: '18:00' },
    customSlots: [{ start: String, end: String }],
  },
  bookedSlots: [{
    date: String,
    start: String,
    end: String,
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  }],
  amenities: [{
    type: String,
    enum: ['WiFi', 'Power Backup', 'Parking', 'AC', 'CCTV', 'Security Guard', 'Generator', 'Cafeteria', 'Lift', 'Restroom'],
  }],
  images: [String],
  verification: {
    aadhaar: { type: String },
    pan: { type: String },
    isSubmitted: { type: Boolean, default: false },
  },
  isVerified: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes
listingSchema.index({ 'location.city': 1 });
listingSchema.index({ propertyType: 1 });
listingSchema.index({ 'price.amount': 1 });
listingSchema.index({ isPublished: 1 });
listingSchema.index({ isDeleted: 1 });
listingSchema.index({ propertyName: 'text', description: 'text', 'location.address': 'text' });

// Update updatedAt on save
listingSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Listing', listingSchema);
