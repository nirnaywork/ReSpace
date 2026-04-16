import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Building2, ChefHat, Calendar, Briefcase, Car, MoreHorizontal, Sparkles, Star, WifiOff } from 'lucide-react';
import ListingCard from '../components/listings/ListingCard';
import { ListingCardSkeleton } from '../components/ui/Skeleton';
import BusinessStarterModal from '../components/ai/BusinessStarterModal';
import api from '../utils/api';
import FALLBACK_LISTINGS from '../data/fallbackListings';
import { TESTIMONIALS, HOW_IT_WORKS_RENTER, HOW_IT_WORKS_OWNER } from '../utils/constants';

const PROPERTY_TYPE_ICONS = {
  Warehouse: <Building2 className="w-6 h-6" />,
  Kitchen: <ChefHat className="w-6 h-6" />,
  'Event Hall': <Calendar className="w-6 h-6" />,
  'Office Space': <Briefcase className="w-6 h-6" />,
  'Parking Space': <Car className="w-6 h-6" />,
  Other: <MoreHorizontal className="w-6 h-6" />,
};

const TYPE_COLORS = {
  Warehouse: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
  Kitchen: 'bg-teal-50 text-teal-700 hover:bg-teal-100',
  'Event Hall': 'bg-blue-50 text-blue-700 hover:bg-blue-100',
  'Office Space': 'bg-purple-50 text-purple-700 hover:bg-purple-100',
  'Parking Space': 'bg-gray-50 text-gray-600 hover:bg-gray-100',
  Other: 'bg-pink-50 text-pink-700 hover:bg-pink-100',
};

// Animated counter hook
const useCounter = (target, isVisible) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isVisible) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, isVisible]);
  return count;
};

const StatCounter = ({ target, label, suffix = '+' }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const count = useCounter(target, visible);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="text-center animate-count-up">
      <div className="text-4xl font-extrabold text-brand-red mb-2">
        {count.toLocaleString('en-IN')}{suffix}
      </div>
      <p className="text-brand-muted font-medium">{label}</p>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('renter');
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [businessModalOpen, setBusinessModalOpen] = useState(false);

  useEffect(() => {
    // Try API first, fall back to static data automatically
    api.get('/api/listings?limit=6&sort=rating')
      .then((res) => {
        if (res.data.success && res.data.data.listings.length > 0) {
          setFeaturedListings(res.data.data.listings);
        } else {
          // API returned empty — use fallback sorted by rating
          const top6 = [...FALLBACK_LISTINGS]
            .sort((a, b) => b.avgRating - a.avgRating)
            .slice(0, 6);
          setFeaturedListings(top6);
        }
      })
      .catch(() => {
        // API unavailable — silently use fallback
        const top6 = [...FALLBACK_LISTINGS]
          .sort((a, b) => b.avgRating - a.avgRating)
          .slice(0, 6);
        setFeaturedListings(top6);
      })
      .finally(() => setLoadingFeatured(false));
  }, []);

  const steps = activeTab === 'renter' ? HOW_IT_WORKS_RENTER : HOW_IT_WORKS_OWNER;

  return (
    <>
      <Helmet>
        <title>ReSpace – Unlock India's Idle Commercial Spaces</title>
        <meta name="description" content="Rent warehouses, kitchens, event halls, office spaces, and more by the hour. India's #1 commercial space rental platform." />
      </Helmet>

      {/* Hero */}
      <section className="relative bg-brand-dark text-white min-h-[90vh] flex items-center overflow-hidden" id="hero">
        {/* Dot pattern */}
        <div className="absolute inset-0 dot-pattern opacity-50" />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-brand-dark/95 to-[#4a0f0f]/30" />

        <div className="page-container relative z-10 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-brand-red" />
              AI-Powered Space Matching · 500+ Spaces Pan-India
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              Unlock India's<br />
              <span className="text-brand-red">Idle Spaces</span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-xl">
              Rent warehouses, kitchens, event halls & more — by the hour.
              Find the perfect commercial space without long-term commitments.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/listings" id="hero-find-space-btn" className="btn-primary text-base px-8 py-4 min-h-0">
                Find a Space <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/owner/add-space" id="hero-list-space-btn" className="btn-secondary border-white text-white hover:bg-white/10 text-base px-8 py-4 min-h-0">
                List Your Space
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 mt-10">
              {[['500+', 'Spaces'], ['₹299', 'Starting from'], ['24/7', 'Booking']].map(([val, label]) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-bold text-white">{val}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="section-padding bg-white" id="how-it-works">
        <div className="page-container">
          <div className="text-center mb-10">
            <h2 className="text-brand-dark mb-4">How ReSpace Works</h2>
            <p className="text-brand-muted max-w-xl mx-auto">Simple, fast, and secure commercial space rental.</p>
          </div>

          {/* Tab toggle */}
          <div className="flex justify-center mb-10">
            <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
              {['renter', 'owner'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === tab ? 'bg-white shadow-sm text-brand-dark' : 'text-brand-muted hover:text-brand-dark'
                  }`}
                  aria-pressed={activeTab === tab}
                >
                  I'm a {tab === 'renter' ? 'Renter' : 'Owner'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {steps.map((step, i) => (
              <div key={step.step} className="text-center animate-fade-in">
                <div className="w-14 h-14 rounded-full bg-brand-red text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                  {step.step}
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden sm:block absolute mt-7 ml-[8.5rem] w-16 h-0.5 bg-brand-border" />
                )}
                <h3 className="font-semibold text-brand-dark mb-2">{step.title}</h3>
                <p className="text-sm text-brand-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Type */}
      <section className="section-padding bg-brand-cream">
        <div className="page-container">
          <div className="text-center mb-10">
            <h2 className="text-brand-dark mb-4">Browse by Type</h2>
            <p className="text-brand-muted">Find exactly what your business needs</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {Object.entries(PROPERTY_TYPE_ICONS).map(([type, icon]) => (
              <Link
                key={type}
                to={`/listings?type=${encodeURIComponent(type)}`}
                className={`flex flex-col items-center gap-3 p-5 rounded-xl border border-transparent transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer ${TYPE_COLORS[type]}`}
                aria-label={`Browse ${type} spaces`}
              >
                {icon}
                <span className="text-sm font-semibold text-center leading-tight">{type}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="section-padding bg-white">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-brand-dark mb-2">Featured Spaces</h2>
              <p className="text-brand-muted text-sm">Top-rated commercial spaces on ReSpace</p>
            </div>
            <Link to="/listings" className="btn-secondary text-sm hidden sm:flex">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingFeatured
              ? Array.from({ length: 6 }).map((_, i) => <ListingCardSkeleton key={i} />)
              : featuredListings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} />
                ))
            }
          </div>

          {!loadingFeatured && featuredListings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-brand-muted">No listings yet. Be the first to list your space!</p>
              <Link to="/owner/add-space" className="btn-primary mt-4 inline-flex">
                List Your Space →
              </Link>
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/listings" className="btn-primary inline-flex sm:hidden">
              View All Spaces →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding bg-brand-cream">
        <div className="page-container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 max-w-3xl mx-auto">
            <StatCounter target={500} label="Spaces Listed" />
            <StatCounter target={1200} label="Bookings Made" />
            <StatCounter target={200} label="Verified Owners" />
          </div>
        </div>
      </section>

      {/* Business Starter CTA */}
      <section className="py-16 bg-brand-red">
        <div className="page-container text-center">
          <Sparkles className="w-10 h-10 text-white/70 mx-auto mb-4" />
          <h2 className="text-white font-bold text-3xl mb-3">Starting a Business?</h2>
          <p className="text-white/80 text-lg mb-6 max-w-lg mx-auto">
            Let AI find the perfect commercial space for your business needs and budget.
          </p>
          <button
            onClick={() => setBusinessModalOpen(true)}
            className="bg-white text-brand-red font-bold px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-all text-sm hover:scale-105"
            id="business-starter-cta-btn"
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            Get AI Recommendations
          </button>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-white">
        <div className="page-container">
          <div className="text-center mb-10">
            <h2 className="text-brand-dark mb-3">What Our Users Say</h2>
            <p className="text-brand-muted text-sm">Trusted by entrepreneurs across India</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card card-hover p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-red text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-brand-dark text-sm">{t.name}</p>
                    <p className="text-xs text-brand-muted">{t.role}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-brand-muted leading-relaxed italic">"{t.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Starter Modal */}
      <BusinessStarterModal isOpen={businessModalOpen} onClose={() => setBusinessModalOpen(false)} />
    </>
  );
};

export default Home;
