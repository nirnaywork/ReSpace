import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Minus, Send, Bot, User, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatPrice } from '../../utils/formatPrice';
import { formatRelative } from '../../utils/formatDate';
import { useAuth } from '../../hooks/useAuth';

const OPENING_MESSAGE = {
  role: 'assistant',
  content: "Hi! I'm your ReSpace assistant. Tell me what kind of space you're looking for — location, budget, type — and I'll find the best options for you.",
  timestamp: new Date(),
};

const ChatBot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([OPENING_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setUnreadCount(0);
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async (text = input.trim()) => {
    if (!text || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: text, timestamp: new Date() };
    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.post('/api/ai/chat', {
        message: text,
        history: history.slice(-6),
      });

      if (res.data.success) {
        const { reply, listings = [], source } = res.data.data;
        const aiMsg = {
          role: 'assistant',
          content: reply,
          listings: listings.slice(0, 3),
          source,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        if (!isOpen || isMinimized) setUnreadCount((c) => c + 1);
      }
    } catch (err) {
      const errMsg = {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try searching directly using our search bar above.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const QUICK_PROMPTS = [
    'Cold storage in Mumbai',
    'Event space for 200 people',
    'Office pod under ₹500/hr',
  ];

  return (
    <>
      {/* Chat Widget */}
      {isOpen && (
        <div className={`fixed bottom-20 right-4 w-96 bg-brand-card rounded-2xl shadow-modal border border-brand-border z-50 flex flex-col animate-slide-up overflow-hidden ${isMinimized ? 'h-14' : 'h-[520px]'}`}
          role="dialog" aria-label="ReSpace AI Chat">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-brand-red text-white flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">ReSpace AI</h4>
              {!isMinimized && <p className="text-xs text-white/70">Always here to help</p>}
            </div>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!isMinimized && (
            <>
              {/* Message Thread */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[85%] space-y-2">
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-brand-red flex items-center justify-center">
                            <Bot className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-xs text-brand-muted">ReSpace AI</span>
                        </div>
                      )}
                      <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>

                      {/* Listing cards in chat */}
                      {msg.listings?.length > 0 && (
                        <div className="space-y-2">
                          {msg.listings.map((listing) => (
                            <Link
                              key={listing._id}
                              to={`/listings/${listing._id}`}
                              className="flex items-center gap-3 p-2.5 bg-brand-card border border-brand-border rounded-xl hover:shadow-sm hover:border-brand-red transition-all"
                            >
                              {listing.images?.[0] ? (
                                <img
                                  src={listing.images[0]}
                                  alt={listing.propertyName}
                                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0" />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-brand-dark truncate">{listing.propertyName}</p>
                                <p className="text-xs text-brand-muted">{listing.location?.city}</p>
                                <p className="price-display text-xs">{formatPrice(listing.price?.amount)}/{listing.price?.type}</p>
                              </div>
                              <ExternalLink className="w-3.5 h-3.5 text-brand-muted flex-shrink-0" />
                            </Link>
                          ))}
                        </div>
                      )}

                      <p className="text-[10px] text-gray-400">{formatRelative(msg.timestamp)}</p>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="chat-bubble-ai">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick prompts (shown only initially) */}
              {messages.length <= 1 && (
                <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-thin">
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => sendMessage(p)}
                      className="flex-shrink-0 text-xs bg-brand-cream border border-brand-border text-brand-dark rounded-full px-3 py-1.5 hover:border-brand-red hover:text-brand-red transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="flex items-center gap-2 px-3 py-3 border-t border-brand-border flex-shrink-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your space needs..."
                  className="flex-1 text-sm bg-gray-50 rounded-xl px-4 py-2.5 border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
                  disabled={loading}
                  aria-label="Chat message"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 bg-brand-red text-white rounded-xl flex items-center justify-center hover:bg-[#5a1414] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => { setIsOpen(true); setIsMinimized(false); }}
        className="fixed bottom-4 right-4 w-14 h-14 bg-brand-red text-white rounded-full shadow-modal flex items-center justify-center hover:bg-[#5a1414] transition-all duration-200 hover:scale-110 z-50"
        aria-label="Open AI Chat"
      >
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>
    </>
  );
};

export default ChatBot;
