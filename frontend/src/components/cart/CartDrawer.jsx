import React from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const CartDrawer = () => {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeItem, loading } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 border-b border-[#e6e2db] flex items-center justify-between bg-[#fdf9f2]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#7b5818]" />
              <h2 className="font-serif text-lg font-semibold text-[#1c1c18]">Your Cart ({cart.totalItems})</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full text-[#645d56] hover:text-[#1c1c18] hover:bg-[#e6e2db] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.items.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="w-12 h-12 text-[#d2c4b4] mx-auto mb-3" />
                <p className="font-serif text-base text-[#1c1c18] font-medium">Your cart is currently empty</p>
                <p className="text-xs text-[#645d56] mt-1 mb-6">Discover timeless pieces from our curated collections.</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="inline-block bg-[#7b5818] text-white text-xs font-semibold uppercase tracking-wider px-6 py-2.5 rounded hover:bg-[#604100] transition"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cart.items.map((item) => {
                const product = item.product || {};
                const price = Number(product.price || item.price || 0);
                const imgUrl = product.images?.[0]?.url || product.image || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=300';

                return (
                  <div key={item.id} className="flex gap-3 p-3 border border-[#f1ede6] rounded bg-[#fdf9f2]">
                    <img
                      src={imgUrl}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded bg-white"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-serif text-sm font-medium text-[#1c1c18] line-clamp-1">
                            {product.name}
                          </h4>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 p-0.5 transition cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {product.metal && (
                          <span className="text-[11px] text-[#645d56]">{product.metal} {product.purity ? `• ${product.purity}` : ''}</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-[#d2c4b4] rounded bg-white">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1 || loading}
                            className="p-1 hover:bg-[#f1ede6] disabled:opacity-40 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-semibold min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={loading}
                            className="p-1 hover:bg-[#f1ede6] disabled:opacity-40 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-semibold text-sm text-[#1c1c18]">
                          ₹{(price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer */}
          {cart.items.length > 0 && (
            <div className="p-4 border-t border-[#e6e2db] bg-[#fdf9f2] space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#645d56]">Subtotal</span>
                <span className="font-semibold text-[#1c1c18] text-base">
                  ₹{cart.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px] text-[#817567]">Taxes and insured shipping calculated at checkout.</p>
              
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="block text-center border border-[#7b5818] text-[#7b5818] hover:bg-[#7b5818] hover:text-white text-xs font-semibold uppercase tracking-wider py-3 rounded transition"
                >
                  View Cart
                </Link>
                <Link
                  to="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="flex items-center justify-center gap-1.5 bg-[#7b5818] hover:bg-[#604100] text-white text-xs font-semibold uppercase tracking-wider py-3 rounded transition"
                >
                  Checkout <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
