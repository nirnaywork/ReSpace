import { format, formatDistanceToNow, parseISO, isToday, isTomorrow, isThisWeek } from 'date-fns';

/**
 * Format a date string to readable Indian format
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return format(date, 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
};

/**
 * Format date + time together
 */
export const formatDateTime = (dateStr, timeStr) => {
  if (!dateStr) return '';
  const datePart = formatDate(dateStr);
  return timeStr ? `${datePart} at ${timeStr}` : datePart;
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelative = (dateStr) => {
  if (!dateStr) return '';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return '';
  }
};

/**
 * Get upcoming availability label
 */
export const getAvailabilityLabel = (availability) => {
  if (!availability) return null;
  const today = format(new Date(), 'EEE').slice(0, 3);
  if (availability.days?.includes(today)) {
    return { label: 'Available Today', color: 'green' };
  }
  return null;
};

/**
 * Format a member since year from date
 */
export const formatMemberSince = (dateStr) => {
  if (!dateStr) return '';
  try {
    return format(new Date(dateStr), 'MMM yyyy');
  } catch {
    return '';
  }
};

/**
 * Get month label YYYY-MM → "April 2025"
 */
export const formatMonthLabel = (monthStr) => {
  if (!monthStr) return '';
  try {
    const [year, month] = monthStr.split('-');
    return format(new Date(year, month - 1, 1), 'MMMM yyyy');
  } catch {
    return monthStr;
  }
};
