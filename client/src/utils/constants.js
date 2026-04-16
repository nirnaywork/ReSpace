export const PROPERTY_TYPES = [
  'Warehouse',
  'Kitchen',
  'Event Hall',
  'Office Space',
  'Parking Space',
  'Other',
];

export const AMENITIES = [
  'WiFi',
  'Power Backup',
  'Parking',
  'AC',
  'CCTV',
  'Security Guard',
  'Generator',
  'Cafeteria',
  'Lift',
  'Restroom',
];

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const PRICE_TYPES = [
  { value: 'hour', label: 'Per Hour' },
  { value: 'day', label: 'Per Day' },
  { value: 'week', label: 'Per Week' },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
];

export const PROPERTY_TYPE_COLORS = {
  'Warehouse': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  'Kitchen': { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
  'Event Hall': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  'Office Space': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  'Parking Space': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
  'Other': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
};

export const BOOKING_STATUS_COLORS = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
};

export const PLATFORM_FEE_PERCENT = 5;

export const POPULAR_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Surat', 'Jaipur',
];

export const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'Food Entrepreneur, Mumbai',
    quote: 'ReSpace helped me find the perfect shared kitchen for my catering business. Saved me ₹3 lakhs in setup costs!',
    initials: 'PS',
  },
  {
    name: 'Arjun Mehta',
    role: 'Event Planner, Hyderabad',
    quote: 'I booked three event halls through ReSpace last month. The booking process is seamless and the spaces are exactly as described.',
    initials: 'AM',
  },
  {
    name: 'Kavitha Reddy',
    role: 'Warehouse Owner, Chennai',
    quote: 'My warehouse was sitting idle for 8 months. ReSpace helped me earn ₹45,000 in the first month alone!',
    initials: 'KR',
  },
];

export const BUSINESS_TYPES = [
  'Food Business',
  'Event Planning',
  'E-commerce Storage',
  'Freelance/Creative Studio',
  'Other',
];

export const HOW_IT_WORKS_RENTER = [
  { step: 1, title: 'Search', desc: 'Find spaces by type, location, and price.' },
  { step: 2, title: 'Book', desc: 'Select your slot and pay securely online.' },
  { step: 3, title: 'Use', desc: 'Show your confirmation and get started.' },
];

export const HOW_IT_WORKS_OWNER = [
  { step: 1, title: 'List', desc: 'Add your space with photos and pricing.' },
  { step: 2, title: 'Get Booked', desc: 'Receive booking requests from verified renters.' },
  { step: 3, title: 'Earn', desc: 'Get paid directly to your account.' },
];
