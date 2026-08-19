import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Plus, Check, CreditCard, ShieldCheck, ArrowRight, AlertCircle, Building2 } from 'lucide-react';
import { addressApi } from '../../api/address.api';
import { checkoutApi } from '../../api/checkout.api';
import { ordersApi } from '../../api/orders.api';
import { paymentsApi } from '../../api/payments.api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useDialog } from '../../context/DialogContext';
import { ErrorState } from '../../components/common/ErrorState';

export const Checkout = () => {
  const navigate = useNavigate();
  const { cart, fetchCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { showAlert } = useDialog();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // New Address Modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: true,
  });

  const loadCheckoutData = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const addrRes = await addressApi.getAddresses();
      const addrList = addrRes.data || addrRes || [];
      setAddresses(addrList);

      const defaultAddr = addrList.find(a => a.isDefault) || addrList[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      }

      // Fetch checkout preview
      const prevRes = await checkoutApi.getPreview({
        addressId: defaultAddr?.id,
      }).catch(() => null);

      setPreview(prevRes?.data || prevRes || null);
    } catch (err) {
      setError(err.message || 'Failed to load checkout details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCheckoutData();
  }, [isAuthenticated]);

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    try {
      setProcessing(true);
      const res = await addressApi.createAddress(newAddress);
      const created = res.data || res;
      setAddresses(prev => [...prev, created]);
      setSelectedAddressId(created.id);
      setShowAddressModal(false);
      setNewAddress({
        title: 'Home',
        recipientName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        isDefault: false,
      });
    } catch (err) {
      showAlert(err.message || 'Failed to save address', 'Address Error', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleExecutePayment = async () => {
    if (!selectedAddressId) {
      showAlert('Please select or add a delivery address to proceed.', 'Address Required', 'warning');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      // Step 1: Create internal Order
      const orderRes = await ordersApi.createOrder({
        shippingAddressId: selectedAddressId,
        paymentMethod: 'RAZORPAY',
      });
      const order = orderRes.data || orderRes.order || orderRes;
      const orderId = order.id;

      // Step 2: Initialize Razorpay Order via backend
      const rzpRes = await paymentsApi.createRazorpayOrder(orderId);
      const rzpOrderData = rzpRes.data || rzpRes;

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || rzpOrderData.key || 'rzp_test_TQRGl6jIraGkGa';

      // Step 3: Open Razorpay Checkout Popup
      const options = {
        key: razorpayKey,
        amount: rzpOrderData.amount,
        currency: rzpOrderData.currency || 'INR',
        name: 'Om Shilpi Jewels',
        description: `Payment for Order #${orderId.slice(-8).toUpperCase()}`,
        order_id: rzpOrderData.razorpayOrderId || rzpOrderData.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: addresses.find(a => a.id === selectedAddressId)?.phone || user?.phone || '',
        },
        theme: {
          color: '#7b5818',
        },
        handler: async (response) => {
          try {
            // Step 4: Verify Payment Signature on backend
            await paymentsApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            });

            await fetchCart();
            navigate(`/orders/${orderId}?success=true`);
          } catch (verErr) {
            showAlert('Payment verification failed: ' + verErr.message, 'Payment Error', 'error');
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          },
        },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        showAlert('Razorpay SDK failed to load. Please refresh and try again.', 'SDK Error', 'error');
        setProcessing(false);
      }

    } catch (err) {
      setError(err.message || 'Payment initiation failed');
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-16 text-center text-xs text-[#645d56]">Loading checkout details...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <h1 className="font-serif text-3xl font-bold text-[#1c1c18] border-b border-[#e6e2db] pb-4">
        Secure Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Address Selection & Payment */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Address Section */}
          <div className="bg-white border border-[#e6e2db] rounded p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#e6e2db] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#1c1c18] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#7b5818]" /> Shipping Address
              </h3>
              <button
                onClick={() => setShowAddressModal(true)}
                className="text-xs font-semibold text-[#7b5818] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add New Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-[#d2c4b4] rounded">
                <p className="text-xs text-[#645d56] mb-3">No saved addresses found.</p>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="bg-[#7b5818] text-white text-xs font-semibold px-4 py-2 rounded"
                >
                  Add Delivery Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-4 rounded border cursor-pointer transition relative ${
                      selectedAddressId === addr.id
                        ? 'border-[#7b5818] bg-[#fdf9f2] ring-1 ring-[#7b5818]'
                        : 'border-[#e6e2db] bg-white hover:border-[#7b5818]'
                    }`}
                  >
                    {selectedAddressId === addr.id && (
                      <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#7b5818] text-white flex items-center justify-center text-xs">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <h4 className="font-serif text-sm font-semibold text-[#1c1c18]">{addr.fullName}</h4>
                    <p className="text-xs text-[#645d56] mt-1">{addr.addressLine1}</p>
                    {addr.addressLine2 && <p className="text-xs text-[#645d56]">{addr.addressLine2}</p>}
                    <p className="text-xs text-[#645d56]">{addr.city}, {addr.state} - {addr.postalCode}</p>
                    <p className="text-xs font-medium text-[#1c1c18] mt-2">Phone: {addr.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method Section */}
          <div className="bg-white border border-[#e6e2db] rounded p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#1c1c18] flex items-center gap-2 border-b border-[#e6e2db] pb-3">
              <CreditCard className="w-5 h-5 text-[#7b5818]" /> Payment Method
            </h3>

            <div className="p-4 border border-[#7b5818] bg-[#fdf9f2] rounded flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-[#7b5818]" />
                <div>
                  <h4 className="font-serif text-sm font-semibold text-[#1c1c18]">Razorpay Secure Gateway</h4>
                  <p className="text-xs text-[#645d56]">Credit/Debit Cards, UPI, NetBanking, Wallets</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#7b5818] uppercase tracking-wider">RECOMMENDED</span>
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary */}
        <div className="bg-white border border-[#e6e2db] rounded p-6 space-y-6 h-fit">
          <h3 className="font-serif text-lg font-bold text-[#1c1c18] border-b border-[#e6e2db] pb-3">
            Cart Review ({cart.totalItems} items)
          </h3>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs">
                <span className="truncate max-w-[180px] font-medium text-[#1c1c18]">{item.product?.name} × {item.quantity}</span>
                <span className="font-semibold">₹{(Number(item.product?.price || item.price || 0) * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          {/* Price Calculations */}
          {(() => {
            let baseSubtotal = 0;
            let makingChargesTotal = 0;
            let gstTaxTotal = 0;

            cart.items.forEach((item) => {
              const p = item.product || {};
              const price = Number(p.price || item.price || 0);
              const making = Number(p.makingCharge || 0);
              const taxRate = Number(p.taxRate || 3.0);

              const itemBase = price * item.quantity;
              const itemMaking = making * item.quantity;
              const itemTax = Math.round((itemBase + itemMaking) * (taxRate / 100));

              baseSubtotal += itemBase;
              makingChargesTotal += itemMaking;
              gstTaxTotal += itemTax;
            });

            const grandTotal = baseSubtotal + makingChargesTotal + gstTaxTotal;

            return (
              <div className="pt-4 border-t border-[#e6e2db] space-y-2.5 text-xs text-[#4f4539]">
                <div className="flex justify-between">
                  <span>Jewellery Base Subtotal</span>
                  <span className="font-semibold text-[#1c1c18]">₹{baseSubtotal.toLocaleString('en-IN')}</span>
                </div>

                {makingChargesTotal > 0 && (
                  <div className="flex justify-between text-amber-900">
                    <span>Artisan Making Charges</span>
                    <span className="font-semibold">+₹{makingChargesTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-emerald-900">
                  <span>GST Tax Breakdown (3%)</span>
                  <span className="font-semibold">+₹{gstTaxTotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between">
                  <span>Insured Express Delivery</span>
                  <span className="text-green-700 font-semibold">FREE</span>
                </div>

                <div className="flex justify-between text-sm font-bold text-[#1c1c18] pt-2.5 border-t border-[#e6e2db]">
                  <span>Total Order Amount</span>
                  <span className="text-lg text-[#7b5818]">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            );
          })()}

          {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>}

          <button
            onClick={handleExecutePayment}
            disabled={processing || cart.items.length === 0}
            className="w-full bg-[#7b5818] hover:bg-[#604100] disabled:opacity-50 text-white py-3.5 rounded text-xs font-semibold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            {processing ? 'Processing Payment...' : 'Pay & Place Order'} <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-[#645d56]">
            <ShieldCheck className="w-4 h-4 text-[#7b5818]" /> 256-Bit SSL Encrypted Payment
          </div>
        </div>

      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded border border-[#e6e2db] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-[#1c1c18] border-b border-[#e6e2db] pb-2">
              Add New Delivery Address
            </h3>

            <form onSubmit={handleCreateAddress} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#1c1c18] font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newAddress.fullName}
                  onChange={e => setNewAddress({...newAddress, fullName: e.target.value})}
                  className="w-full border border-[#d2c4b4] p-2 rounded text-xs"
                />
              </div>

              <div>
                <label className="block text-[#1c1c18] font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={newAddress.phone}
                  onChange={e => setNewAddress({...newAddress, phone: e.target.value})}
                  className="w-full border border-[#d2c4b4] p-2 rounded text-xs"
                />
              </div>

              <div>
                <label className="block text-[#1c1c18] font-semibold mb-1">Address Line 1</label>
                <input
                  type="text"
                  required
                  value={newAddress.addressLine1}
                  onChange={e => setNewAddress({...newAddress, addressLine1: e.target.value})}
                  className="w-full border border-[#d2c4b4] p-2 rounded text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#1c1c18] font-semibold mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                    className="w-full border border-[#d2c4b4] p-2 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[#1c1c18] font-semibold mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={newAddress.state}
                    onChange={e => setNewAddress({...newAddress, state: e.target.value})}
                    className="w-full border border-[#d2c4b4] p-2 rounded text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#1c1c18] font-semibold mb-1">Postal Code (Pincode)</label>
                <input
                  type="text"
                  required
                  value={newAddress.postalCode}
                  onChange={e => setNewAddress({...newAddress, postalCode: e.target.value})}
                  className="w-full border border-[#d2c4b4] p-2 rounded text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 border border-[#d2c4b4] rounded text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-4 py-2 bg-[#7b5818] text-white rounded text-xs font-semibold"
                >
                  Save & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
