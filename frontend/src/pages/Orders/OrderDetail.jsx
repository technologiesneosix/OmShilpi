import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Package, CheckCircle2, MapPin, CreditCard, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';
import { ordersApi } from '../../api/orders.api';
import { ErrorState } from '../../components/common/ErrorState';

export const OrderDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isJustConfirmed = searchParams.get('success') === 'true';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ordersApi.getOrderById(id);
      setOrder(res.data || res.order || res);
    } catch (err) {
      setError(err.message || 'Unable to retrieve order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrderDetail();
  }, [id]);

  if (loading) return <div className="p-16 text-center text-xs text-[#645d56]">Loading order details...</div>;
  if (error || !order) return <ErrorState message={error || 'Order not found'} onRetry={loadOrderDetail} />;

  const items = order.items || [];
  const address = order.shippingAddress || {};

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Confirmation Success Banner */}
      {isJustConfirmed && (
        <div className="bg-green-50 border border-green-200 rounded p-6 text-center space-y-2">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-green-900">Payment Verified & Order Confirmed!</h2>
          <p className="text-xs text-green-800">
            Thank you for shopping with Om Shilpi Jewels. Your order has been placed successfully and sent to our master jewel artisans for dispatch processing.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-[#e6e2db] pb-4">
        <div>
          <Link to="/orders" className="text-xs text-[#7b5818] font-semibold flex items-center gap-1 hover:underline mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Orders
          </Link>
          <h1 className="font-serif text-2xl font-bold text-[#1c1c18]">
            Order #{order.id?.slice(-8).toUpperCase()}
          </h1>
          <p className="text-xs text-[#645d56] mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <span className="bg-[#7b5818] text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider">
          {order.status || 'CONFIRMED'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Items List */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white border border-[#e6e2db] rounded p-6 space-y-4">
            <h3 className="font-serif text-base font-bold text-[#1c1c18] border-b border-[#e6e2db] pb-2">
              Ordered Items ({items.length})
            </h3>

            <div className="space-y-4">
              {items.map((item) => {
                const product = item.product || {};
                const price = Number(item.price || product.price || 0);
                const imgUrl = product.images?.[0]?.url || product.image || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=300';

                return (
                  <div key={item.id} className="flex gap-4 p-3 border border-[#f1ede6] rounded bg-[#fdf9f2]">
                    <img src={imgUrl} alt={product.name} className="w-16 h-16 object-cover rounded bg-white" />
                    <div className="flex-1 flex justify-between items-start">
                      <div>
                        <h4 className="font-serif text-sm font-semibold text-[#1c1c18]">{product.name || item.name}</h4>
                        <p className="text-xs text-[#645d56]">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-semibold text-sm text-[#1c1c18]">
                        ₹{(price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Shipping & Payment Summary */}
        <div className="space-y-6">
          <div className="bg-white border border-[#e6e2db] rounded p-6 space-y-3">
            <h3 className="font-serif text-base font-bold text-[#1c1c18] flex items-center gap-2 border-b border-[#e6e2db] pb-2">
              <MapPin className="w-4 h-4 text-[#7b5818]" /> Shipping Details
            </h3>
            <div className="text-xs text-[#4f4539] space-y-1">
              <p className="font-bold text-[#1c1c18]">{address.fullName || order.user?.name}</p>
              <p>{address.addressLine1}</p>
              {address.addressLine2 && <p>{address.addressLine2}</p>}
              <p>{address.city}, {address.state} - {address.postalCode}</p>
              <p className="pt-1">Phone: {address.phone || order.user?.phone}</p>
            </div>
          </div>

          <div className="bg-white border border-[#e6e2db] rounded p-6 space-y-3">
            <h3 className="font-serif text-base font-bold text-[#1c1c18] flex items-center gap-2 border-b border-[#e6e2db] pb-2">
              <CreditCard className="w-4 h-4 text-[#7b5818]" /> Payment Summary
            </h3>
            <div className="text-xs text-[#4f4539] space-y-2">
              <div className="flex justify-between"><span>Payment Method</span><strong className="text-[#1c1c18]">{order.paymentMethod || 'RAZORPAY'}</strong></div>
              <div className="flex justify-between"><span>Payment Status</span><strong className="text-green-700">{order.paymentStatus || 'PAID'}</strong></div>
              <div className="flex justify-between text-sm font-bold text-[#1c1c18] pt-2 border-t border-[#f1ede6]">
                <span>Total Amount Paid</span>
                <span className="text-[#7b5818]">₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
