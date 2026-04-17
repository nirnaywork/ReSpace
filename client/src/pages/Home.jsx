import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Building2, ChefHat, Calendar, Briefcase, Car, MoreHorizontal } from 'lucide-react';
import ListingCard from '../components/listings/ListingCard';
import { ListingCardSkeleton } from '../components/ui/Skeleton';
import api from '../utils/api';
import FALLBACK_LISTINGS from '../data/fallbackListings';

const PROPERTY_TYPE_IMAGES = {
  Warehouse: '/warehouseImg.jpg',
  Kitchen: '/kitchen.jpg',
  'Event Hall': '/eventHall.jpg',
  'Office Space': '/officeSpace.jpg',
  'Parking Space': '/parkingSpace.jpg',
  Other: null
};

const Home = () => {
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [hoveredType, setHoveredType] = useState('Warehouse');

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

  return (
    <div className="bg-brand-cream min-h-screen">
      <Helmet>
        <title>ReSpace – Unlock India's Idle Commercial Spaces</title>
        <meta name="description" content="Rent warehouses, kitchens, event halls, office spaces, and more by the hour. India's #1 commercial space rental platform." />
      </Helmet>

      {/* Brutalist Hero */}
      <section className="relative bg-brand-cream text-brand-dark min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-brand-border" id="hero">
        <div className="page-container relative z-10 w-full flex flex-col items-center justify-center text-center">
          <h1 className="font-heading font-black leading-[0.9] text-brand-dark m-0 tracking-tighter" style={{ fontSize: 'clamp(3rem, 10vw, 10rem)' }}>
            UNLOCK<br/>
            <span className="text-brand-red">SPACES</span>
          </h1>
          <div className="mt-16 flex flex-col sm:flex-row gap-6 w-full max-w-lg mx-auto">
             <Link to="/listings" className="flex-1 bg-brand-card text-brand-dark border border-brand-border hover:bg-brand-red hover:text-brand-dark hover:border-brand-red transition-colors duration-300 font-heading font-bold uppercase py-6 text-center tracking-widest">
               FIND SPACE
             </Link>
             <Link to="/owner/add-space" className="flex-1 bg-transparent border-2 border-brand-border text-brand-dark hover:border-brand-dark transition-colors duration-300 font-heading font-bold uppercase py-6 text-center tracking-widest">
               LIST SPACE
             </Link>
          </div>
        </div>
      </section>

      {/* Brutalist About */}
      <section className="py-24 md:py-40 bg-brand-surface border-b border-brand-border">
        <div className="page-container">
           <div className="max-w-5xl">
              <p className="font-heading text-3xl md:text-6xl text-brand-dark font-bold leading-tight tracking-tight">
                 India's premiere <span className="text-brand-muted">infrastructure rental platform.</span> Rent warehouses, kitchens, and event halls without long-term commitments.
              </p>
           </div>
        </div>
      </section>

      {/* Services Interactivity */}
      <section className="bg-brand-cream border-b border-brand-border flex flex-col lg:flex-row min-h-[50vh]">
         {/* Left Side List */}
         <div className="flex-1 lg:border-r border-brand-border flex flex-col">
            {Object.keys(PROPERTY_TYPE_IMAGES).map((type) => (
               <Link 
                  to={`/listings?type=${encodeURIComponent(type)}`}
                  key={type}
                  onMouseEnter={() => setHoveredType(type)}
                  className="flex-1 border-b border-brand-border last:border-b-0 lg:last:border-b p-4 md:p-6 flex justify-between items-center group transition-colors duration-300 hover:bg-brand-red"
               >
                  <span className="font-heading text-xl md:text-3xl font-bold text-brand-dark uppercase tracking-tight group-hover:text-brand-cream transition-colors duration-300">{type}</span>
                  <ArrowRight className="w-6 h-6 md:w-8 md:h-8 text-brand-dark opacity-0 group-hover:opacity-100 transition-opacity -rotate-45" />
               </Link>
            ))}
         </div>
         {/* Right Side Visual (Image) */}
         <div className="flex-1 hidden lg:flex items-center justify-center bg-brand-surface relative overflow-hidden group border-l border-brand-border">
            {Object.entries(PROPERTY_TYPE_IMAGES).map(([type, imageSrc]) => (
              imageSrc ? (
                <img
                  key={type}
                  src={imageSrc}
                  alt={type}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                     hoveredType === type ? 'opacity-60 z-10' : 'opacity-0 z-0'
                  }`}
                />
              ) : null
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-cream via-transparent to-transparent pointer-events-none z-20" />
         </div>
      </section>

      {/* Featured Projects Grid */}
      <section className="py-24 md:py-40 bg-brand-cream">
         <div className="page-container">
             <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-brand-border pb-8 mb-12 gap-6">
                 <h2 className="font-heading text-5xl md:text-8xl font-black text-brand-dark m-0 tracking-tighter uppercase leading-none">FEATURED</h2>
                 <Link to="/listings" className="text-brand-muted hover:text-brand-red uppercase tracking-widest font-bold font-heading transition-colors whitespace-nowrap mb-2">
                    VIEW ALL →→→
                 </Link>
             </div>
             
             {/* Brutalist Data Table Rows */}
             <div className="flex flex-col border-b border-brand-border">
               {loadingFeatured
                 ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="border-t border-brand-border p-4"><ListingCardSkeleton /></div>)
                 : featuredListings.map(listing => (
                     <div className="border-t border-brand-border transition-colors hover:bg-brand-card" key={listing._id}>
                        <ListingCard listing={listing} />
                     </div>
                   ))
               }
             </div>
         </div>
      </section>
    </div>
  );
};

export default Home;
