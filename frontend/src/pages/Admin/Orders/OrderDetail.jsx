import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, User, Package, CheckCircle, Clock } from 'lucide-react';
import { adminApi } from '../../../api/admin.api';
import { ProblemModal } from '../../../components/admin/ConfirmModal';

export const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getOrderById(id);
      setOrder(res.data || res.order || res);
    } catch (err) {
      console.warn('Could not fetch order:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const [problemMessage, setProblemMessage] = useState(null);

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      await adminApi.updateOrderStatus(id, newStatus);
      await fetchOrder();
    } catch (err) {
      setProblemMessage(err.message || 'Status update failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-xs text-slate-400 font-mono">Loading order detail record...</div>;
  if (!order) return <div className="p-12 text-center text-xs text-red-400">Order record not found.</div>;

  const items = order.items || [];
  
  // Resilient extraction for delivery address & customer info
  const address = order.shippingAddress || {};
  const recipientName = order.shippingFullName || address.fullName || order.user?.name || 'Valued Customer';
  const recipientPhone = order.shippingPhone || address.phone || order.user?.phone || 'Not Provided';
  const addressLine1 = order.shippingAddressLine1 || address.addressLine1 || '';
  const addressLine2 = order.shippingAddressLine2 || address.addressLine2 || '';
  const city = order.shippingCity || address.city || '';
  const state = order.shippingState || address.state || '';
  const postalCode = order.shippingPostalCode || address.postalCode || '';
  const country = order.shippingCountry || address.country || 'India';

  const subtotal = Number(order.subtotal || 0);
  const discount = Number(order.discount || 0);
  const tax = Number(order.tax || 0);
  const shippingAmount = Number(order.shippingAmount || 0);
  const total = Number(order.total || order.totalAmount || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <Link to="/admin/orders" className="text-xs text-[#b98f4a] flex items-center gap-1 hover:underline mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Orders List
          </Link>
          <h1 className="font-serif text-2xl font-bold text-white">
            Order #{order.orderNumber || order.id?.slice(-8).toUpperCase()}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-300">Status:</label>
          <select
            value={order.status || 'PENDING'}
            disabled={updating}
            onChange={(e) => handleStatusUpdate(e.target.value)}
            className="bg-[#121318] border border-[#7b5818] text-xs font-bold text-[#b98f4a] px-3 py-2 rounded outline-none cursor-pointer"
          >
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="READY_FOR_DISPATCH">READY FOR DISPATCH</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="RETURNED">RETURNED</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Items & Payment Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#16171d] border border-slate-800 rounded-lg p-6 space-y-4">
            <h3 className="font-serif text-base font-bold text-white border-b border-slate-800 pb-2">
              Order Line Items ({items.length})
            </h3>

            <div className="space-y-3">
              {items.map((item) => {
                const prod = item.product || {};
                const name = item.productNameSnapshot || prod.name || item.name || 'Fine Jewellery Piece';
                const sku = item.skuSnapshot || prod.sku || 'OMS-JEWEL';
                const unitPrice = Number(item.unitPrice || item.price || prod.price || 0);
                const itemTotalPrice = Number(item.totalPrice || unitPrice * item.quantity);
                const img = prod.images?.[0]?.url || prod.image || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=150';

                return (
                  <div key={item.id} className="flex gap-4 p-3 bg-[#121318] border border-slate-800 rounded items-center">
                    <img src={img} alt={name} className="w-16 h-16 object-cover rounded bg-slate-900 border border-slate-700" />
                    <div className="flex-1 flex justify-between items-center text-xs">
                      <div className="space-y-0.5">
                        <h4 className="font-semibold text-white text-sm">{name}</h4>
                        <p className="text-[11px] text-[#b98f4a] font-mono font-bold">SKU: {sku}</p>
                        <p className="text-slate-400">Unit Price: ₹{unitPrice.toLocaleString('en-IN')} × {item.quantity}</p>
                      </div>
                      <span className="font-bold text-white text-base">
                        ₹{itemTotalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment & Financial Breakdown Box */}
          <div className="bg-[#16171d] border border-slate-800 rounded-lg p-6 space-y-3">
            <h3 className="font-serif text-base font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#b98f4a]" /> Payment & Financial Summary
            </h3>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Items Subtotal:</span>
                <span className="font-semibold text-white">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Promotional Discount:</span>
                  <span className="font-semibold text-emerald-400">-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Estimated Taxes (GST):</span>
                <span className="font-semibold text-white">₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Insured Delivery Shipping:</span>
                <span className="font-semibold text-emerald-400">{shippingAmount === 0 ? 'FREE' : `₹${shippingAmount.toLocaleString('en-IN')}`}</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-bold border-t border-slate-700">
                <span className="text-white">Total Order Amount:</span>
                <span className="text-[#b98f4a] font-serif text-lg">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs bg-[#121318] p-3 rounded border border-slate-800">
              <span className="text-slate-400">Payment Status:</span>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                order.paymentStatus === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}>
                {order.paymentStatus || 'PENDING'}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Info & Shipping Address */}
        <div className="space-y-6">
          {/* Customer Info Box */}
          <div className="bg-[#16171d] border border-slate-800 rounded-lg p-6 space-y-3 text-xs">
            <h3 className="font-serif text-base font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-[#b98f4a]" /> Customer Details
            </h3>
            <div className="space-y-1">
              <p className="text-white font-semibold text-sm">{order.user?.name || recipientName}</p>
              <p className="text-slate-400">{order.user?.email || 'Guest Patron'}</p>
              <p className="text-slate-300 font-mono pt-1">📞 Phone: {recipientPhone}</p>
            </div>
          </div>

          {/* Delivery Address Box */}
          <div className="bg-[#16171d] border border-slate-800 rounded-lg p-6 space-y-3 text-xs">
            <h3 className="font-serif text-base font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#b98f4a]" /> Shipping Delivery Address
            </h3>
            <div className="space-y-1 text-slate-300">
              <p className="text-white font-bold text-sm">{recipientName}</p>
              <p className="text-slate-300 font-semibold">{addressLine1}</p>
              {addressLine2 && <p className="text-slate-400">{addressLine2}</p>}
              <p className="text-slate-300 font-medium">
                {city}{city && state ? ', ' : ''}{state} {postalCode ? `- ${postalCode}` : ''}
              </p>
              <p className="text-slate-400 font-semibold uppercase">{country}</p>
              <p className="text-[#b98f4a] font-mono font-semibold pt-1">📞 Contact: {recipientPhone}</p>
            </div>
          </div>
        </div>

      </div>

      <ProblemModal
        isOpen={Boolean(problemMessage)}
        title="Order Action Alert"
        message={problemMessage || ''}
        onClose={() => setProblemMessage(null)}
      />
    </div>
  );
};
