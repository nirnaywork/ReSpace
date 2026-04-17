# ReSpace 🏢: Unlock Your Space

ReSpace is India's premier commercial infrastructure rental platform. It bridges the gap between idle commercial assets and businesses needing flexible, specialized spaces.

---

## 🛑 The Problem: Underutilized Commercial Assets
Commercial real estate is plagued by inefficiency:
- **Rigid Long-Term Leases**: Small businesses and cloud kitchens are often forced into 1-3 year commitments, which is a death sentence for agility.
- **Wasted Infrastructure**: Millions of square feet of specialized space (warehouses, event halls, parking) sit idle during off-peak hours.
- **Discovery Gap**: Finding a specialized space (like a food-grade kitchen) for just a few days is nearly impossible through traditional brokers.

## ✅ The Solution: ReSpace
ReSpace provides a **"Posh" Marketplace** for flexible, short-term specialized spaces:
- **On-Demand Flexibility**: Rent by the hour, day, or week.
- **Niche Specialization**: Optimized for Warehouses, Kitchens, Event Halls, Offices, and Parking.
- **Trust-First Ecosystem**: Automated verification, real-time availability, and secure payments.
- **AI-Powered Matching**: Instantly discover the perfect space based on specific business needs.

---

## 🔄 Website Flow

### 👤 For Renters (Discovery to Booking)
1. **Search & Filter**: Browse cinematic listings with filters for property type, price, and amenities.
2. **AI Smart Match**: Describe your business goal to our AI Chatbot (e.g., "I need a kitchen for a 3-day catering event in Mumbai") to get instant recommendations.
3. **Availability Check**: Use the interactive calendar to find open slots in real-time.
4. **Secure Checkout**: Pay via Razorpay with automated platform fee calculation and instant booking confirmation.
5. **Dashboard Management**: Track all current and past bookings in a centralized renter dashboard.

### 💼 For Owners (Listing to Management)
1. **List Your Space**: A structured, multi-step onboarding process to capture all property details and images.
2. **Owner Dashboard**: Manage listings, track booking requests, and respond to renter queries.
3. **Analytics**: Monitor earnings and space utilization metrics at a glance.
4. **Verified Status**: Gain trust with the "Verified Space" badge upon site audit.

---

## ✨ Key Features
- **Dual-Role Architecture**: Seamlessly switch between Owner and Renter modes under a single account.
- **Posh UI/UX**: Cinematic, dark-themed design system with smooth animations and responsive layouts.
- **AI Intelligent Search**: Powered by **Groq (Llama 3)** for natural language space discovery.
- **Real-Time Booking**: Interactive Availability Calendar and Time Slot Picker.
- **Integrated Payments**: Secure, localized payment processing via **Razorpay**.
- **Real-Time Notifications**: Instant updates on booking status via **Socket.io**.
- **Verified Listings**: Quality assurance through a robust verification badge system.

---

## 🛠️ Tech Stack

### Frontend (Client)
- **React 19 + Vite**: High-performance, snappy single-page application.
- **Tailwind CSS**: Custom "Posh" design system with deep-dark and warm-crimson colors.
- **Lucide React**: Modern, scalable icon set.
- **React Router DOM**: Client-side navigation.
- **Framer Motion**: Smooth micro-animations.

### Backend (Server)
- **Node.js + Express**: Scalable API architecture.
- **Prisma + Supabase (PostgreSQL)**: Modern ORM for precise data modeling and secure cloud storage.
- **Firebase Auth**: Enterprise-grade user authentication and profile management.
- **Groq AI (Llama 3.3)**: High-speed LLM integration for smart matching.
- **Socket.io**: Bi-directional communication for real-time notifications.
- **Multer**: Multi-file image uploading.

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/nirnaywork/ReSpace.git
cd ReSpace

# Install Server Dependencies
cd server && npm install

# Install Client Dependencies
cd ../client && npm install
```

### 2. Environment Setup
Configure the following `.env` files based on the `.env.example` templates in each folder:
- **Server**: Setup `DATABASE_URL` (Supabase), `GROQ_API_KEY`, `JWT_SECRET`, and `CLIENT_URL`.
- **Client**: Setup Firebase config and Google Maps API key.

### 3. Run Locally
**Backend**
```bash
cd server
npm run dev
```
**Frontend**
```bash
cd client
npm run dev
```

Visit `http://localhost:5173` to explore ReSpace.

---

## ⚖️ License
Licensed under the [MIT License](LICENSE).
