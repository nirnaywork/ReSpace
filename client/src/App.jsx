import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/layout/ProtectedRoute';
import ChatBot from './components/ai/ChatBot';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Auth = lazy(() => import('./pages/Auth'));
const Listings = lazy(() => import('./pages/Listings'));
const ListingDetail = lazy(() => import('./pages/ListingDetail'));
const AddSpace = lazy(() => import('./pages/AddSpace'));
const OwnerDashboard = lazy(() => import('./pages/OwnerDashboard'));
const RenterDashboard = lazy(() => import('./pages/RenterDashboard'));

// Layout with Navbar + Footer
const AppLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
    <ChatBot />
  </div>
);

// Minimal spinner for lazy load
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-brand-cream">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-brand-muted font-medium">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <HelmetProvider>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Auth page — no layout */}
              <Route path="/auth" element={<Auth />} />

              {/* All other pages — with layout */}
              <Route element={<AppLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/listings" element={<Listings />} />
                <Route path="/listings/:id" element={<ListingDetail />} />

                {/* Owner routes (protected) */}
                <Route path="/owner/add-space" element={
                  <ProtectedRoute>
                    <AddSpace />
                  </ProtectedRoute>
                } />
                <Route path="/owner/dashboard" element={
                  <ProtectedRoute>
                    <OwnerDashboard />
                  </ProtectedRoute>
                } />

                {/* Renter routes (protected) */}
                <Route path="/renter/dashboard" element={
                  <ProtectedRoute>
                    <RenterDashboard />
                  </ProtectedRoute>
                } />

                {/* Fallback */}
                <Route path="*" element={
                  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                    <h1 className="text-6xl font-extrabold text-brand-red mb-3">404</h1>
                    <h2 className="text-2xl font-bold text-brand-dark mb-2">Page Not Found</h2>
                    <p className="text-brand-muted mb-8">The page you're looking for doesn't exist or has been moved.</p>
                    <a href="/" className="btn-primary">← Back to Home</a>
                  </div>
                } />
              </Route>
            </Routes>
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </HelmetProvider>
);

export default App;
