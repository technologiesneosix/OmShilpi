import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import { ordersApi } from '../../api/orders.api';
import { EmptyState } from '../../components/common/EmptyState';
import { ProductGridSkeleton } from '../../components/common/LoadingSkeleton';

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await ordersApi.getOrders();
        setOrders(res.data || res.orders || res || []);
      } catch (err) {
        console.warn('Could not load orders:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="p-16 text-center text-xs text-[#645d56]">Loading order history...</div>;

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={Package}
          title="No Orders Found"
          description="You haven't placed any orders yet. Discover our gold and diamond collections."
          actionLabel="Shop Now"
          actionLink="/shop"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-[#e6e2db] pb-4">
        <h1 className="font-serif text-3xl font-bold text-[#1c1c18]">My Orders</h1>
        <p className="text-xs text-[#645d56] mt-1">Review your past purchases and track current shipments</p>
      </div>

      <div className="space-y-4">
        {orders.map((ord) => (
          <div key={ord.id} className="bg-white border border-[#e6e2db] rounded p-5 space-y-4 shadow-sm">
            <div className="flex flex-wrap justify-between items-center text-xs gap-2 border-b border-[#e6e2db] pb-3">
              <div>
                <span className="font-bold text-[#1c1c18]">Order #{ord.id?.slice(-8).toUpperCase()}</span>
                <span className="text-[#645d56] ml-2">• Placed on {new Date(ord.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                ord.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {ord.status || 'CONFIRMED'}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <div>
                <p className="text-[#645d56]">{ord.items?.length || 1} Item(s)</p>
                <p className="font-bold text-[#1c1c18] text-base mt-1">
                  ₹{Number(ord.totalAmount || 0).toLocaleString('en-IN')}
                </p>
              </div>

              <Link
                to={`/orders/${ord.id}`}
                className="bg-[#7b5818] hover:bg-[#604100] text-white px-5 py-2.5 rounded font-semibold text-xs transition flex items-center gap-1"
              >
                Order Details <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
