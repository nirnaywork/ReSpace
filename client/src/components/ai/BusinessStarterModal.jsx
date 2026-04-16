import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import ListingCard from '../listings/ListingCard';
import { formatPrice } from '../../utils/formatPrice';
import { Sparkles, ChevronRight, Building2, Calendar, ShoppingBag, Lightbulb } from 'lucide-react';
import { BUSINESS_TYPES, POPULAR_CITIES } from '../../utils/constants';

const BusinessStarterModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [businessType, setBusinessType] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState(30000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const STEP_ICONS = [Building2, Calendar, ShoppingBag];

  const handleGet = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/ai/business-starter', { businessType, location, budget });
      if (res.data.success) {
        setResult(res.data.data);
        setStep(4);
      }
    } catch (err) {
      console.error('Business starter failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setBusinessType('');
    setLocation('');
    setBudget(30000);
    setResult(null);
    onClose();
  };

  const BUSINESS_TYPE_CONFIG = {
    'Food Business': { icon: '🍳', desc: 'Commercial kitchens & food courts' },
    'Event Planning': { icon: '🎉', desc: 'Event halls & banquet spaces' },
    'E-commerce Storage': { icon: '📦', desc: 'Warehouses & fulfillment centers' },
    'Freelance/Creative Studio': { icon: '🎨', desc: 'Office pods & creative spaces' },
    'Other': { icon: '💼', desc: 'Other commercial spaces' },
  };

  return (
    <Modal isOpen={isOpen} onClose={reset} title={step < 4 ? '🚀 Business Starter' : '✨ Your AI Recommendations'} size="lg">
      <div className="p-6">
        {/* Progress bar */}
        {step < 4 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-brand-red text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {s}
                  </div>
                  {s < 3 && <div className={`flex-1 h-1 rounded-full transition-all ${step > s ? 'bg-brand-red' : 'bg-gray-200'}`} />}
                </React.Fragment>
              ))}
            </div>
            <p className="text-xs text-brand-muted">Step {step} of 3</p>
          </div>
        )}

        {/* Step 1: Business Type */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-brand-dark">What kind of business are you starting?</h3>
            <div className="grid grid-cols-1 gap-2">
              {BUSINESS_TYPES.map((type) => {
                const cfg = BUSINESS_TYPE_CONFIG[type];
                return (
                  <button
                    key={type}
                    onClick={() => setBusinessType(type)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                      businessType === type ? 'border-brand-red bg-red-50' : 'border-brand-border hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{cfg?.icon}</span>
                    <div>
                      <p className="font-medium text-brand-dark text-sm">{type}</p>
                      <p className="text-xs text-brand-muted">{cfg?.desc}</p>
                    </div>
                    {businessType === type && <span className="ml-auto text-brand-red">✓</span>}
                  </button>
                );
              })}
            </div>
            <Button variant="primary" className="w-full" disabled={!businessType} onClick={() => setStep(2)}>
              Next: Location →
            </Button>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-brand-dark">Where are you based?</h3>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter your city (e.g. Hyderabad)"
              className="input-field"
              autoFocus
            />
            <div className="flex flex-wrap gap-2">
              {POPULAR_CITIES.slice(0, 8).map((city) => (
                <button
                  key={city}
                  onClick={() => setLocation(city)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    location === city ? 'bg-brand-red text-white border-brand-red' : 'border-brand-border text-brand-muted hover:border-brand-red'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep(1)} className="flex-1">← Back</Button>
              <Button variant="primary" disabled={!location.trim()} onClick={() => setStep(3)} className="flex-1">
                Next: Budget →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Budget */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-brand-dark">Monthly infrastructure budget?</h3>
            <div className="text-center py-2">
              <span className="text-3xl font-bold price-display">{formatPrice(budget)}</span>
              <span className="text-brand-muted text-sm">/month</span>
            </div>
            <input
              type="range"
              min={1000}
              max={200000}
              step={1000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-brand-red"
              aria-label="Monthly budget"
            />
            <div className="flex justify-between text-xs text-brand-muted">
              <span>₹1,000</span>
              <span>₹2,00,000</span>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep(2)} className="flex-1">← Back</Button>
              <Button variant="primary" loading={loading} onClick={handleGet} className="flex-1">
                <Sparkles className="w-4 h-4" /> Get Recommendations
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 4 && result && (
          <div className="space-y-5 animate-fade-in">
            {/* AI Recommendation */}
            <div className="bg-red-50 border border-brand-red/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-brand-red" />
                <p className="font-semibold text-brand-dark text-sm">AI Recommendation</p>
              </div>
              <p className="text-sm text-brand-dark leading-relaxed">{result.recommendation}</p>
            </div>

            {/* Listings */}
            {result.listings?.length > 0 && (
              <div>
                <h4 className="font-semibold text-brand-dark text-sm mb-3">📍 Matching Spaces</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.listings.slice(0, 4).map((listing) => (
                    <div key={listing._id} className="card p-3 flex gap-3">
                      {listing.images?.[0] && (
                        <img src={listing.images[0]} alt={listing.propertyName} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-brand-dark truncate">{listing.propertyName}</p>
                        <p className="text-xs text-brand-muted">{listing.location?.city}</p>
                        <p className="price-display text-xs">{formatPrice(listing.price?.amount)}/{listing.price?.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            {result.tips?.length > 0 && (
              <div>
                <h4 className="font-semibold text-brand-dark text-sm mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-brand-warn" /> Actionable Tips
                </h4>
                <ol className="space-y-2">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-brand-dark">
                      <span className="w-5 h-5 rounded-full bg-brand-red text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      {tip}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="ghost" onClick={() => setStep(1)} className="flex-1">Start Over</Button>
              <Button
                variant="primary"
                onClick={() => {
                  reset();
                  navigate(`/listings?city=${encodeURIComponent(location)}`);
                }}
                className="flex-1"
              >
                Browse More Spaces →
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BusinessStarterModal;
