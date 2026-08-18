import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Award, Clock, Sparkles } from 'lucide-react';

export const Heritage = () => {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Header */}
      <section className="bg-[#1c1c18] text-[#fdf9f2] py-20 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 space-y-4 relative z-10">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#b98f4a]">ESTABLISHED 1985</span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold">Four Decades of Master Artistry</h1>
          <p className="text-sm text-[#d0c5b2] max-w-2xl mx-auto leading-relaxed">
            The story of Om Shilpi Jewels is rooted in an unyielding passion for authentic Indian jewellery design, ethical diamond sourcing, and unblemished gold purity.
          </p>
        </div>
      </section>

      {/* Brand Story Details */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-4">
          <span className="text-xs uppercase font-bold tracking-widest text-[#7b5818]">Our Legacy</span>
          <h2 className="font-serif text-3xl font-bold text-[#1c1c18]">Preserving Royal Heritage Design</h2>
          <p className="text-xs sm:text-sm text-[#645d56] leading-relaxed">
            Founded in the historic jewellery district of Zaveri Bazaar, Om Shilpi Jewels began as a boutique goldsmith workshop. Over forty years, our brand has grown into a trusted hallmark brand across India.
          </p>
          <p className="text-xs sm:text-sm text-[#645d56] leading-relaxed">
            Every creation is inspected by senior gemologists and certified master craftsmen to ensure that purity, net weight, and setting integrity exceed international benchmarks.
          </p>
        </div>
        <div className="rounded overflow-hidden shadow-lg border border-[#e6e2db] aspect-4/3 bg-[#fdf9f2]">
          <img
            src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800"
            alt="Craftsmanship"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-[#f7ede0] py-16 border-y border-[#e6e2db]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-white rounded border border-[#e6e2db] space-y-3">
            <ShieldCheck className="w-8 h-8 text-[#7b5818] mx-auto" />
            <h3 className="font-serif text-lg font-bold text-[#1c1c18]">100% Purity Guarantee</h3>
            <p className="text-xs text-[#645d56]">Every gold ornament is stamped with official BIS Hallmark certification and Karatometer verified.</p>
          </div>
          <div className="p-6 bg-white rounded border border-[#e6e2db] space-y-3">
            <Award className="w-8 h-8 text-[#7b5818] mx-auto" />
            <h3 className="font-serif text-lg font-bold text-[#1c1c18]">Ethical Sourcing</h3>
            <p className="text-xs text-[#645d56]">We use natural, conflict-free diamonds certified by IGI (International Gemological Institute).</p>
          </div>
          <div className="p-6 bg-white rounded border border-[#e6e2db] space-y-3">
            <Clock className="w-8 h-8 text-[#7b5818] mx-auto" />
            <h3 className="font-serif text-lg font-bold text-[#1c1c18]">Lifetime Privilege</h3>
            <p className="text-xs text-[#645d56]">Enjoy lifetime buyback guarantees and complimentary maintenance services at all authorized showrooms.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
