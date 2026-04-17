/**
 * Static fallback listings data — shown when the API is unreachable.
 * Hardcoded based on precise user specifications. No images included.
 */
const FALLBACK_LISTINGS = [
  // ── WAREHOUSES ──
  {
    _id: "seed_wh_1",
    propertyName: "Industrial Warehouse – Shadnagar",
    propertyType: "Warehouse",
    description: "Large open industrial shed. Truck access & loading docks. Basic utilities (power + water). Suitable for logistics/storage.",
    location: { address: "Shadnagar", city: "Hyderabad", state: "Telangana", pincode: "509216" },
    price: { amount: 1000000, type: "week", currency: "INR" },
    refundPolicy: true,
    availability: { days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], openTime: "00:00", closeTime: "23:59", customSlots: [] },
    amenities: ["Power Backup", "Parking", "Restroom"],
    images: [],
    isVerified: true, isPublished: true, avgRating: 4.5, reviewCount: 12, ownerId: { name: "System Admin", isVerified: true }
  },
  {
    _id: "seed_wh_2",
    propertyName: "Compact Storage Warehouse",
    propertyType: "Warehouse",
    description: "Ideal for small businesses. Easy road connectivity. Secure gated area. Basic maintenance support.",
    location: { address: "Keesara", city: "Hyderabad", state: "Telangana", pincode: "501301" },
    price: { amount: 52000, type: "week", currency: "INR" },
    refundPolicy: true,
    availability: { days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], openTime: "00:00", closeTime: "23:59", customSlots: [] },
    amenities: ["Security Guard", "Parking"],
    images: [],
    isVerified: true, isPublished: true, avgRating: 4.2, reviewCount: 8, ownerId: { name: "System Admin", isVerified: true }
  },
  {
    _id: "seed_wh_3",
    propertyName: "Kirby Structure Warehouse",
    propertyType: "Warehouse",
    description: "VDF flooring (industrial-grade). 24x7 security. Loading/unloading bays. Parking for trucks.",
    location: { address: "Patancheru", city: "Hyderabad", state: "Telangana", pincode: "502319" },
    price: { amount: 250000, type: "week", currency: "INR" },
    refundPolicy: true,
    availability: { days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], openTime: "00:00", closeTime: "23:59", customSlots: [] },
    amenities: ["Security Guard", "Parking", "CCTV", "Power Backup"],
    images: [],
    isVerified: true, isPublished: true, avgRating: 4.8, reviewCount: 22, ownerId: { name: "System Admin", isVerified: true }
  },
  {
    _id: "seed_wh_4",
    propertyName: "Reddy Basthi Warehouse",
    propertyType: "Warehouse",
    description: "Semi-furnished. Close to city center. Suitable for retail storage. Easy access to main roads.",
    location: { address: "Champapet", city: "Hyderabad", state: "Telangana", pincode: "500079" },
    price: { amount: 180000, type: "week", currency: "INR" },
    refundPolicy: true,
    availability: { days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], openTime: "00:00", closeTime: "23:59", customSlots: [] },
    amenities: ["Parking", "Power Backup"],
    images: [],
    isVerified: true, isPublished: true, avgRating: 4.1, reviewCount: 15, ownerId: { name: "System Admin", isVerified: true }
  },
  {
    _id: "seed_wh_5",
    propertyName: "IDA Rampur Warehouse",
    propertyType: "Warehouse",
    description: "RCC structure with 25 ft height. Transformer power supply. Parking for multiple trucks. Industrial zone location.",
    location: { address: "Kazipet", city: "Warangal", state: "Telangana", pincode: "506003" },
    price: { amount: 70000, type: "week", currency: "INR" },
    refundPolicy: true,
    availability: { days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], openTime: "00:00", closeTime: "23:59", customSlots: [] },
    amenities: ["Power Backup", "Parking", "Security Guard"],
    images: [],
    isVerified: true, isPublished: true, avgRating: 4.6, reviewCount: 18, ownerId: { name: "System Admin", isVerified: true }
  },

  // ── KITCHENS ──
  {
    _id: "seed_kit_1",
    propertyName: "Co-sharing Cloud Kitchen Space",
    propertyType: "Kitchen",
    description: "Shared cooking stations. Basic exhaust & drainage setup. Suitable for startups. Delivery-friendly location.",
    location: { address: "Bowenpally", city: "Secunderabad", state: "Telangana", pincode: "500011" },
    price: { amount: 25000, type: "week", currency: "INR" },
    refundPolicy: true,
    availability: { days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], openTime: "00:00", closeTime: "23:59", customSlots: [] },
    amenities: ["Power Backup", "Restroom"],
    images: [],
    isVerified: true, isPublished: true, avgRating: 4.3, reviewCount: 45, ownerId: { name: "System Admin", isVerified: true }
  },
  {
    _id: "seed_kit_2",
    propertyName: "Starter Cloud Kitchen Unit",
    propertyType: "Kitchen",
    description: "Compact kitchen setup. Suitable for takeaway/delivery. Low entry cost. Basic utilities included.",
    location: { address: "Ayyappa Society", city: "Hyderabad", state: "Telangana", pincode: "500081" },
    price: { amount: 30000, type: "week", currency: "INR" },
    refundPolicy: true,
    availability: { days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], openTime: "00:00", closeTime: "23:59", customSlots: [] },
    amenities: ["Power Backup", "Parking"],
    images: [],
    isVerified: true, isPublished: true, avgRating: 4.5, reviewCount: 32, ownerId: { name: "System Admin", isVerified: true }
  },
  {
    _id: "seed_kit_3",
    propertyName: "Dual Kitchen Rental Space",
    propertyType: "Kitchen",
    description: "Two kitchen units available. Located near IT hub. High delivery demand zone. Suitable for scaling brands.",
    location: { address: "Madhapur", city: "Hyderabad", state: "Telangana", pincode: "500081" },
    price: { amount: 45000, type: "week", currency: "INR" },
    refundPolicy: true,
    availability: { days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], openTime: "00:00", closeTime: "23:59", customSlots: [] },
    amenities: ["Power Backup", "Restroom", "Parking"],
    images: [],
    isVerified: true, isPublished: true, avgRating: 4.7, reviewCount: 56, ownerId: { name: "System Admin", isVerified: true }
  },
  {
    _id: "seed_kit_4",
    propertyName: "Ground Floor Kitchen Space",
    propertyType: "Kitchen",
    description: "Ground + first floor options. Multi-purpose (kitchen/godown). Road connectivity. Suitable for small food brands.",
    location: { address: "Masab Tank", city: "Hyderabad", state: "Telangana", pincode: "500028" },
    price: { amount: 25000, type: "week", currency: "INR" },
    refundPolicy: true,
    availability: { days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], openTime: "00:00", closeTime: "23:59", customSlots: [] },
    amenities: ["Power Backup"],
    images: [],
    isVerified: true, isPublished: true, avgRating: 4.0, reviewCount: 19, ownerId: { name: "System Admin", isVerified: true }
  },
  {
    _id: "seed_kit_5",
    propertyName: "Modular Kitchen Pod",
    propertyType: "Kitchen",
    description: "Fully equipped kitchen. Shared cleaning & maintenance. Scalable (multiple pods available). Integrated with delivery platforms.",
    location: { address: "HITEC City / Financial District", city: "Hyderabad", state: "Telangana", pincode: "500081" },
    price: { amount: 70000, type: "week", currency: "INR" }, 
    refundPolicy: true,
    availability: { days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], openTime: "00:00", closeTime: "23:59", customSlots: [] },
    amenities: ["Power Backup", "WiFi", "Security Guard", "CCTV"],
    images: [],
    isVerified: true, isPublished: true, avgRating: 4.9, reviewCount: 88, ownerId: { name: "System Admin", isVerified: true }
  },

  // ── EVENT HALLS ──
  {
    _id: "seed_eh_1",
    propertyName: "Hi Tech Garden Function Hall",
    propertyType: "Event Hall",
    description: "Stage + seating setup. Basic lighting & fans/AC (varies). Parking space. Suitable for small weddings & birthdays.",
    location: { address: "Malakpet", city: "Hyderabad", state: "Telangana", pincode: "500036" },
    price: { amount: 30000, type: "day", currency: "INR" },
    refundPolicy: true,
    availability: { days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], openTime: "06:00", closeTime: "23:00", customSlots: [] },
    amenities: ["Parking", "Power Backup", "AC"],
    images: [],
    isVerified: true, isPublished: true, avgRating: 4.3, reviewCount: 40, ownerId: { name: "System Admin", isVerified: true }
  },
  {
    _id: "seed_eh_2",
    propertyName: "KMC Community Hall",
    propertyType: "Event Hall",
    description: "Budget-friendly hall. Open catering allowed. Basic seating arrangements. Good for local events.",
    location: { address: "Kukatpally", city: "Hyderabad", state: "Telangana", pincode: "500072" },
    price: { amount: 20000, type: "day", currency: "INR" },
    refundPolicy: true,
    availability: { days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], openTime: "06:00", closeTime: "23:00", customSlots: [] },
    amenities: ["Power Backup"],
    images: [],
    isVerified: true, isPublished: true, avgRating: 4.1, reviewCount: 25, ownerId: { name: "System Admin", isVerified: true }
  },
  {
    _id: "seed_eh_3",
    propertyName: "Park Exotica Mini Hall",
    propertyType: "Event Hall",
    description: "Ideal for 20-40 people. Resort-style environment. Projector & seating setup. Suitable for corporate/small parties.",
    location: { address: "Kismatpur", city: "Hyderabad", state: "Telangana", pincode: "500030" },
    price: { amount: 30000, type: "day", currency: "INR" },
    refundPolicy: true,
    availability: { days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], openTime: "06:00", closeTime: "23:00", customSlots: [] },
    amenities: ["AC", "WiFi", "Power Backup", "Parking"],
    images: [],
    isVerified: true, isPublished: true, avgRating: 4.8, reviewCount: 60, ownerId: { name: "System Admin", isVerified: true }
  },
  {
    _id: "seed_eh_4",
    propertyName: "Shubham Palace Function Hall",
    propertyType: "Event Hall",
    description: "Capacity: 300-600 people. Stage + LED screens. Power backup. Suitable for weddings & receptions.",
    location: { address: "Karmanghat", city: "Hyderabad", state: "Telangana", pincode: "500079" },
    price: { amount: 65000, type: "day", currency: "INR" },
    refundPolicy: true,
    availability: { days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], openTime: "06:00", closeTime: "23:00", customSlots: [] },
    amenities: ["AC", "Power Backup", "Parking", "Security Guard"],
    images: [],
    isVerified: true, isPublished: true, avgRating: 4.6, reviewCount: 82, ownerId: { name: "System Admin", isVerified: true }
  },
  {
    _id: "seed_eh_5",
    propertyName: "Pandit Deendayal Auditorium Hall",
    propertyType: "Event Hall",
    description: "Large auditorium seating. Stage + lighting. Budget-friendly government venue. Suitable for cultural/corporate events.",
    location: { address: "Bodakdev", city: "Ahmedabad", state: "Gujarat", pincode: "380054" },
    price: { amount: 20000, type: "day", currency: "INR" },
    refundPolicy: false,
    availability: { days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], openTime: "06:00", closeTime: "23:00", customSlots: [] },
    amenities: ["AC", "Power Backup", "Parking"],
    images: [],
    isVerified: true, isPublished: true, avgRating: 4.5, reviewCount: 115, ownerId: { name: "System Admin", isVerified: true }
  },

  // ── OFFICES ──
  {
    _id: "seed_of_1",
    propertyName: "5-Seater Plug & Play Office",
    propertyType: "Office Space",
    description: "Fully furnished desks & chairs. Internet-ready setup. Ideal for freelancers/startups. Ready-to-move workspace.",
    location: { address: "Basheerbagh", city: "Hyderabad", state: "Telangana", pincode: "500029" },
    price: { amount: 12000, type: "week", currency: "INR" },
    refundPolicy: true,
    availability: { days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], openTime: "08:00", closeTime: "20:00", customSlots: [] },
    amenities: ["AC", "WiFi", "Power Backup", "Lift"],
    images: [],
    isVerified: true, isPublished: true, avgRating: 4.0, reviewCount: 14, ownerId: { name: "System Admin", isVerified: true }
  },
  {
    _id: "seed_of_2",
    propertyName: "Mid-size Furnished Office",
    propertyType: "Office Space",
    description: "Cabins + workstation layout. Conference room access. Power backup. Good commercial connectivity.",
    location: { address: "Begumpet", city: "Hyderabad", state: "Telangana", pincode: "500016" },
    price: { amount: 52000, type: "week", currency: "INR" },
    refundPolicy: true,
    availability: { days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], openTime: "08:00", closeTime: "20:00", customSlots: [] },
    amenities: ["AC", "WiFi", "Power Backup", "Parking", "Lift"],
    images: [],
    isVerified: true, isPublished: true, avgRating: 4.4, reviewCount: 29, ownerId: { name: "System Admin", isVerified: true }
  },
  {
    _id: "seed_of_3",
    propertyName: "20-100 Seater Co-working Office",
    propertyType: "Office Space",
    description: "Shared office infrastructure. Meeting rooms + pantry. High-speed internet. Flexible scaling options.",
    location: { address: "Kukatpally", city: "Hyderabad", state: "Telangana", pincode: "500072" },
    price: { amount: 6000, type: "week", currency: "INR" }, // 6000 per seat approx 
    refundPolicy: true,
    availability: { days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], openTime: "08:00", closeTime: "20:00", customSlots: [] },
    amenities: ["AC", "WiFi", "Power Backup", "Cafeteria", "Lift"],
    images: [],
    isVerified: true, isPublished: true, avgRating: 4.7, reviewCount: 110, ownerId: { name: "System Admin", isVerified: true }
  },
  {
    _id: "seed_of_4",
    propertyName: "40 Workstation Office Space",
    propertyType: "Office Space",
    description: "Large team capacity. IT hub location. Plug & play setup. Suitable for startups/scaling teams.",
    location: { address: "Madhapur", city: "Hyderabad", state: "Telangana", pincode: "500081" },
    price: { amount: 150000, type: "week", currency: "INR" },
    refundPolicy: true,
    availability: { days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], openTime: "08:00", closeTime: "20:00", customSlots: [] },
    amenities: ["AC", "WiFi", "Power Backup", "Parking", "Security Guard", "Lift"],
    images: [],
    isVerified: true, isPublished: true, avgRating: 4.6, reviewCount: 45, ownerId: { name: "System Admin", isVerified: true }
  },
  {
    _id: "seed_of_5",
    propertyName: "Basic Commercial Office Unit",
    propertyType: "Office Space",
    description: "Empty customizable space. Ideal for small businesses. Road-facing property. Affordable rent range.",
    location: { address: "Sanjeeva Reddy Nagar", city: "Hyderabad", state: "Telangana", pincode: "500038" },
    price: { amount: 20000, type: "week", currency: "INR" },
    refundPolicy: true,
    availability: { days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], openTime: "08:00", closeTime: "20:00", customSlots: [] },
    amenities: ["Power Backup", "Lift"],
    images: [],
    isVerified: true, isPublished: true, avgRating: 3.9, reviewCount: 12, ownerId: { name: "System Admin", isVerified: true }
  },

  // ── PARKING ──
  {
    _id: "seed_pk_1",
    propertyName: "Open Car Parking Space",
    propertyType: "Parking Space",
    description: "Open ground parking. Suitable for cars & bikes. 24x7 access. Residential area safety.",
    location: { address: "Tirupati", city: "Tirupati", state: "Andhra Pradesh", pincode: "517501" },
    price: { amount: 2000, type: "week", currency: "INR" },
    refundPolicy: true,
    availability: { days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], openTime: "00:00", closeTime: "23:59", customSlots: [] },
    amenities: ["Parking"],
    images: [],
    isVerified: true, isPublished: true, avgRating: 4.1, reviewCount: 30, ownerId: { name: "System Admin", isVerified: true }
  },
  {
    _id: "seed_pk_2",
    propertyName: "Covered Parking Garage",
    propertyType: "Parking Space",
    description: "Covered shed protection. Suitable for long-term parking. Secure enclosed space. Ideal for cars.",
    location: { address: "Anantharajupuram", city: "Anantharajupuram", state: "Andhra Pradesh", pincode: "516101" },
    price: { amount: 3000, type: "week", currency: "INR" },
    refundPolicy: true,
    availability: { days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], openTime: "00:00", closeTime: "23:59", customSlots: [] },
    amenities: ["Parking", "Security Guard"],
    images: [],
    isVerified: true, isPublished: true, avgRating: 4.5, reviewCount: 22, ownerId: { name: "System Admin", isVerified: true }
  },
  {
    _id: "seed_pk_3",
    propertyName: "RAVITEJA PARKING SPACE",
    propertyType: "Parking Space",
    description: "Dedicated bike parking. Near railway station. Budget-friendly. Easy access location.",
    location: { address: "Ongole", city: "Ongole", state: "Andhra Pradesh", pincode: "523001" },
    price: { amount: 1000, type: "week", currency: "INR" },
    refundPolicy: false,
    availability: { days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], openTime: "00:00", closeTime: "23:59", customSlots: [] },
    amenities: ["Parking"],
    images: [],
    isVerified: true, isPublished: true, avgRating: 4.2, reviewCount: 55, ownerId: { name: "System Admin", isVerified: true }
  },
  {
    _id: "seed_pk_4",
    propertyName: "S2 Parking Lot",
    propertyType: "Parking Space",
    description: "Hourly parking model. Suitable for short stays. Near commercial area. Multi-vehicle support.",
    location: { address: "Nellore", city: "Nellore", state: "Andhra Pradesh", pincode: "524001" },
    price: { amount: 50, type: "hour", currency: "INR" },
    refundPolicy: false,
    availability: { days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], openTime: "00:00", closeTime: "23:59", customSlots: [] },
    amenities: ["Parking", "CCTV", "Security Guard"],
    images: [],
    isVerified: true, isPublished: true, avgRating: 4.8, reviewCount: 140, ownerId: { name: "System Admin", isVerified: true }
  },
  {
    _id: "seed_pk_5",
    propertyName: "Heavy Vehicle Parking Yard",
    propertyType: "Parking Space",
    description: "Large open yard. Suitable for trucks & vans. Easy highway access. Ideal for logistics.",
    location: { address: "Rajupalem", city: "Rajupalem", state: "Andhra Pradesh", pincode: "522413" },
    price: { amount: 200, type: "day", currency: "INR" },
    refundPolicy: true,
    availability: { days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], openTime: "00:00", closeTime: "23:59", customSlots: [] },
    amenities: ["Parking", "Security Guard"],
    images: [],
    isVerified: true, isPublished: true, avgRating: 4.6, reviewCount: 45, ownerId: { name: "System Admin", isVerified: true }
  }
];

export default FALLBACK_LISTINGS;
