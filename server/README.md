# ReSpace Server 🛠️

The robust backend of the ReSpace engine, powered by Node.js, Prisma, and Supabase. It handles secure data persistence, AI-driven search, and real-time operations.

## 🚀 Key Technologies
- **Node.js & Express**: High-performance RESTful API.
- **Prisma + Supabase (PostgreSQL)**: Scalable cloud database with typesafe SQL queries.
- **Firebase Admin SDK**: Secure token verification and profile management.
- **Groq SDK (Llama 3.3)**: Powering the intelligent search and chatbot engine.
- **Socket.io**: Enabling real-time bi-directional communication for notifications.
- **Multer**: For handling multi-part file uploads (images).
- **Razorpay SDK**: Direct integration for automated payment settlements.

## 📁 Directory Structure
- `/routes`: Define API endpoints (Listings, Users, Bookings, AI, Notifications).
- `/models`: Prisma schema and Mongoose-era legacy structures.
- `/middleware`: Authentication, rate limiting, and error handling.
- `/scripts`: Utility scripts for database seeding and automation.
- `/config`: Configuration logic for Firebase, Supabase, and Razorpay.

## 🛠️ Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup (Prisma)
Ensure you have a Supabase PostgreSQL URL and add it to your `.env`:
```bash
# Generate Prisma Client
npx prisma generate

# Finalize database migrations
npx prisma db push
```

### 3. Environment Variables
Create a `.env` in this directory:
```env
PORT=5000
DATABASE_URL=postgres://... (Supabase/Postgres)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=your_razorpay_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### 4. Run Development Server
```bash
npm run dev
```

## 🏗️ Production Deployment
The server is optimized for deployment on Vercel or Render. Ensure that the `vercel.json` is correctly configured for serverless functions if deploying to Vercel.
