import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Send, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import ListingCard from '../listings/ListingCard';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const EXAMPLE_QUERIES = [
  'Cold storage warehouse in Pune',
  'Event space for 200 people in Hyderabad',
  'Daily office pod in Bangalore under ₹500/hr',
  'Commercial kitchen in Mumbai for 3 days',
];

const SmartMatchBox = ({ onMatchResults }) => {
  const [expanded, setExpanded] = useState(true);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleMatch = async (searchQuery = query) => {
    if (!searchQuery?.trim()) return;
    if (!user) { navigate('/auth'); return; }

    setLoading(true);
    setResult(null);

    try {
      const res = await api.post('/api/ai/match', { query: searchQuery });
      if (res.data.success) {
        setResult(res.data.data);
        if (onMatchResults) onMatchResults(res.data.data.matchedIds);
      }
    } catch (err) {
      console.error('AI match failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border-l-4 border-brand-red overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-brand-red" />
          <div className="text-left">
            <h3 className="font-semibold text-brand-dark text-sm">AI Space Matching</h3>
            <p className="text-xs text-brand-muted">Describe your need in plain English</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-brand-muted" /> : <ChevronDown className="w-4 h-4 text-brand-muted" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4">
          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleMatch()}
              placeholder="e.g. I need a cold storage warehouse in Pune for 3 days, budget ₹3000/day..."
              className="input-field flex-1"
              aria-label="Describe your space needs for AI matching"
            />
            <button
              onClick={() => handleMatch()}
              disabled={!query.trim() || loading}
              className="btn-primary px-4 flex-shrink-0"
              aria-label="Find AI matches"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>

          {/* Example chips */}
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => { setQuery(q); handleMatch(q); }}
                className="text-xs bg-brand-cream border border-brand-border text-brand-dark rounded-full px-3 py-1.5 hover:border-brand-red hover:text-brand-red transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-red-50 border border-brand-red/20 rounded-xl p-3">
                <p className="text-sm text-brand-red font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> AI Reasoning
                </p>
                <p className="text-sm text-brand-dark mt-1">{result.reasoning}</p>
              </div>

              {result.listings?.length > 0 ? (
                <div>
                  <h4 className="text-sm font-semibold text-brand-dark mb-3">
                    🎯 Top {result.listings.length} AI-Matched Spaces
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {result.listings.map((listing) => (
                      <ListingCard
                        key={listing._id}
                        listing={listing}
                        aiMatch
                        aiReasoning={result.reasoning}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-brand-muted text-center py-4">
                  No exact matches found. Try different keywords.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartMatchBox;
