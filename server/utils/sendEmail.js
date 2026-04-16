const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
  });
};

const emailTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ReSpace Notification</title>
  <style>
    body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background: #F9F6F0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: #731919; padding: 24px 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px; }
    .body { padding: 32px; color: #303234; line-height: 1.6; }
    .body h2 { font-size: 20px; font-weight: 600; margin: 0 0 16px; color: #303234; }
    .body p { margin: 0 0 16px; font-size: 15px; color: #4B5563; }
    .info-box { background: #F9F6F0; border-radius: 8px; padding: 16px 20px; margin: 20px 0; border-left: 4px solid #731919; }
    .info-box p { margin: 4px 0; font-size: 14px; }
    .info-box strong { color: #303234; }
    .btn { display: inline-block; background: #731919; color: white !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 16px 0; }
    .footer { background: #303234; padding: 20px 32px; text-align: center; }
    .footer p { color: rgba(255,255,255,0.6); font-size: 12px; margin: 4px 0; }
    .footer a { color: rgba(255,255,255,0.8); text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ReSpace</h1>
      <p>India's Commercial Space Rental Platform</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>© 2025 ReSpace. All rights reserved.</p>
      <p>You're receiving this because you have an account on ReSpace. <a href="#">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
`;

const sendEmail = async ({ to, subject, content }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_USER.includes('your_')) {
      console.log(`📧 [Dev Email Skipped] To: ${to} | Subject: ${subject}`);
      return { success: true, dev: true };
    }

    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"ReSpace" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: emailTemplate(content),
    });
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email send error to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

// Specific email templates
const sendBookingConfirmationToRenter = async ({ renter, listing, booking }) => {
  return sendEmail({
    to: renter.email,
    subject: `Your booking at ${listing.propertyName} is confirmed! 🎉`,
    content: `
      <h2>Booking Confirmed!</h2>
      <p>Hi ${renter.name}, your booking has been confirmed successfully.</p>
      <div class="info-box">
        <p><strong>Space:</strong> ${listing.propertyName}</p>
        <p><strong>Date:</strong> ${booking.slot.date}</p>
        <p><strong>Time:</strong> ${booking.slot.start} – ${booking.slot.end}</p>
        <p><strong>Address:</strong> ${listing.location.address}</p>
        <p><strong>Amount Paid:</strong> ₹${booking.totalPrice.toLocaleString('en-IN')}</p>
        <p><strong>Booking ID:</strong> ${booking._id}</p>
      </div>
      <p>Please be on time and carry a valid ID for verification at the venue.</p>
      <a href="${process.env.CLIENT_URL}/renter/dashboard" class="btn">View My Bookings</a>
    `,
  });
};

const sendNewBookingToOwner = async ({ owner, renter, listing, booking }) => {
  return sendEmail({
    to: owner.email,
    subject: `You have a new booking for ${listing.propertyName}! 🏢`,
    content: `
      <h2>New Booking Received!</h2>
      <p>Hi ${owner.name}, you have a new booking for your space.</p>
      <div class="info-box">
        <p><strong>Renter:</strong> ${renter.name} (${renter.email})</p>
        <p><strong>Space:</strong> ${listing.propertyName}</p>
        <p><strong>Date:</strong> ${booking.slot.date}</p>
        <p><strong>Time:</strong> ${booking.slot.start} – ${booking.slot.end}</p>
        <p><strong>Amount:</strong> ₹${booking.totalPrice.toLocaleString('en-IN')}</p>
      </div>
      <a href="${process.env.CLIENT_URL}/owner/dashboard" class="btn">View in Dashboard</a>
    `,
  });
};

const sendCancellationEmail = async ({ to, name, listing, booking, isOwner }) => {
  return sendEmail({
    to,
    subject: `Booking cancelled — ${listing.propertyName} on ${booking.slot.date}`,
    content: `
      <h2>Booking Cancelled</h2>
      <p>Hi ${name}, a booking has been cancelled.</p>
      <div class="info-box">
        <p><strong>Space:</strong> ${listing.propertyName}</p>
        <p><strong>Date:</strong> ${booking.slot.date}</p>
        <p><strong>Time:</strong> ${booking.slot.start} – ${booking.slot.end}</p>
        ${booking.cancellationReason ? `<p><strong>Reason:</strong> ${booking.cancellationReason}</p>` : ''}
      </div>
      ${isOwner ? '' : '<p>If you are eligible for a refund, it will be processed within 5-7 business days.</p>'}
      <a href="${process.env.CLIENT_URL}/${isOwner ? 'owner' : 'renter'}/dashboard" class="btn">View Dashboard</a>
    `,
  });
};

const sendRefundEmail = async ({ renter, amount, booking }) => {
  return sendEmail({
    to: renter.email,
    subject: `Your refund of ₹${amount.toLocaleString('en-IN')} has been initiated`,
    content: `
      <h2>Refund Initiated ✅</h2>
      <p>Hi ${renter.name}, your refund has been successfully initiated.</p>
      <div class="info-box">
        <p><strong>Refund Amount:</strong> ₹${amount.toLocaleString('en-IN')}</p>
        <p><strong>Booking ID:</strong> ${booking._id}</p>
        <p><strong>Expected Credit:</strong> 5-7 business days</p>
      </div>
      <p>The amount will be credited to your original payment method.</p>
    `,
  });
};

const sendNewReviewEmail = async ({ owner, renter, listing, review }) => {
  return sendEmail({
    to: owner.email,
    subject: `${renter.name} left a review for ${listing.propertyName} ⭐`,
    content: `
      <h2>New Review Received!</h2>
      <p>Hi ${owner.name}, you just received a new review.</p>
      <div class="info-box">
        <p><strong>Space:</strong> ${listing.propertyName}</p>
        <p><strong>Reviewer:</strong> ${renter.name}</p>
        <p><strong>Rating:</strong> ${'⭐'.repeat(review.rating)} (${review.rating}/5)</p>
        ${review.comment ? `<p><strong>Comment:</strong> "${review.comment}"</p>` : ''}
      </div>
      <a href="${process.env.CLIENT_URL}/owner/dashboard" class="btn">Reply to Review</a>
    `,
  });
};

module.exports = {
  sendEmail,
  sendBookingConfirmationToRenter,
  sendNewBookingToOwner,
  sendCancellationEmail,
  sendRefundEmail,
  sendNewReviewEmail,
};
