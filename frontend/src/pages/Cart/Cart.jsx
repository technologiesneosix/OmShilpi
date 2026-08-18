import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { EmptyState } from '../../components/common/EmptyState';

export const Cart = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeItem, clearCart, loading } = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          title="Your Shopping Cart is Empty"
          description="You haven't added any fine jewellery to your cart yet. Explore our curated catalog."
          actionLabel="Explore Catalog"
          actionLink="/shop"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex justify-between items-center border-b border-[#e6e2db] pb-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1c1c18]">Your Shopping Cart</h1>
          <p className="text-xs text-[#645d56] mt-1">{cart.totalItems} pieces selected</p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-red-600 hover:underline flex items-center gap-1 font-medium cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const product = item.product || {};
            const price = Number(product.price || item.price || 0);
            const imgUrl = product.images?.[0]?.url || product.image || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=300';

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border border-[#e6e2db] rounded"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={imgUrl}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded bg-[#fdf9f2] border border-[#e6e2db]"
                  />
                  <div className="space-y-1">
                    <Link to={`/product/${product.slug || product.id}`} className="font-serif text-sm font-semibold text-[#1c1c18] hover:text-[#7b5818]">
                      {product.name}
                    </Link>
                    <div className="text-xs text-[#645d56]">
                      {product.metal && <span>{product.metal}</span>}
                      {product.purity && <span> • {product.purity}</span>}
                    </div>
                    <div className="text-sm font-semibold text-[#1c1c18] pt-1">
                      ₹{price.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  {/* Quantity adjustment */}
                  <div className="flex items-center border border-[#d2c4b4] rounded bg-white">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1 || loading}
                      className="px-2.5 py-1 text-xs hover:bg-[#f1ede6] disabled:opacity-40"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={loading}
                      className="px-2.5 py-1 text-xs hover:bg-[#f1ede6] disabled:opacity-40"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="block font-semibold text-base text-[#1c1c18]">
                      ₹{(price * item.quantity).toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-red-500 hover:text-red-700 mt-1 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Box */}
        <div className="bg-white border border-[#e6e2db] rounded p-6 space-y-6 h-fit">
          <h3 className="font-serif text-lg font-bold text-[#1c1c18] border-b border-[#e6e2db] pb-3">
            Order Summary
          </h3>

          <div className="space-y-3 text-xs text-[#4f4539]">
            <div className="flex justify-between">
              <span>Subtotal ({cart.totalItems} items)</span>
              <span className="font-semibold text-[#1c1c18]">₹{cart.totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Insured Transit Shipping</span>
              <span className="font-semibold text-green-700">FREE</span>
            </div>
            <div className="flex justify-between">
              <span>GST (Included)</span>
              <span>₹0.00</span>
            </div>
            <div className="pt-3 border-t border-[#e6e2db] flex justify-between items-center text-sm">
              <span className="font-bold text-[#1c1c18]">Total Amount</span>
              <span className="font-bold text-lg text-[#7b5818]">₹{cart.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-[#7b5818] hover:bg-[#604100] text-white py-3.5 rounded text-xs font-semibold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 flex items-center gap-2 text-[11px] text-[#645d56] justify-center">
            <ShieldCheck className="w-4 h-4 text-[#7b5818]" />
            <span>Guaranteed Safe & Secure Checkout</span>
          </div>
        </div>

      </div>
    </div>
  );
};
