import React from 'react';

export const ProductSkeleton = () => (
  <div className="animate-pulse bg-white border border-[#e6e2db] rounded overflow-hidden">
    <div className="bg-[#e6e2db] h-64 w-full"></div>
    <div className="p-4 space-y-3">
      <div className="h-3 bg-[#e6e2db] rounded w-1/3"></div>
      <div className="h-4 bg-[#e6e2db] rounded w-3/4"></div>
      <div className="h-5 bg-[#e6e2db] rounded w-1/2"></div>
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, idx) => (
      <ProductSkeleton key={idx} />
    ))}
  </div>
);

export const PageSkeleton = () => (
  <div className="animate-pulse space-y-6 max-w-7xl mx-auto px-4 py-8">
    <div className="h-10 bg-[#e6e2db] rounded w-1/4"></div>
    <div className="h-64 bg-[#e6e2db] rounded w-full"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="h-40 bg-[#e6e2db] rounded"></div>
      <div className="h-40 bg-[#e6e2db] rounded"></div>
      <div className="h-40 bg-[#e6e2db] rounded"></div>
    </div>
  </div>
);
