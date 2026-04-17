import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Bell, ChevronDown, LogOut, LayoutDashboard, Calendar, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import api from '../../utils/api';
import { formatRelative } from '../../utils/formatDate';

const Navbar = () => {
  const { user, userProfile, logout, isOwner, isRenter } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  // Real-time notification handler
  const handleNewNotification = (notif) => {
    setNotifications((prev) => [notif, ...prev].slice(0, 20));
    setUnreadCount((c) => c + 1);
  };

  useSocket(handleNewNotification);

  // Fetch notifications on login
  useEffect(() => {
    if (user) {
      api.get('/api/notifications/mine').then((res) => {
        if (res.data.success) {
          setNotifications(res.data.data.notifications);
          setUnreadCount(res.data.data.unreadCount);
        }
      }).catch(() => {});
    }
  }, [user]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const initials = (name) => name ? name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() : '?';

  const navLinks = [
    { label: 'Find Space', to: '/listings' },
    { label: 'List Space', to: isOwner ? '/owner/dashboard' : '/owner/add-space' },
    { label: 'How it Works', to: '/#how-it-works' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-brand-cream border-b border-brand-border text-brand-dark" role="navigation" aria-label="Main navigation">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-0 font-heading text-2xl font-extrabold tracking-tighter uppercase hover:opacity-90 transition-opacity">
            <span className="text-brand-red">Re</span>
            <span className="text-brand-dark">Space</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  location.pathname === link.to
                    ? 'text-brand-dark bg-white/10'
                    : 'text-brand-muted hover:text-brand-dark hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {/* Notification Bell */}
                <div ref={notifRef} className="relative">
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative p-2 rounded-full hover:bg-white/5 transition-colors text-brand-dark"
                    aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-brand-red text-white text-xs w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold min-w-[18px] min-h-[18px] px-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 top-12 w-80 bg-brand-card rounded-none shadow-none border border-brand-border z-50 animate-slide-up overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border">
                        <h4 className="font-semibold text-brand-dark text-sm">Notifications</h4>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} className="text-xs text-brand-red hover:underline">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto scrollbar-thin">
                        {notifications.length === 0 ? (
                          <p className="text-center text-brand-muted text-sm py-6">You're all caught up! 🎉</p>
                        ) : (
                          notifications.slice(0, 10).map((n) => (
                            <div
                              key={n._id}
                              className={`px-4 py-3 border-b border-brand-border last:border-0 ${!n.isRead ? 'bg-brand-red/10' : ''}`}
                            >
                              <p className="text-sm font-medium text-brand-dark">{n.title}</p>
                              <p className="text-xs text-brand-muted mt-0.5 line-clamp-2">{n.message}</p>
                              <p className="text-xs text-brand-muted mt-1">{formatRelative(n.createdAt)}</p>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="px-4 py-3 border-t border-brand-border">
                        <button
                          onClick={() => { setNotifOpen(false); navigate(isOwner ? '/owner/dashboard' : '/renter/dashboard'); }}
                          className="text-xs text-brand-red hover:underline font-medium"
                        >
                          View all notifications →
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-none hover:bg-white/5 transition-colors text-brand-dark"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="menu"
                  >
                    {userProfile?.photoURL ? (
                      <img
                        src={userProfile.photoURL}
                        alt={userProfile.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-brand-red/50"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center text-xs font-bold">
                        {initials(userProfile?.name || user?.displayName || user?.email)}
                      </div>
                    )}
                    <span className="text-sm font-medium max-w-[100px] truncate">
                      {userProfile?.name || user?.displayName?.split(' ')[0] || 'User'}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-12 w-52 bg-brand-card rounded-none shadow-none border border-brand-border z-50 animate-slide-up overflow-hidden" role="menu">
                      {isOwner && (
                        <button
                          onClick={() => { navigate('/owner/dashboard'); setUserMenuOpen(false); }}
                          className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm text-brand-dark hover:bg-brand-border transition-colors"
                          role="menuitem"
                        >
                          <LayoutDashboard className="w-4 h-4 text-brand-muted" />
                          Owner Dashboard
                        </button>
                      )}
                      <button
                        onClick={() => { navigate('/renter/dashboard'); setUserMenuOpen(false); }}
                        className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm text-brand-dark hover:bg-brand-border transition-colors"
                        role="menuitem"
                      >
                        <Calendar className="w-4 h-4 text-brand-muted" />
                        My Bookings
                      </button>
                      <div className="border-t border-brand-border" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm text-brand-error hover:bg-brand-border transition-colors"
                        role="menuitem"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth"
                  className="text-sm font-bold text-brand-muted hover:text-brand-dark transition-colors px-3 py-2 uppercase tracking-wide"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="btn-primary text-sm px-4 py-2 min-h-0"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-brand-cream border-t border-brand-border animate-fade-in">
          <div className="page-container py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/10 pt-3 mt-3">
              {user ? (
                <div className="space-y-1">
                  {isOwner && (
                    <Link to="/owner/dashboard" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 text-sm">
                      <LayoutDashboard className="w-4 h-4" /> Owner Dashboard
                    </Link>
                  )}
                  <Link to="/renter/dashboard" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 text-sm">
                    <Calendar className="w-4 h-4" /> My Bookings
                  </Link>
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg text-red-400 hover:bg-white/10 text-sm w-full text-left">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              ) : (
                <Link to="/auth" onClick={() => setMobileOpen(false)}
                  className="btn-primary w-full justify-center">
                  Sign In / Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
