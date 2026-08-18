import React from 'react';
import { ShieldCheck, Truck, Sparkles } from 'lucide-react';

export const AnnouncementBar = () => {
  return (
    <div className="bg-[#1c1c18] text-[#fdf9f2] py-2 px-4 text-[11px] font-medium tracking-widest uppercase border-b border-[#31302c]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <Truck className="w-3.5 h-3.5 text-[#b98f4a]" />
          <span>Complimentary Insured Express Shipping Across India</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-[#d0c5b2]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#b98f4a]" /> 100% Certified & Hallmarked Jewellery
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#b98f4a]" /> Lifetime Maintenance Guarantee
          </span>
        </div>
      </div>
    </div>
  );
};
