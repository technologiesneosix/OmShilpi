import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Plus,
} from 'lucide-react';
import { adminApi } from '../../../api/admin.api';

export const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getDashboardSummary();
      setSummary(res.data || res);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400 font-mono">Loading dashboard summary analytics...</div>;
  }

  const kpis = summary?.kpis || summary?.stats || {
    totalRevenue: summary?.totalRevenue || 0,
    totalOrders: summary?.totalOrders || 0,
    activeProducts: summary?.totalProducts || summary?.activeProducts || 0,
    totalCustomers: summary?.totalCustomers || 0,
    pendingOrders: summary?.pendingOrders || 0,
    lowStockCount: summary?.lowStockCount || 0,
  };

  const recentOrders = summary?.recentOrders || [];

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#16171d] border border-slate-800 p-6 rounded-lg">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Om Shilpi Executive Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time business performance, inventory audit, and order fulfillment monitor.</p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/admin/products?new=true"
            className="bg-[#7b5818] hover:bg-[#604100] text-white text-xs font-semibold px-4 py-2.5 rounded flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
          <Link
            to="/"
            target="_blank"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded flex items-center gap-1.5 transition"
          >
            Live Store <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-[#16171d] border border-slate-800 p-5 rounded-lg space-y-3">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs uppercase font-bold tracking-wider">Total Sales Revenue</span>
            <div className="p-2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">
            ₹{Number(kpis.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Gross processed orders
          </p>
        </div>

        <div className="bg-[#16171d] border border-slate-800 p-5 rounded-lg space-y-3">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs uppercase font-bold tracking-wider">Total Orders</span>
            <div className="p-2 rounded bg-sky-950/60 text-sky-400 border border-sky-800/60">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{kpis.totalOrders || 0}</div>
          <p className="text-[11px] text-slate-400">
            {kpis.pendingOrders || 0} pending fulfillment
          </p>
        </div>

        <div className="bg-[#16171d] border border-slate-800 p-5 rounded-lg space-y-3">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs uppercase font-bold tracking-wider">Active Catalog</span>
            <div className="p-2 rounded bg-amber-950/60 text-amber-400 border border-amber-800/60">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{kpis.activeProducts || 0}</div>
          <p className="text-[11px] text-slate-400">Active store products</p>
        </div>

        <div className="bg-[#16171d] border border-slate-800 p-5 rounded-lg space-y-3">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs uppercase font-bold tracking-wider">Low Stock Warning</span>
            <div className="p-2 rounded bg-red-950/60 text-red-400 border border-red-800/60">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{kpis.lowStockCount || 0}</div>
          <Link to="/admin/inventory" className="text-[11px] text-red-400 hover:underline inline-block">
            View stock audit list →
          </Link>
        </div>

      </div>

      {/* Recent Orders Section */}
      <div className="bg-[#16171d] border border-slate-800 rounded-lg p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#b98f4a]" /> Recent Customer Orders
          </h3>
          <Link to="/admin/orders" className="text-xs text-[#b98f4a] hover:underline font-semibold">
            View All Orders →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No recent customer orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-[#1f2028] text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/50">
                    <td className="p-3 font-mono text-white">#{ord.id?.slice(-8).toUpperCase()}</td>
                    <td className="p-3">{ord.user?.name || ord.shippingAddress?.fullName || 'Customer'}</td>
                    <td className="p-3 text-slate-400">{new Date(ord.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="p-3 font-semibold text-white">₹{Number(ord.totalAmount || 0).toLocaleString('en-IN')}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        ord.status === 'DELIVERED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {ord.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        to={`/admin/orders/${ord.id}`}
                        className="text-xs text-[#b98f4a] hover:underline font-semibold"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
