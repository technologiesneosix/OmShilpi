import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gem, Sparkles } from 'lucide-react';

export const MegaMenu = ({ categories = [], collections = [], onClose }) => {
  return (
    <div className="absolute top-full left-0 right-0 w-full bg-[#fdf9f2] border-b border-[#e6e2db] shadow-2xl py-8 px-6 z-50 text-left normal-case tracking-normal">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Column 1: Metals & Core Types */}
        <div>
          <h4 className="font-serif text-xs uppercase tracking-widest text-[#7b5818] font-bold mb-4 flex items-center gap-1.5">
            <Gem className="w-4 h-4" /> Metals & Purity
          </h4>
          <ul className="space-y-2.5 text-sm text-[#4f4539]">
            <li>
              <Link to="/shop?metal=Gold" onClick={onClose} className="hover:text-[#7b5818] transition flex items-center justify-between">
                <span>Gold Jewellery</span>
                <span className="text-[11px] text-[#817567]">22K / 18K</span>
              </Link>
            </li>
            <li>
              <Link to="/shop?metal=Diamond" onClick={onClose} className="hover:text-[#7b5818] transition flex items-center justify-between">
                <span>Diamond Jewellery</span>
                <span className="text-[11px] text-[#817567]">VVS / VS</span>
              </Link>
            </li>
            <li>
              <Link to="/shop?metal=Silver" onClick={onClose} className="hover:text-[#7b5818] transition flex items-center justify-between">
                <span>Sterling Silver</span>
                <span className="text-[11px] text-[#817567]">925 Hallmark</span>
              </Link>
            </li>
            <li className="pt-2">
              <Link to="/shop?isNewArrival=true" onClick={onClose} className="text-[#7b5818] font-semibold flex items-center gap-1 hover:underline">
                <span>Explore New Arrivals</span> <ArrowRight className="w-3 h-3" />
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 2: Categories */}
        <div>
          <h4 className="font-serif text-xs uppercase tracking-widest text-[#7b5818] font-bold mb-4">
            Categories
          </h4>
          <ul className="space-y-2 text-sm text-[#4f4539]">
            {categories.length > 0 ? (
              categories.slice(0, 8).map((cat) => (
                <li key={cat.id || cat.slug}>
                  <Link to={`/shop?category=${cat.slug}`} onClick={onClose} className="hover:text-[#7b5818] transition">
                    {cat.name}
                  </Link>
                </li>
              ))
            ) : (
              <>
                <li><Link to="/shop?category=rings" onClick={onClose} className="hover:text-[#7b5818]">Rings</Link></li>
                <li><Link to="/shop?category=earrings" onClick={onClose} className="hover:text-[#7b5818]">Earrings</Link></li>
                <li><Link to="/shop?category=necklaces" onClick={onClose} className="hover:text-[#7b5818]">Necklaces & Chokers</Link></li>
                <li><Link to="/shop?category=bangles" onClick={onClose} className="hover:text-[#7b5818]">Bangles & Kadas</Link></li>
                <li><Link to="/shop?category=bracelets" onClick={onClose} className="hover:text-[#7b5818]">Bracelets</Link></li>
                <li><Link to="/shop?category=pendants" onClick={onClose} className="hover:text-[#7b5818]">Pendants</Link></li>
                <li><Link to="/shop?category=mangalsutra" onClick={onClose} className="hover:text-[#7b5818]">Mangalsutra</Link></li>
              </>
            )}
          </ul>
        </div>

        {/* Column 3: Curated Collections */}
        <div>
          <h4 className="font-serif text-xs uppercase tracking-widest text-[#7b5818] font-bold mb-4 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Curated Collections
          </h4>
          <ul className="space-y-2 text-sm text-[#4f4539]">
            {collections.length > 0 ? (
              collections.slice(0, 6).map((col) => (
                <li key={col.id || col.slug}>
                  <Link to={`/shop?collection=${col.slug}`} onClick={onClose} className="hover:text-[#7b5818] transition">
                    {col.name}
                  </Link>
                </li>
              ))
            ) : (
              <>
                <li><Link to="/shop?collection=heritage" onClick={onClose} className="hover:text-[#7b5818]">Royal Heritage</Link></li>
                <li><Link to="/shop?collection=everyday-luxe" onClick={onClose} className="hover:text-[#7b5818]">Everyday Luxe</Link></li>
                <li><Link to="/shop?collection=festive" onClick={onClose} className="hover:text-[#7b5818]">Festive Elegance</Link></li>
                <li><Link to="/shop?collection=bridal" onClick={onClose} className="hover:text-[#7b5818]">Bridal Craftsmanship</Link></li>
              </>
            )}
          </ul>
        </div>

        {/* Column 4: Featured Promo Banner */}
        <div className="relative rounded overflow-hidden bg-[#fdf9f2] p-5 border border-[#e6e2db] flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#7b5818] tracking-widest">Handcrafted Perfection</span>
            <h5 className="font-serif text-lg text-[#1c1c18] font-semibold mt-1">Om Shilpi Signature Series</h5>
            <p className="text-xs text-[#645d56] mt-2">Discover lightweight gold and diamond creations designed for contemporary grace.</p>
          </div>
          <Link
            to="/shop?isFeatured=true"
            onClick={onClose}
            className="mt-4 inline-block bg-[#7b5818] text-white text-xs font-semibold uppercase tracking-wider py-2 px-4 rounded text-center hover:bg-[#604100] transition"
          >
            Browse Signature Series
          </Link>
        </div>

      </div>
    </div>
  );
};
