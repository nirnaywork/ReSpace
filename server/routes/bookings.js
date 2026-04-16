const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const verifyToken = require('../middleware/verifyToken');
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const User = require('../models/User');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const { hasSlotConflict, calcDurationHours } = require('../utils/slotHelpers');
const {
  sendBookingConfirmationToRenter,
  sendNewBookingToOwner,
  sendCancellationEmail,
  sendRefundEmail,
} = require('../utils/sendEmail');
const { emitToUser } = require('../config/socket');

let Razorpay;
try {
  Razorpay = require('razorpay');
} catch (e) {
  console.warn('Razorpay not available, using mock');
}

const createRazorpayOrder = async (amount, currency = 'INR') => {
  if (process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.includes('placeholder')) {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    return razorpay.orders.create({ amount: amount * 100, currency, receipt: `rcp_${Date.now()}` });
  }
  // Mock order for development
  return {
    id: `order_mock_${Date.now()}`,
    amount: amount * 100,
    currency,
    status: 'created',
  };
};

// POST /api/bookings — Create booking + Razorpay order
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { listingId, slot, duration } = req.body;
    const { date, start, end } = slot || {};

    if (!listingId || !date || !start || !end) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'listingId, slot.date, slot.start, slot.end are required' } });
    }

    const [listing, renterUser] = await Promise.all([
      Listing.findById(listingId).populate('ownerId'),
      User.findOne({ uid: req.user.uid }),
    ]);

    if (!listing || listing.isDeleted || !listing.isPublished) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Listing not found or not available' } });
    }

    // Check slot conflict
    if (hasSlotConflict(listing.bookedSlots, date, start, end)) {
      return res.status(409).json({
        success: false,
        error: { code: 'SLOT_CONFLICT', message: 'This slot was just booked by someone else. Please choose another time.' },
      });
    }

    // Calculate price
    const hours = calcDurationHours(start, end);
    let totalPrice;
    if (listing.price.type === 'hour') {
      totalPrice = listing.price.amount * hours;
    } else if (listing.price.type === 'day') {
      totalPrice = listing.price.amount;
    } else {
      totalPrice = listing.price.amount;
    }
    // Add 5% platform fee
    const platformFee = Math.round(totalPrice * 0.05);
    totalPrice = Math.round(totalPrice + platformFee);

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder(totalPrice);

    // Create pending booking
    const booking = new Booking({
      renterId: renterUser._id,
      ownerId: listing.ownerId._id,
      listingId: listing._id,
      slot: { date, start, end },
      duration: hours,
      totalPrice,
      payment: {
        razorpayOrderId: razorpayOrder.id,
        status: 'pending',
      },
      status: 'pending',
    });
    await booking.save();

    res.status(201).json({
      success: true,
      data: {
        bookingId: booking._id,
        orderId: razorpayOrder.id,
        amount: totalPrice,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/bookings/verify-payment
router.post('/verify-payment', verifyToken, async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate('listingId').populate('renterId').populate('ownerId');
    if (!booking) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } });
    }

    // Verify Razorpay signature
    let signatureValid = false;
    if (process.env.RAZORPAY_KEY_SECRET && !process.env.RAZORPAY_KEY_SECRET.includes('placeholder')) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');
      signatureValid = expectedSignature === razorpaySignature;
    } else {
      // Dev mode: accept mock payment
      signatureValid = razorpayOrderId.includes('mock') || razorpaySignature === 'mock_signature';
    }

    if (!signatureValid) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_SIGNATURE', message: 'Payment verification failed' } });
    }

    // Atomically check conflict and add booked slot
    const slot = booking.slot;
    const updatedListing = await Listing.findOneAndUpdate(
      {
        _id: booking.listingId._id,
        'bookedSlots': {
          $not: {
            $elemMatch: {
              date: slot.date,
              $or: [
                { start: { $lt: slot.end }, end: { $gt: slot.start } },
              ],
            },
          },
        },
      },
      {
        $push: { bookedSlots: { date: slot.date, start: slot.start, end: slot.end, bookingId: booking._id } },
        $inc: { totalBookings: 1 },
      },
      { new: true }
    );

    if (!updatedListing) {
      // Slot was taken — refund and cancel
      booking.status = 'cancelled';
      booking.payment.status = 'failed';
      await booking.save();
      return res.status(409).json({ success: false, error: { code: 'SLOT_CONFLICT', message: 'This slot was just booked. Payment will be refunded.' } });
    }

    // Confirm booking
    booking.status = 'confirmed';
    booking.payment.razorpayOrderId = razorpayOrderId;
    booking.payment.razorpayPaymentId = razorpayPaymentId;
    booking.payment.razorpaySignature = razorpaySignature;
    booking.payment.status = 'paid';
    await booking.save();

    // Create notifications
    const [ownerUser, renterUser] = await Promise.all([
      User.findById(booking.ownerId),
      User.findById(booking.renterId),
    ]);

    const ownerNotif = new Notification({
      userId: ownerUser._id,
      type: 'booking_confirmed',
      title: 'New Booking Confirmed!',
      message: `${renterUser.name} booked ${booking.listingId.propertyName} on ${slot.date}`,
      link: '/owner/dashboard',
    });
    const renterNotif = new Notification({
      userId: renterUser._id,
      type: 'booking_confirmed',
      title: 'Booking Confirmed!',
      message: `Your booking at ${booking.listingId.propertyName} is confirmed for ${slot.date}`,
      link: '/renter/dashboard',
    });
    await Promise.all([ownerNotif.save(), renterNotif.save()]);

    // Emit socket events
    emitToUser(ownerUser.uid, 'notification:new', ownerNotif);
    emitToUser(renterUser.uid, 'notification:new', renterNotif);
    emitToUser(ownerUser.uid, 'booking:new', { booking: booking._id, listingName: booking.listingId.propertyName });

    // Send emails
    await Promise.all([
      sendBookingConfirmationToRenter({ renter: renterUser, listing: booking.listingId, booking }),
      sendNewBookingToOwner({ owner: ownerUser, renter: renterUser, listing: booking.listingId, booking }),
    ]);

    res.json({ success: true, data: { booking: { _id: booking._id, status: booking.status } } });
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings/renter/mine
router.get('/renter/mine', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    const bookings = await Booking.find({ renterId: user._id })
      .populate('listingId', 'propertyName images location propertyType price')
      .populate('ownerId', 'name photoURL')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: { bookings } });
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings/owner/mine
router.get('/owner/mine', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    const bookings = await Booking.find({ ownerId: user._id })
      .populate('listingId', 'propertyName images location propertyType price')
      .populate('renterId', 'name photoURL email phone')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: { bookings } });
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings/:id
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    const booking = await Booking.findById(req.params.id)
      .populate('listingId', '-verification')
      .populate('renterId', 'name photoURL email phone')
      .populate('ownerId', 'name photoURL email phone')
      .lean();

    if (!booking) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } });

    if (booking.renterId._id.toString() !== user._id.toString() &&
        booking.ownerId._id.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }

    res.json({ success: true, data: { booking } });
  } catch (error) {
    next(error);
  }
});

// PUT /api/bookings/:id/cancel
router.put('/:id/cancel', verifyToken, async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;
    const user = await User.findOne({ uid: req.user.uid });
    const booking = await Booking.findById(req.params.id).populate('listingId').populate('ownerId').populate('renterId');

    if (!booking) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } });

    if (booking.renterId._id.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }

    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'Cannot cancel this booking' } });
    }

    // Refund eligibility check (server-side)
    let refundStatus = 'not_applicable';
    if (booking.payment.status === 'paid') {
      const slotStart = new Date(`${booking.slot.date}T${booking.slot.start}:00`);
      const hoursUntilSlot = (slotStart - new Date()) / (1000 * 60 * 60);
      if (booking.listingId.refundPolicy && hoursUntilSlot >= booking.listingId.refundHours) {
        refundStatus = 'processed';
        // TODO: Call Razorpay refund API in production
      } else if (booking.payment.status === 'paid') {
        refundStatus = 'rejected';
      }
    }

    // Remove slot from listing
    await Listing.findByIdAndUpdate(booking.listingId._id, {
      $pull: { bookedSlots: { bookingId: booking._id } },
    });

    booking.status = 'cancelled';
    booking.refundStatus = refundStatus;
    booking.cancellationReason = cancellationReason || '';
    await booking.save();

    // Notifications
    const ownerNotif = new Notification({
      userId: booking.ownerId._id,
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `${booking.renterId.name} cancelled their booking for ${booking.listingId.propertyName}`,
      link: '/owner/dashboard',
    });
    await ownerNotif.save();
    emitToUser(booking.ownerId.uid, 'notification:new', ownerNotif);

    // Emails
    await sendCancellationEmail({ to: booking.renterId.email, name: booking.renterId.name, listing: booking.listingId, booking, isOwner: false });
    await sendCancellationEmail({ to: booking.ownerId.email, name: booking.ownerId.name, listing: booking.listingId, booking, isOwner: true });

    if (refundStatus === 'processed') {
      await sendRefundEmail({ renter: booking.renterId, amount: booking.totalPrice, booking });
    }

    res.json({ success: true, data: { status: booking.status, refundStatus } });
  } catch (error) {
    next(error);
  }
});

// PUT /api/bookings/:id/complete
router.put('/:id/complete', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } });

    if (booking.ownerId.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only the owner can mark as complete' } });
    }

    booking.status = 'completed';
    await booking.save();

    // Notify renter
    const renterUser = await User.findById(booking.renterId);
    const listing = await Listing.findById(booking.listingId);
    if (renterUser) {
      const notif = new Notification({
        userId: renterUser._id,
        type: 'booking_confirmed',
        title: 'Booking Completed',
        message: `Your booking at ${listing?.propertyName} has been marked complete. Leave a review!`,
        link: '/renter/dashboard',
      });
      await notif.save();
      emitToUser(renterUser.uid, 'notification:new', notif);
    }

    res.json({ success: true, data: { status: 'completed' } });
  } catch (error) {
    next(error);
  }
});

// POST /api/bookings/:id/review
router.post('/:id/review', verifyToken, async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_RATING', message: 'Rating must be 1-5' } });
    }

    const user = await User.findOne({ uid: req.user.uid });
    const booking = await Booking.findById(req.params.id).populate('listingId').populate('ownerId');

    if (!booking) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } });
    if (booking.renterId.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }
    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, error: { code: 'NOT_COMPLETED', message: 'Can only review completed bookings' } });
    }
    if (booking.isReviewed) {
      return res.status(400).json({ success: false, error: { code: 'ALREADY_REVIEWED', message: 'You have already reviewed this booking' } });
    }

    const review = new Review({
      bookingId: booking._id,
      listingId: booking.listingId._id,
      renterId: user._id,
      rating,
      comment: comment || '',
    });
    await review.save();

    booking.isReviewed = true;
    await booking.save();

    // Update listing avg rating
    const allReviews = await Review.find({ listingId: booking.listingId._id }).select('rating').lean();
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Listing.findByIdAndUpdate(booking.listingId._id, {
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: allReviews.length,
    });

    // Notify owner
    const ownerNotif = new Notification({
      userId: booking.ownerId._id,
      type: 'new_review',
      title: 'New Review!',
      message: `${user.name} left a ${rating}-star review for ${booking.listingId.propertyName}`,
      link: '/owner/dashboard',
    });
    await ownerNotif.save();
    emitToUser(booking.ownerId.uid, 'notification:new', ownerNotif);

    res.status(201).json({ success: true, data: { review } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
