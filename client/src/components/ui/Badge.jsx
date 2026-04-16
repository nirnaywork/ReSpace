import React from 'react';

const variants = {
  verified: 'badge-verified',
  refund: 'badge-refund',
  'no-refund': 'badge-no-refund',
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
  warehouse: 'bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full',
  kitchen: 'bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-1 rounded-full',
  'event-hall': 'bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full',
  'office-space': 'bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-1 rounded-full',
  'parking-space': 'bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full',
  other: 'bg-pink-100 text-pink-800 text-xs font-semibold px-2.5 py-1 rounded-full',
};

const PROPERTY_TYPE_VARIANT = {
  'Warehouse': 'warehouse',
  'Kitchen': 'kitchen',
  'Event Hall': 'event-hall',
  'Office Space': 'office-space',
  'Parking Space': 'parking-space',
  'Other': 'other',
};

const Badge = ({ children, variant = 'verified', className = '', icon, propertyType }) => {
  const resolvedVariant = propertyType ? (PROPERTY_TYPE_VARIANT[propertyType] || 'other') : variant;
  return (
    <span className={`${variants[resolvedVariant] || 'badge-verified'} inline-flex items-center gap-1 ${className}`}>
      {icon && icon}
      {children}
    </span>
  );
};

export default Badge;
