# ReSpace Client 🎨

The frontend of the ReSpace ecosystem, built with a focus on "Posh" dark-themed aesthetics and cinematic user interactions.

## 🚀 Key Technologies
- **React 19 (Vite)**: For lightning-fast performance and modern hooks.
- **Tailwind CSS**: Custom utility-first CSS for the signature ReSpace theme.
- **Lucide React**: Premium iconography for professional look and feel.
- **React Router DOM**: Client-side routing for seamless navigation.
- **Firebase SDK**: Client-side authentication and user management.
- **Axios**: Promised-based HTTP client for API communication.
- **Socket.io-client**: Real-time notification listeners for booking status.

## 📁 Directory Structure
- `src/components`: Reusable UI components (Layout, Auth, Listings, UI).
- `src/pages`: Main view components (Home, Listings, Dashboard, etc.).
- `src/hooks`: Custom React hooks for data fetching and state management.
- `src/context`: Global context providers (Auth, Theme, Notification).
- `src/utils`: Helper functions for pricing, dates, and API formatting.
- `src/styles`: Global CSS and Tailwind theme configurations.

## 🛠️ Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` in this directory:
```env
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_MAPS_API_KEY=your_maps_key
VITE_API_URL=http://localhost:5000
```

### 3. Run Development Server
```bash
npm run dev
```

## 🏗️ Build for Production
```bash
npm run build
```
This generates a `dist/` folder ready for deployment on Vercel or Netlify.
