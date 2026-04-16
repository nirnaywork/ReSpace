import React from 'react';
import { Clock } from 'lucide-react';

const TimeSlotPicker = ({ availability, bookedSlots, selectedDate, selectedStart, selectedEnd, onSlotSelect }) => {
  // Generate time slots from availability
  const generateSlots = () => {
    const slots = [];
    if (!availability) return slots;

    // Use custom slots if available
    if (availability.customSlots?.length) {
      return availability.customSlots;
    }

    // Generate from openTime/closeTime in 1-hour increments
    const toMin = (t) => {
      if (!t) return 0;
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const fromMin = (m) => {
      const h = Math.floor(m / 60);
      const min = m % 60;
      return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    };

    const open = toMin(availability.openTime || '09:00');
    const close = toMin(availability.closeTime || '18:00');

    for (let t = open; t + 60 <= close; t += 60) {
      slots.push({ start: fromMin(t), end: fromMin(t + 60) });
    }
    return slots;
  };

  const isSlotBooked = (slot) => {
    if (!selectedDate || !bookedSlots) return false;
    return bookedSlots.some(
      (b) =>
        b.date === selectedDate &&
        !(slot.end <= b.start || slot.start >= b.end)
    );
  };

  const isSlotSelected = (slot) => slot.start === selectedStart && slot.end === selectedEnd;

  const slots = generateSlots();

  if (!selectedDate) {
    return (
      <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-brand-border">
        <Clock className="w-8 h-8 text-brand-muted mx-auto mb-2" />
        <p className="text-sm text-brand-muted">Select a date above to see available time slots</p>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <p className="text-sm text-brand-muted text-center py-4">
        No time slots configured for this space.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-brand-dark">Available Time Slots</h4>
      <div className="grid grid-cols-2 gap-2">
        {slots.map((slot, idx) => {
          const booked = isSlotBooked(slot);
          const selected = isSlotSelected(slot);

          return (
            <button
              key={idx}
              disabled={booked}
              onClick={() => !booked && onSlotSelect(slot)}
              title={booked ? 'Already booked' : `Select ${slot.start}–${slot.end}`}
              className={`
                text-xs font-medium py-2 px-3 rounded-lg border transition-all text-center
                ${selected ? 'bg-brand-red text-white border-brand-red shadow-sm' : ''}
                ${!selected && !booked ? 'border-brand-border bg-white text-brand-dark hover:border-brand-red hover:text-brand-red hover:bg-red-50 cursor-pointer' : ''}
                ${booked && !selected ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through' : ''}
              `}
              aria-pressed={selected}
              aria-label={`${slot.start} to ${slot.end}${booked ? ' (booked)' : ''}`}
            >
              {slot.start} – {slot.end}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TimeSlotPicker;
