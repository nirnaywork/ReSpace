const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  photoURL: { type: String, default: '' },
  phone: { type: String, default: '' },
  roles: [{ type: String, enum: ['owner', 'renter'] }],
  savedListings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
