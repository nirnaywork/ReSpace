import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isBefore, startOfDay, addMonths, subMonths } from 'date-fns';
import api from '../../utils/api';

const AvailabilityCalendar = ({ listingId, availability, onDateSelect, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    const monthStr = format(currentMonth, 'yyyy-MM');
    setLoading(true);
    api.get(`/api/listings/${listingId}/availability?month=${monthStr}`)
      .then((res) => {
        if (res.data.success) setBookedSlots(res.data.data.bookedSlots);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [listingId, currentMonth]);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const isFullyBooked = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const daySlots = bookedSlots.filter((s) => s.date === dateStr);
    return daySlots.length >= 8; // arbitrary — full day
  };

  const isOwnerDay = (day) => {
    const dayAbbr = DAY_ABBR[getDay(day)];
    return availability?.days && !availability.days.includes(dayAbbr);
  };

  const isPastDay = (day) => isBefore(day, startOfDay(new Date()));

  const isSelectedDay = (day) => selectedDate && isSameDay(day, new Date(selectedDate));

  const isAvailableDay = (day) => !isPastDay(day) && !isFullyBooked(day) && !isOwnerDay(day);

  // Blank cells for first day offset
  const startOffset = getDay(startOfMonth(currentMonth)); // 0=Sun

  const handleDayClick = (day) => {
    if (!isAvailableDay(day)) return;
    onDateSelect(format(day, 'yyyy-MM-dd'));
  };

  return (
    <div className="space-y-3">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 rounded-lg hover:bg-gray-100 text-brand-dark transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h4 className="font-semibold text-brand-dark text-sm">
          {format(currentMonth, 'MMMM yyyy')}
        </h4>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 rounded-lg hover:bg-gray-100 text-brand-dark transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center text-xs font-semibold text-brand-muted py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className={`grid grid-cols-7 gap-1 ${loading ? 'opacity-50' : ''}`}>
        {/* Blank offset cells */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}

        {days.map((day) => {
          const past = isPastDay(day);
          const ownerOff = isOwnerDay(day);
          const fullBooked = isFullyBooked(day);
          const selected = isSelectedDay(day);
          const available = isAvailableDay(day);

          return (
            <button
              key={format(day, 'yyyy-MM-dd')}
              onClick={() => handleDayClick(day)}
              disabled={!available}
              title={
                past ? 'Past date' :
                ownerOff ? 'Not available' :
                fullBooked ? 'Fully booked' :
                'Available'
              }
              className={`
                w-full aspect-square flex items-center justify-center text-xs font-medium rounded-lg transition-all
                ${selected ? 'bg-brand-red text-white shadow-md scale-110' : ''}
                ${!selected && available ? 'hover:bg-red-50 hover:text-brand-red text-brand-dark cursor-pointer' : ''}
                ${(past || ownerOff) && !selected ? 'text-gray-300 cursor-not-allowed bg-gray-50' : ''}
                ${fullBooked && !past && !selected ? 'text-gray-400 bg-gray-100 cursor-not-allowed line-through' : ''}
              `}
              aria-label={`${format(day, 'd MMM')}${selected ? ' (selected)' : ''}`}
              aria-pressed={selected}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-brand-muted pt-1">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-brand-red inline-block"></span> Selected</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100 border border-gray-200 inline-block"></span> Unavailable</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-white border border-gray-200 inline-block"></span> Available</span>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
