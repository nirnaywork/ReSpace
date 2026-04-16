import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-dark text-white" role="contentinfo">
      <div className="page-container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-brand-red text-xl font-extrabold">Re</span>
              <span className="text-white text-xl font-bold">Space</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              India's premier commercial infrastructure rental platform connecting space owners with renters.
            </p>
          </div>

          {/* For Renters */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">For Renters</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Browse Spaces', to: '/listings' },
                { label: 'How It Works', to: '/#how-it-works' },
                { label: 'My Bookings', to: '/renter/dashboard' },
                { label: 'AI Space Finder', to: '/listings' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Owners */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">For Owners</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'List Your Space', to: '/owner/add-space' },
                { label: 'Owner Dashboard', to: '/owner/dashboard' },
                { label: 'Pricing Guide', to: '/' },
                { label: 'Get Verified', to: '/' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Terms of Service', to: '/' },
                { label: 'Privacy Policy', to: '/' },
                { label: 'Refund Policy', to: '/' },
                { label: 'Contact Us', to: '/' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {year} ReSpace Technologies Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {[
              { Icon: Twitter, label: 'Twitter', href: '#' },
              { Icon: Linkedin, label: 'LinkedIn', href: '#' },
              { Icon: Instagram, label: 'Instagram', href: '#' },
              { Icon: Youtube, label: 'YouTube', href: '#' },
            ].map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-red flex items-center justify-center transition-all duration-200"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
