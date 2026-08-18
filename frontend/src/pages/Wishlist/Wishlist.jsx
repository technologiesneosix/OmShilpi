import React from 'react';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { ProductCard } from '../../components/product/ProductCard';
import { EmptyState } from '../../components/common/EmptyState';

export const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={Heart}
          title="Your Wishlist is Empty"
          description="Save your favourite gold, diamond, and silver pieces to review anytime."
          actionLabel="Explore Catalog"
          actionLink="/shop"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-[#e6e2db] pb-4">
        <h1 className="font-serif text-3xl font-bold text-[#1c1c18]">My Saved Wishlist</h1>
        <p className="text-xs text-[#645d56] mt-1">{wishlist.count} pieces saved for later</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.items.map((item) => {
          const product = item.product || item;
          return (
            <div key={item.id} className="relative">
              <ProductCard product={product} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
