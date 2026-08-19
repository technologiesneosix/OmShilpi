import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useDialog } from '../../context/DialogContext';
import { ScrollReveal } from '../common/ScrollReveal';

export const ProductCard = ({ product, delay = 0 }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showAuthModal, showAlert } = useDialog();
  const [adding, setAdding] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!product) return null;

  // Extract images from backend product model
  const images = product.images || [];
  const primaryImg = images.find(img => img.isPrimary)?.url || images[0]?.url || product.image || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800';
  const hoverImg = images.length > 1 ? images[1].url : primaryImg;

  // Calculate pricing & discount
  const price = Number(product.price || 0);
  const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const discountPercent = compareAtPrice && compareAtPrice > price
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : null;

  const isSaved = isInWishlist(product.id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setAdding(true);
      setErrorMsg(null);
      await addToCart(product.id, 1);
    } catch (err) {
      const msg = err.message || 'Failed to add item';
      if (msg.toLowerCase().includes('sign in') || msg.toLowerCase().includes('login') || msg.toLowerCase().includes('authenticated')) {
        showAuthModal(msg);
      } else {
        setErrorMsg(msg);
        setTimeout(() => setErrorMsg(null), 3000);
      }
    } finally {
      setAdding(false);
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setWishlistLoading(true);
      await toggleWishlist(product);
    } catch (err) {
      const msg = err.message || 'Failed to update wishlist';
      if (msg.toLowerCase().includes('sign in') || msg.toLowerCase().includes('login') || msg.toLowerCase().includes('authenticated')) {
        showAuthModal(msg);
      } else {
        showAlert(msg, 'Notice', 'error');
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <ScrollReveal delay={delay} className="h-full">
      <div className="group relative bg-white border border-[#e6e2db] rounded overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-[#7b5818]/50 h-full">
      {/* Badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5 pointer-events-none">
        {product.isNewArrival && (
          <span className="bg-[#7b5818] text-white text-[10px] uppercase font-semibold px-2 py-0.5 tracking-wider rounded-sm shadow-sm animate-pulse-gold">
            NEW
          </span>
        )}
        {discountPercent && (
          <span className="bg-red-700 text-white text-[10px] uppercase font-semibold px-2 py-0.5 tracking-wider rounded-sm shadow-sm">
            -{discountPercent}%
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleToggleWishlist}
        disabled={wishlistLoading}
        title={isSaved ? "Remove from Wishlist" : "Save to Wishlist"}
        className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center text-[#1c1c18] hover:text-[#7b5818] hover:bg-white hover:scale-110 transition duration-300 cursor-pointer shadow-sm"
      >
        <Heart className={`w-4 h-4 transition-transform duration-300 ${isSaved ? 'fill-red-600 text-red-600 scale-110' : ''}`} />
      </button>

      {/* Product Image */}
      <Link to={`/product/${product.slug || product.id}`} className="relative block aspect-square bg-[#fdf9f2] overflow-hidden">
        <img
          src={primaryImg}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
          loading="lazy"
        />
        {hoverImg !== primaryImg && (
          <img
            src={hoverImg}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
            loading="lazy"
          />
        )}

        {/* Quick Overlay Action */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 flex items-center justify-center gap-2">
          <span className="bg-white/95 backdrop-blur-sm text-[#1c1c18] text-xs font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
            <Eye className="w-3.5 h-3.5 text-[#7b5818]" /> View Details
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category / Metal Tag */}
          <div className="text-[11px] text-[#645d56] uppercase tracking-wider font-medium mb-1">
            {product.metal || product.category?.name || 'Fine Jewellery'}
          </div>

          {/* Title */}
          <Link to={`/product/${product.slug || product.id}`} className="block">
            <h3 className="font-serif font-medium text-sm text-[#1c1c18] line-clamp-2 hover:text-[#7b5818] transition min-h-[2.5rem]">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Add to Cart */}
        <div className="mt-3 pt-3 border-t border-[#f1ede6] flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-sm text-[#1c1c18]">
                ₹{price.toLocaleString('en-IN')}
              </span>
              {compareAtPrice && compareAtPrice > price && (
                <span className="text-xs text-[#817567] line-through">
                  ₹{compareAtPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {errorMsg && <p className="text-[10px] text-red-600 mt-0.5 animate-fade-in">{errorMsg}</p>}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={adding}
            title="Add to Cart"
            className="p-2 rounded-full bg-[#7b5818] hover:bg-[#604100] text-white hover:scale-105 transition duration-300 cursor-pointer flex items-center justify-center shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
    </ScrollReveal>
  );
};
