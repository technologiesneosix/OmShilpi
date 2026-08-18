import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown, LogOut, Package, MapPin } from 'lucide-react';
import { AnnouncementBar } from './AnnouncementBar';
import { MegaMenu } from './MegaMenu';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { categoriesApi } from '../../api/categories.api';
import { collectionsApi } from '../../api/collections.api';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { cart, setIsCartOpen } = useCart();
  const { wishlist } = useWishlist();

  const [activeMegaMenu, setActiveMegaMenu] = useState(false);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const [logoUrl, setLogoUrl] = useState('/logo.png');

  useEffect(() => {
    const loadHeaderData = async () => {
      try {
        const [catRes, colRes, brandRes] = await Promise.all([
          categoriesApi.getCategories().catch(() => ({ data: [] })),
          collectionsApi.getCollections().catch(() => ({ data: [] })),
          adminApi.getBranding().catch(() => ({ data: { logoUrl: '/logo.png' } })),
        ]);
        const catList = catRes.data?.categories || catRes.data || [];
        const colList = colRes.data?.collections || colRes.data || [];
        const brandData = brandRes.data || brandRes || {};

        setCategories(Array.isArray(catList) ? catList : []);
        setCollections(Array.isArray(colList) ? colList : []);
        if (brandData.logoUrl) setLogoUrl(brandData.logoUrl);
      } catch (err) {
        console.warn('Could not load header data:', err.message);
      }
    };
    loadHeaderData();
  }, []);

  // Close menus on route change
  useEffect(() => {
    setActiveMegaMenu(false);
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header
      className="sticky top-0 z-40 bg-[#fdf9f2]/95 backdrop-blur-md border-b border-[#e6e2db] transition-all relative"
      onMouseLeave={() => setActiveMegaMenu(false)}
    >
      <AnnouncementBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#1c1c18] hover:text-[#7b5818] transition cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Official Logo */}
          <Link to="/" className="flex items-center justify-center py-1 group">
            <img
              src={logoUrl}
              alt="Om Shilpi Jewels"
              className="h-16 sm:h-20 max-h-20 w-auto object-contain transition duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/logo.png';
              }}
            />
          </Link>

          {/* Right Icon Actions */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-[#1c1c18] hover:text-[#7b5818] transition cursor-pointer"
              title="Search Jewellery"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Account Icon / Dropdown */}
            <div className="relative">
              {isAuthenticated ? (
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 p-2 text-[#1c1c18] hover:text-[#7b5818] transition cursor-pointer"
                >
                  <User className="w-5 h-5 text-[#7b5818]" />
                  <span className="hidden md:inline text-xs font-semibold max-w-[90px] truncate">
                    {user?.name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 hidden md:block" />
                </button>
              ) : (
                <Link
                  to="/login"
                  className="p-2 text-[#1c1c18] hover:text-[#7b5818] transition flex items-center gap-1"
                  title="Sign In"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden md:inline text-xs font-semibold">Sign In</span>
                </Link>
              )}

              {/* User Dropdown */}
              {userDropdownOpen && isAuthenticated && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#e6e2db] rounded shadow-lg py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-[#f1ede6]">
                    <p className="text-xs font-semibold text-[#1c1c18]">{user?.name}</p>
                    <p className="text-[11px] text-[#645d56] truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/account"
                    className="flex items-center gap-2 px-4 py-2 text-xs text-[#1c1c18] hover:bg-[#fdf9f2] hover:text-[#7b5818]"
                  >
                    <User className="w-4 h-4" /> My Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="flex items-center gap-2 px-4 py-2 text-xs text-[#1c1c18] hover:bg-[#fdf9f2] hover:text-[#7b5818]"
                  >
                    <Package className="w-4 h-4" /> My Orders
                  </Link>
                  <Link
                    to="/account#addresses"
                    className="flex items-center gap-2 px-4 py-2 text-xs text-[#1c1c18] hover:bg-[#fdf9f2] hover:text-[#7b5818]"
                  >
                    <MapPin className="w-4 h-4" /> Saved Addresses
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left border-t border-[#f1ede6]"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="relative p-2 text-[#1c1c18] hover:text-[#7b5818] transition"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.count > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#7b5818] text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlist.count}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#1c1c18] hover:text-[#7b5818] transition cursor-pointer"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.totalItems > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#7b5818] text-white text-[10px] font-bold flex items-center justify-center">
                  {cart.totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop Main Navigation Bar */}
        <nav className="hidden lg:flex items-center justify-center gap-8 py-3 border-t border-[#e6e2db]/60 text-xs font-semibold uppercase tracking-widest text-[#1c1c18]">
          <Link to="/" className="hover:text-[#7b5818] transition">
            Home
          </Link>
          <Link to="/shop?isNewArrival=true" className="hover:text-[#7b5818] transition">
            New Arrivals
          </Link>

          {/* Jewellery Mega Menu Dropdown (Contains Gold, Diamond, Silver & Categories) */}
          <div
            className="py-1"
            onMouseEnter={() => setActiveMegaMenu(true)}
          >
            <button
              className="flex items-center gap-1 hover:text-[#7b5818] transition cursor-pointer"
              onClick={() => setActiveMegaMenu(!activeMegaMenu)}
            >
              <span>Jewellery</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {activeMegaMenu && (
              <MegaMenu
                categories={categories}
                collections={collections}
                onClose={() => setActiveMegaMenu(false)}
              />
            )}
          </div>

          <Link to="/shop" className="hover:text-[#7b5818] transition">
            Collections
          </Link>
          <Link to="/heritage" className="hover:text-[#7b5818] transition">
            Our Heritage
          </Link>
          <Link to="/contact" className="hover:text-[#7b5818] transition">
            Contact
          </Link>
        </nav>
      </div>

      {/* Expandable Live Search Bar Overlay */}
      {searchOpen && (
        <div className="bg-white border-b border-[#e6e2db] py-4 px-4 shadow-md animate-slide-down">
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex items-center gap-2">
            <Search className="w-5 h-5 text-[#7b5818]" />
            <input
              type="text"
              placeholder="Search for gold rings, diamond necklaces, bangles, mangalsutra..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-[#1c1c18] placeholder-[#817567]"
              autoFocus
            />
            <button
              type="submit"
              className="bg-[#7b5818] hover:bg-[#604100] text-white text-xs font-semibold uppercase px-5 py-2 rounded transition cursor-pointer"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="p-2 text-[#645d56] hover:text-[#1c1c18]"
            >
              <X className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#fdfaf5] border-b border-[#e6e2db] px-5 py-6 space-y-6 shadow-2xl animate-fade-in max-h-[85vh] overflow-y-auto">
          <div className="flex flex-col space-y-4 text-sm font-semibold uppercase tracking-wider text-[#1c1c18]">
            
            {/* Primary Page Links */}
            <div className="flex flex-col space-y-2 border-b border-[#e6e2db] pb-3">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#7b5818] transition text-base font-bold font-serif"
              >
                Home
              </Link>
              <Link
                to="/shop?isNewArrival=true"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#7b5818] transition text-sm font-bold text-[#7b5818]"
              >
                New Arrivals ★
              </Link>
            </div>

            {/* Metals & Purity Section */}
            <div className="space-y-2 border-b border-[#e6e2db] pb-4">
              <span className="text-xs uppercase text-[#7b5818] font-bold tracking-widest block flex items-center gap-1">
                💎 Metals & Purity
              </span>
              <div className="space-y-2 pl-2">
                <Link
                  to="/shop?metal=Gold"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-between items-center hover:text-[#7b5818] text-xs text-[#2c261e] font-medium transition py-1"
                >
                  <span>Gold Jewellery</span>
                  <span className="text-[10px] text-[#b98f4a] bg-[#f2ebd9] px-2 py-0.5 rounded font-mono font-bold">22K / 18K</span>
                </Link>

                <Link
                  to="/shop?metal=Diamond"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-between items-center hover:text-[#7b5818] text-xs text-[#2c261e] font-medium transition py-1"
                >
                  <span>Diamond Jewellery</span>
                  <span className="text-[10px] text-[#b98f4a] bg-[#f2ebd9] px-2 py-0.5 rounded font-mono font-bold">VVS / VS</span>
                </Link>

                <Link
                  to="/shop?metal=Silver"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-between items-center hover:text-[#7b5818] text-xs text-[#2c261e] font-medium transition py-1"
                >
                  <span>Sterling Silver</span>
                  <span className="text-[10px] text-[#b98f4a] bg-[#f2ebd9] px-2 py-0.5 rounded font-mono font-bold">925 Hallmark</span>
                </Link>

                <Link
                  to="/shop?isNewArrival=true"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block hover:text-[#7b5818] text-xs text-[#7b5818] font-bold pt-1 transition"
                >
                  Explore New Arrivals →
                </Link>
              </div>
            </div>

            {/* Categories Section */}
            <div className="space-y-2 border-b border-[#e6e2db] pb-4">
              <span className="text-xs uppercase text-[#7b5818] font-bold tracking-widest block">
                👑 Categories
              </span>
              <div className="space-y-1.5 pl-2">
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <Link
                      key={cat.id || cat.slug}
                      to={`/shop?category=${cat.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block hover:text-[#7b5818] text-xs text-[#4f4539] transition py-0.5"
                    >
                      • {cat.name}
                    </Link>
                  ))
                ) : (
                  <>
                    <Link to="/shop?category=rings" onClick={() => setMobileMenuOpen(false)} className="block hover:text-[#7b5818] text-xs text-[#4f4539] py-0.5">• Rings</Link>
                    <Link to="/shop?category=necklaces" onClick={() => setMobileMenuOpen(false)} className="block hover:text-[#7b5818] text-xs text-[#4f4539] py-0.5">• Necklaces & Chains</Link>
                    <Link to="/shop?category=earrings" onClick={() => setMobileMenuOpen(false)} className="block hover:text-[#7b5818] text-xs text-[#4f4539] py-0.5">• Earrings & Jhumkas</Link>
                    <Link to="/shop?category=bangles" onClick={() => setMobileMenuOpen(false)} className="block hover:text-[#7b5818] text-xs text-[#4f4539] py-0.5">• Bangles & Kadas</Link>
                  </>
                )}
                <Link
                  to="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block hover:text-[#7b5818] text-xs text-[#7b5818] font-semibold pt-1"
                >
                  • Browse All Categories
                </Link>
              </div>
            </div>

            {/* Curated Collections Section */}
            <div className="space-y-2 border-b border-[#e6e2db] pb-4">
              <span className="text-xs uppercase text-[#7b5818] font-bold tracking-widest block flex items-center gap-1">
                ✨ Curated Collections
              </span>
              <div className="space-y-1.5 pl-2">
                <Link to="/shop?collection=royal-heritage" onClick={() => setMobileMenuOpen(false)} className="block hover:text-[#7b5818] text-xs text-[#4f4539] py-0.5">• Royal Heritage</Link>
                <Link to="/shop?collection=everyday-luxe" onClick={() => setMobileMenuOpen(false)} className="block hover:text-[#7b5818] text-xs text-[#4f4539] py-0.5">• Everyday Luxe</Link>
                <Link to="/shop?collection=festive-elegance" onClick={() => setMobileMenuOpen(false)} className="block hover:text-[#7b5818] text-xs text-[#4f4539] py-0.5">• Festive Elegance</Link>
                <Link to="/shop?collection=bridal-craftsmanship" onClick={() => setMobileMenuOpen(false)} className="block hover:text-[#7b5818] text-xs text-[#4f4539] py-0.5">• Bridal Craftsmanship</Link>

                {collections.map((col) => (
                  <Link
                    key={col.id || col.slug}
                    to={`/shop?collection=${col.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block hover:text-[#7b5818] text-xs text-[#4f4539] py-0.5"
                  >
                    • {col.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Featured Highlight Card */}
            <div className="p-4 bg-[#f4ecd9] border border-[#d6c7a3] rounded-lg space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#7b5818] tracking-widest block">
                HANDCRAFTED PERFECTION
              </span>
              <h4 className="font-serif text-sm font-bold text-[#1c1c18]">
                Om Shilpi Signature Series
              </h4>
              <p className="text-[11px] text-[#594f42] leading-relaxed">
                Discover lightweight gold and diamond creations designed for contemporary grace.
              </p>
              <Link
                to="/shop?isFeatured=true"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-block w-full text-center bg-[#7b5818] hover:bg-[#604100] text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded transition shadow-sm mt-1"
              >
                BROWSE SIGNATURE SERIES
              </Link>
            </div>

            {/* Bottom Pages */}
            <div className="pt-2 space-y-3 border-t border-[#e6e2db]">
              <Link
                to="/heritage"
                onClick={() => setMobileMenuOpen(false)}
                className="block hover:text-[#7b5818] text-sm font-semibold transition"
              >
                Our Heritage
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block hover:text-[#7b5818] text-sm font-semibold transition"
              >
                Contact Us
              </Link>
            </div>

          </div>
        </div>
      )}
    </header>
  );
};
