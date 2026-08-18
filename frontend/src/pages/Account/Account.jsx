import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, MapPin, Heart, LogOut, Plus, Trash2, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { addressApi } from '../../api/address.api';
import { ordersApi } from '../../api/orders.api';

export const Account = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false,
  });

  useEffect(() => {
    const loadAccountData = async () => {
      try {
        setLoading(true);
        const [ordRes, addrRes] = await Promise.all([
          ordersApi.getOrders().catch(() => ({ data: [] })),
          addressApi.getAddresses().catch(() => ({ data: [] })),
        ]);
        setOrders(ordRes.data || ordRes.orders || ordRes || []);
        setAddresses(addrRes.data || addrRes || []);
      } catch (err) {
        console.warn('Error loading account overview:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAccountData();
  }, []);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await addressApi.createAddress(newAddr);
      setAddresses(prev => [...prev, res.data || res]);
      setShowAddressModal(false);
      setNewAddr({
        fullName: user?.name || '',
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
      alert(err.message || 'Failed to save address');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await addressApi.deleteAddress(id);
        setAddresses(addresses.filter(a => a.id !== id));
      } catch (err) {
        alert(err.message || 'Could not delete address');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* User Overview Header */}
      <div className="bg-white border border-[#e6e2db] rounded p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-full bg-[#fdf9f2] border border-[#7b5818] flex items-center justify-center text-[#7b5818] font-serif text-2xl font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold text-[#1c1c18]">{user?.name}</h1>
            <p className="text-xs text-[#645d56]">{user?.email} • {user?.phone || 'Customer'}</p>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="text-xs text-red-600 hover:bg-red-50 border border-red-200 px-4 py-2 rounded font-semibold flex items-center gap-1.5 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* Main Tabs Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Tabs */}
        <div className="bg-white border border-[#e6e2db] rounded p-3 space-y-1 h-fit text-xs font-semibold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded text-left transition cursor-pointer ${
              activeTab === 'orders' ? 'bg-[#7b5818] text-white' : 'text-[#1c1c18] hover:bg-[#fdf9f2]'
            }`}
          >
            <Package className="w-4 h-4" /> Order History ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded text-left transition cursor-pointer ${
              activeTab === 'addresses' ? 'bg-[#7b5818] text-white' : 'text-[#1c1c18] hover:bg-[#fdf9f2]'
            }`}
          >
            <MapPin className="w-4 h-4" /> Saved Addresses ({addresses.length})
          </button>
          <Link
            to="/wishlist"
            className="w-full flex items-center gap-3 px-4 py-3 rounded text-left text-[#1c1c18] hover:bg-[#fdf9f2] transition"
          >
            <Heart className="w-4 h-4" /> Saved Wishlist
          </Link>
        </div>

        {/* Tab Content Area */}
        <div className="lg:col-span-3">
          {activeTab === 'orders' && (
            <div className="bg-white border border-[#e6e2db] rounded p-6 space-y-6">
              <h3 className="font-serif text-lg font-bold text-[#1c1c18] border-b border-[#e6e2db] pb-3">
                Your Order History
              </h3>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-10 h-10 text-[#d2c4b4] mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[#1c1c18]">No Orders Placed Yet</p>
                  <p className="text-xs text-[#645d56] mt-1 mb-4">When you place orders, they will appear here with real-time tracking.</p>
                  <Link to="/shop" className="bg-[#7b5818] text-white text-xs font-semibold px-5 py-2 rounded">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div key={ord.id} className="p-4 border border-[#e6e2db] rounded bg-[#fdf9f2] space-y-3">
                      <div className="flex flex-wrap justify-between items-center text-xs gap-2 border-b border-[#e6e2db] pb-2">
                        <div>
                          <span className="font-bold text-[#1c1c18]">Order #{ord.id?.slice(-8).toUpperCase()}</span>
                          <span className="text-[#645d56] ml-2">• {new Date(ord.createdAt).toLocaleDateString('en-IN')}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          ord.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {ord.status || 'PENDING'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-1 text-xs">
                        <div>
                          <p className="text-[#645d56]">{ord.items?.length || 1} Item(s)</p>
                          <p className="font-semibold text-[#1c1c18] text-sm mt-0.5">
                            Total: ₹{Number(ord.totalAmount || 0).toLocaleString('en-IN')}
                          </p>
                        </div>
                        <Link
                          to={`/orders/${ord.id}`}
                          className="bg-[#7b5818] hover:bg-[#604100] text-white px-4 py-2 rounded font-semibold text-xs transition"
                        >
                          View Order Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="bg-white border border-[#e6e2db] rounded p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-[#e6e2db] pb-3">
                <h3 className="font-serif text-lg font-bold text-[#1c1c18]">Saved Shipping Addresses</h3>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="bg-[#7b5818] text-white text-xs font-semibold px-4 py-2 rounded flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <p className="text-xs text-[#645d56] text-center py-8">No addresses saved. Add an address for faster checkout.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="p-4 border border-[#e6e2db] rounded bg-[#fdf9f2] relative space-y-1">
                      <h4 className="font-serif text-sm font-semibold text-[#1c1c18]">{addr.fullName}</h4>
                      <p className="text-xs text-[#645d56]">{addr.addressLine1}</p>
                      {addr.addressLine2 && <p className="text-xs text-[#645d56]">{addr.addressLine2}</p>}
                      <p className="text-xs text-[#645d56]">{addr.city}, {addr.state} - {addr.postalCode}</p>
                      <p className="text-xs text-[#1c1c18] font-medium pt-1">Phone: {addr.phone}</p>
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1"
                        title="Delete Address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded border border-[#e6e2db] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-[#1c1c18] border-b border-[#e6e2db] pb-2">
              Add New Address
            </h3>

            <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#1c1c18] font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newAddr.fullName}
                  onChange={e => setNewAddr({...newAddr, fullName: e.target.value})}
                  className="w-full border border-[#d2c4b4] p-2 rounded text-xs"
                />
              </div>

              <div>
                <label className="block text-[#1c1c18] font-semibold mb-1">Phone</label>
                <input
                  type="text"
                  required
                  value={newAddr.phone}
                  onChange={e => setNewAddr({...newAddr, phone: e.target.value})}
                  className="w-full border border-[#d2c4b4] p-2 rounded text-xs"
                />
              </div>

              <div>
                <label className="block text-[#1c1c18] font-semibold mb-1">Address Line 1</label>
                <input
                  type="text"
                  required
                  value={newAddr.addressLine1}
                  onChange={e => setNewAddr({...newAddr, addressLine1: e.target.value})}
                  className="w-full border border-[#d2c4b4] p-2 rounded text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#1c1c18] font-semibold mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newAddr.city}
                    onChange={e => setNewAddr({...newAddr, city: e.target.value})}
                    className="w-full border border-[#d2c4b4] p-2 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[#1c1c18] font-semibold mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={newAddr.state}
                    onChange={e => setNewAddr({...newAddr, state: e.target.value})}
                    className="w-full border border-[#d2c4b4] p-2 rounded text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#1c1c18] font-semibold mb-1">Postal Code</label>
                <input
                  type="text"
                  required
                  value={newAddr.postalCode}
                  onChange={e => setNewAddr({...newAddr, postalCode: e.target.value})}
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
                  className="px-4 py-2 bg-[#7b5818] text-white rounded text-xs font-semibold"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
