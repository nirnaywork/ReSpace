/**
 * Check if two time slots overlap
 * @param {string} start1 - "HH:MM"
 * @param {string} end1   - "HH:MM"
 * @param {string} start2 - "HH:MM"
 * @param {string} end2   - "HH:MM"
 */
const slotsOverlap = (start1, end1, start2, end2) => {
  const toMin = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const s1 = toMin(start1);
  const e1 = toMin(end1);
  const s2 = toMin(start2);
  const e2 = toMin(end2);
  return s1 < e2 && s2 < e1;
};

/**
 * Check if a requested slot conflicts with existing booked slots
 */
const hasSlotConflict = (bookedSlots, date, start, end) => {
  return bookedSlots.some(
    (slot) =>
      slot.date === date && slotsOverlap(slot.start, slot.end, start, end)
  );
};

/**
 * Calculate duration in hours between two HH:MM times
 */
const calcDurationHours = (start, end) => {
  const toMin = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  return (toMin(end) - toMin(start)) / 60;
};

/**
 * Generate available time slots for a listing on a given day
 */
const generateSlots = (openTime, closeTime, intervalMinutes = 60) => {
  const slots = [];
  const toMin = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const fromMin = (m) => {
    const h = Math.floor(m / 60);
    const min = m % 60;
    return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  };

  let current = toMin(openTime);
  const close = toMin(closeTime);

  while (current + intervalMinutes <= close) {
    slots.push({ start: fromMin(current), end: fromMin(current + intervalMinutes) });
    current += intervalMinutes;
  }
  return slots;
};

/**
 * Get day of week abbreviation from date string (YYYY-MM-DD)
 */
const getDayAbbr = (dateStr) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const d = new Date(dateStr);
  return days[d.getDay()];
};

module.exports = { slotsOverlap, hasSlotConflict, calcDurationHours, generateSlots, getDayAbbr };
