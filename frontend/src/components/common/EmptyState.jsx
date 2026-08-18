import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = ShoppingBag,
  title = 'No items found',
  description = 'Explore our collection of fine jewellery and find something special.',
  actionLabel = 'Explore Collection',
  actionLink = '/shop',
}) => {
  return (
    <div className="text-center py-16 px-4 bg-white border border-[#e6e2db] rounded max-w-md mx-auto my-8">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#fdf9f2] text-[#7b5818] mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-serif font-semibold text-[#1c1c18] mb-2">{title}</h3>
      <p className="text-sm text-[#645d56] mb-6">{description}</p>
      {actionLink && (
        <Link
          to={actionLink}
          className="inline-block bg-[#7b5818] hover:bg-[#604100] text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider rounded transition"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
};
