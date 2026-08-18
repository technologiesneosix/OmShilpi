import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Award, Mail, Phone, MapPin, Send, Globe, Share2 } from 'lucide-react';
import { adminApi } from '../../api/admin.api';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [storeInfo, setStoreInfo] = useState({
    flagshipAddress: 'Flagship Store, Zaveri Bazaar, Mumbai, Maharashtra, 400002',
    phone: '+91 (022) 2890-4821 / +91 98200 12345',
    conciergeEmail: 'care@omshilpijewels.com',
  });

  useEffect(() => {
    adminApi.getStoreInfo()
      .then(res => {
        const data = res.data || res;
        if (data.flagshipAddress) {
          setStoreInfo({
            flagshipAddress: data.flagshipAddress || storeInfo.flagshipAddress,
            phone: data.phone || storeInfo.phone,
            conciergeEmail: data.conciergeEmail || storeInfo.conciergeEmail,
          });
        }
      })
      .catch(() => null);
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-[#1c1c18] text-[#fdf9f2] border-t border-[#31302c] mt-auto">
      {/* Value Propositions / Trust Features Bar */}
      <div className="border-b border-[#31302c] py-8 bg-[#201b0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center p-2">
            <ShieldCheck className="w-7 h-7 text-[#b98f4a] mb-2" />
            <h4 className="font-serif text-sm font-semibold">100% Certified Gold</h4>
            <p className="text-[11px] text-[#d0c5b2] mt-0.5">BIS Hallmarked 22K & 18K Jewellery</p>
          </div>
          <div className="flex flex-col items-center p-2">
            <Award className="w-7 h-7 text-[#b98f4a] mb-2" />
            <h4 className="font-serif text-sm font-semibold">Certified Diamonds</h4>
            <p className="text-[11px] text-[#d0c5b2] mt-0.5">IGI & SGL Certified Natural Diamonds</p>
          </div>
          <div className="flex flex-col items-center p-2">
            <Truck className="w-7 h-7 text-[#b98f4a] mb-2" />
            <h4 className="font-serif text-sm font-semibold">Insured Shipping</h4>
            <p className="text-[11px] text-[#d0c5b2] mt-0.5">Free & Secure Delivery Across India</p>
          </div>
          <div className="flex flex-col items-center p-2">
            <RotateCcw className="w-7 h-7 text-[#b98f4a] mb-2" />
            <h4 className="font-serif text-sm font-semibold">Lifetime Maintenance</h4>
            <p className="text-[11px] text-[#d0c5b2] mt-0.5">Complimentary Cleaning & Repair Services</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <Link to="/" className="inline-block group">
            <img
              src="/logo.png"
              alt="Om Shilpi Jewels"
              className="h-16 sm:h-20 w-auto object-contain transition duration-300 group-hover:scale-105 bg-white/90 p-2 rounded-lg shadow-sm"
            />
          </Link>
          <p className="text-xs text-[#d0c5b2] leading-relaxed pr-4">
            Established in 1985, Om Shilpi Jewels represents four decades of unparalleled craftsmanship, master artistry, and authentic purity in gold, diamond, and silver jewellery.
          </p>

          <div className="pt-2 space-y-2 text-xs text-[#d0c5b2]">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#b98f4a] shrink-0" />
              <span>{storeInfo.flagshipAddress}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#b98f4a] shrink-0" />
              <span>{storeInfo.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#b98f4a] shrink-0" />
              <span>{storeInfo.conciergeEmail}</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-serif text-xs uppercase tracking-widest text-[#b98f4a] font-bold mb-4">
            Shop Categories
          </h4>
          <ul className="space-y-2.5 text-xs text-[#d0c5b2]">
            <li><Link to="/shop?metal=Gold" className="hover:text-[#b98f4a] transition">Gold Rings & Bangles</Link></li>
            <li><Link to="/shop?metal=Diamond" className="hover:text-[#b98f4a] transition">Diamond Necklaces</Link></li>
            <li><Link to="/shop?metal=Silver" className="hover:text-[#b98f4a] transition">Sterling Silver Articles</Link></li>
            <li><Link to="/shop?category=earrings" className="hover:text-[#b98f4a] transition">Earrings & Jhumkas</Link></li>
            <li><Link to="/shop?category=mangalsutra" className="hover:text-[#b98f4a] transition">Modern Mangalsutras</Link></li>
            <li><Link to="/shop?isNewArrival=true" className="hover:text-[#b98f4a] transition">New Arrivals</Link></li>
          </ul>
        </div>

        {/* Company & Support */}
        <div>
          <h4 className="font-serif text-xs uppercase tracking-widest text-[#b98f4a] font-bold mb-4">
            Customer Care
          </h4>
          <ul className="space-y-2.5 text-xs text-[#d0c5b2]">
            <li><Link to="/heritage" className="hover:text-[#b98f4a] transition">About Our Brand</Link></li>
            <li><Link to="/contact" className="hover:text-[#b98f4a] transition">Book Store Appointment</Link></li>
            <li><Link to="/orders" className="hover:text-[#b98f4a] transition">Track Your Order</Link></li>
            <li><Link to="/account" className="hover:text-[#b98f4a] transition">Customer Account</Link></li>
            <li><Link to="/contact#faq" className="hover:text-[#b98f4a] transition">Shipping & Returns</Link></li>
            <li><Link to="/contact#care" className="hover:text-[#b98f4a] transition">Jewellery Care Guide</Link></li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div>
          <h4 className="font-serif text-xs uppercase tracking-widest text-[#b98f4a] font-bold mb-4">
            Join The Privilege Circle
          </h4>
          <p className="text-xs text-[#d0c5b2] mb-4">
            Subscribe for private collection previews, exclusive invitations, and luxury updates.
          </p>

          <form onSubmit={handleSubscribe} className="space-y-2">
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#31302c] border border-[#4d4637] text-white text-xs px-3.5 py-2.5 rounded outline-none focus:border-[#b98f4a] transition placeholder-[#817567]"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-3 bg-[#b98f4a] hover:bg-[#7b5818] text-white rounded text-xs transition cursor-pointer flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            {subscribed && (
              <p className="text-[11px] text-green-400">Thank you for subscribing to Om Shilpi Jewels!</p>
            )}
          </form>

          <div className="pt-6">
            <h5 className="text-[11px] uppercase tracking-wider text-[#d0c5b2] mb-3 font-semibold">Connect With Us</h5>
            <div className="flex gap-3 text-[#d0c5b2]">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="p-2 bg-[#31302c] rounded-full hover:text-[#b98f4a] transition" title="Instagram">
                <Globe className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="p-2 bg-[#31302c] rounded-full hover:text-[#b98f4a] transition" title="Facebook">
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-[#31302c] py-6 text-center text-xs text-[#817567]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Om Shilpi Jewels Private Limited. All Rights Reserved.</p>
          <div className="flex gap-6 text-[11px]">
            <Link to="/contact" className="hover:text-[#b98f4a]">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-[#b98f4a]">Terms of Service</Link>
            <Link to="/contact" className="hover:text-[#b98f4a]">Hallmark Verification</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
