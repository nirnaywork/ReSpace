# ReSpace 🏢

ReSpace is India's premier commercial infrastructure rental SaaS platform. It solves the problem of idle commercial infrastructure by connecting property owners with renters who need temporary spaces like warehouses, commercial kitchens, event halls, office spaces, and parking spots.

Users can seamlessly switch between **Owner** (listing & managing spaces) and **Renter** (discovering & booking spaces) roles under a single account.

---

## ✨ Key Features

- **Dual-Role Architecture**: Single sign-on allows users to seamlessly switch between Renter and Owner modes.
- **AI Smart Search**: Powered by Groq (Llama 3), users can describe their business needs (e.g., "I want to start a cloud kitchen in Mumbai") and the AI will recommend the exact types of properties and features they need.
- **Dynamic Filtering & Browsing**: Highly responsive grid with client-side & server-side filtering for location, type, price, and amenities.
- **Real-Time Booking & Availability**: Includes an automated calendar to check slot availability and book spaces by the hour or day.
- **Interactive Maps**: Embedded Google Maps API to visually confirm property locations.
- **Offline / Fallback Mode**: The platform gracefully degrades to use beautifully generated cached data if the backend API goes offline, ensuring the site always looks populated.
- **Beautiful UI/UX**: Built with Tailwind CSS and Lucide React icons, featuring smooth animations, glassmorphism, and a modern, premium aesthetic.

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Forms & Validation**: React Hook Form + Zod
- **Routing**: React Router DOM
- **Maps**: Google Maps Embed API

### Backend (Server)
- **Framework**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **Authentication**: Firebase Admin SDK 
- **AI Integration**: Groq SDK (Llama 3.3 70b)
- **File Uploads**: Multer
- **Architecture**: RESTful API design

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Running locally or MongoDB Atlas URI)
- Firebase Project (for Authentication)
- Groq API Key (for AI Smart Match)

### 1. Clone the repository
```bash
git clone https://github.com/nirnaywork/ReSpace.git
cd ReSpace
```

### 2. Environment Setup

**Backend (`server/.env`)**
Create a `.env` file in the `/server` folder with the following variables:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/respace
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
CLIENT_URL=http://localhost:5173
```
*(Note: For Firebase Auth verification, you also need to place your Firebase Admin `serviceAccountKey.json` inside the `server/config/` directory.)*

**Frontend (`client/.env`)**
Create a `.env` file in the `/client` folder with the following variables:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 3. Install Dependencies & Run

You need two terminals running simultaneously.

**Terminal 1 (Backend)**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 (Frontend)**
```bash
cd client
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🌱 Database Seeding

To immediately populate your local MongoDB with realistic, AI-generated commercial listings across India, run the built-in seed script:

```bash
cd server
node scripts/seed.js
```
This script will auto-generate 24 highly-detailed spaces (Warehouses, Kitchens, Event Halls, Offices) in cities like Mumbai, Delhi, and Bangalore, complete with real Unsplash images and verified owner profiles.

---

## 🛡️ License & Deployment

This project is ready for deployment on platforms like Vercel (Frontend) and Render/Heroku (Backend). Ensure environment variables are properly configured in your hosting provider's dashboard. 
