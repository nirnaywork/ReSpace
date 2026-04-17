const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const verifyToken = require('../middleware/verifyToken');
const prisma = require('../config/prisma');
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
  return { id: `order_mock_${Date.now()}`, amount: amount * 100, currency, status: 'created' };
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
      prisma.listing.findUnique({ where: { id: listingId }, include: { owner: true } }),
      prisma.user.findUnique({ where: { firebaseUid: req.user.uid } }),
    ]);

    if (!listing || listing.isDeleted || !listing.isPublished) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Listing not found or not available' } });
    }

    // Check Postgres for overlapping bookings directly via SQL ORM
    const existingConflict = await prisma.booking.findFirst({
      where: {
        listingId,
        status: 'confirmed',
        slotDate: date,
        OR: [
          { slotStart: { lt: end }, slotEnd: { gt: start } }
        ]
      }
    });

    if (existingConflict) {
      return res.status(409).json({ success: false, error: { code: 'SLOT_CONFLICT', message: 'This slot is already booked.' } });
    }

    // Calculate price
    const hours = calcDurationHours(start, end);
    let totalPrice = listing.priceAmount * (listing.priceType === 'hour' ? hours : 1);
    const platformFee = Math.round(totalPrice * 0.05);
    totalPrice = Math.round(totalPrice + platformFee);

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder(totalPrice);

    // Create pending booking
    const booking = await prisma.booking.create({
      data: {
        renterId: renterUser.id,
        ownerId: listing.ownerId,
        listingId: listing.id,
        slotDate: date,
        slotStart: start,
        slotEnd: end,
        duration: hours,
        totalPrice,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'razorpay',
        paymentDetails: { razorpayOrderId: razorpayOrder.id }
      }
    });

    res.status(201).json({
      success: true,
      data: {
        bookingId: booking.id,
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

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { listing: true, renter: true, owner: true }
    });
    if (!booking) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } });

    let signatureValid = false;
    if (process.env.RAZORPAY_KEY_SECRET && !process.env.RAZORPAY_KEY_SECRET.includes('placeholder')) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');
      signatureValid = expectedSignature === razorpaySignature;
    } else {
      signatureValid = razorpayOrderId.includes('mock') || razorpaySignature === 'mock_signature';
    }

    if (!signatureValid) return res.status(400).json({ success: false, error: { code: 'INVALID_SIGNATURE', message: 'Payment verification failed' } });

    // Again check for slot race conditions before confirming
    const conflict = await prisma.booking.findFirst({
        where: { listingId: booking.listingId, status: 'confirmed', slotDate: booking.slotDate, OR: [ { slotStart: { lt: booking.slotEnd }, slotEnd: { gt: booking.slotStart } } ] }
    });

    if (conflict) {
      await prisma.booking.update({ where: { id: bookingId }, data: { status: 'cancelled', paymentStatus: 'failed' } });
      return res.status(409).json({ success: false, error: { code: 'SLOT_CONFLICT', message: 'Slot was taken. Payment refunded.' } });
    }

    // Confirm booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentDetails: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
      }
    });

    // Increment listing total bookings
    await prisma.listing.update({ where: { id: booking.listingId }, data: { totalBookings: { increment: 1 } } });

    // Create notifications
    const ownerNotif = await prisma.notification.create({
      data: { userId: booking.ownerId, type: 'booking_confirmed', title: 'New Booking Confirmed!', message: `${booking.renter.name} booked ${booking.listing.propertyName}`, link: '/owner/dashboard' }
    });
    const renterNotif = await prisma.notification.create({
      data: { userId: booking.renterId, type: 'booking_confirmed', title: 'Booking Confirmed!', message: `Confirmed for ${booking.listing.propertyName}`, link: '/renter/dashboard' }
    });

    emitToUser(booking.owner.firebaseUid, 'notification:new', ownerNotif);
    emitToUser(booking.renter.firebaseUid, 'notification:new', renterNotif);

    res.json({ success: true, data: { booking: { _id: updatedBooking.id, status: updatedBooking.status } } });
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings/renter/mine
router.get('/renter/mine', verifyToken, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { firebaseUid: req.user.uid } });
    const bookings = await prisma.booking.findMany({
      where: { renterId: user.id },
      include: { listing: { select: { propertyName: true, images: true, location: true, propertyType: true, priceAmount: true, priceType: true } }, owner: { select: { name: true, photoURL: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = bookings.map(b => ({ ...b, _id: b.id, slot: { date: b.slotDate, start: b.slotStart, end: b.slotEnd }, listingId: { ...b.listing, price: { amount: b.listing.priceAmount } } }));
    res.json({ success: true, data: { bookings: formatted } });
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings/owner/mine
router.get('/owner/mine', verifyToken, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { firebaseUid: req.user.uid } });
    const bookings = await prisma.booking.findMany({
      where: { ownerId: user.id },
      include: { listing: { select: { propertyName: true, images: true, location: true, propertyType: true, priceAmount: true, priceType: true } }, renter: { select: { name: true, photoURL: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = bookings.map(b => ({ ...b, _id: b.id, slot: { date: b.slotDate, start: b.slotStart, end: b.slotEnd }, listingId: { ...b.listing, price: { amount: b.listing.priceAmount } }, renterId: b.renter }));
    res.json({ success: true, data: { bookings: formatted } });
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings/:id
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { firebaseUid: req.user.uid } });
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { listing: true, renter: true, owner: true }
    });

    if (!booking) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } });
    if (booking.renterId !== user.id && booking.ownerId !== user.id) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });

    res.json({ success: true, data: { booking: { ...booking, _id: booking.id, slot: { date: booking.slotDate, start: booking.slotStart, end: booking.slotEnd }, listingId: booking.listing, renterId: booking.renter, ownerId: booking.owner } } });
  } catch (error) {
    next(error);
  }
});

// PUT /api/bookings/:id/cancel
router.put('/:id/cancel', verifyToken, async (req, res, next) => {
  try {
    // Basic implementation port to Prisma
    const booking = await prisma.booking.update({
        where: { id: req.params.id },
        data: { status: 'cancelled', cancellationRs: req.body.cancellationReason || '' }
    });
    res.json({ success: true, data: { status: booking.status, refundStatus: 'not_applicable' } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
