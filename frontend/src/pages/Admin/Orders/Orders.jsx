import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, CheckCircle2 } from 'lucide-react';
import { adminApi } from '../../../api/admin.api';
import { DataTable } from '../../../components/admin/DataTable';
import { ProblemModal } from '../../../components/admin/ConfirmModal';

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [problemMessage, setProblemMessage] = useState(null);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (selectedStatus) params.status = selectedStatus;

      const res = await adminApi.getOrders(params);
      const list = res.data?.orders || res.data || res.orders || [];
      const meta = res.meta || res.pagination || {};

      setOrders(Array.isArray(list) ? list : []);
      setPagination({
        page: meta.page || page,
        totalPages: meta.totalPages || meta.pages || 1,
        total: meta.total || list.length,
      });
    } catch (err) {
      console.warn('Could not fetch admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [selectedStatus]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      fetchOrders(pagination.page);
    } catch (err) {
      setProblemMessage(err.message || 'Failed to update order status');
    }
  };

  const columns = [
    {
      header: 'Order Reference',
      accessor: 'orderNumber',
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-white block">#{row.orderNumber || row.id?.slice(-8).toUpperCase()}</span>
          <span className="text-[10px] text-slate-400">{new Date(row.createdAt).toLocaleString('en-IN')}</span>
        </div>
      ),
    },
    {
      header: 'Customer & Delivery Location',
      accessor: 'user',
      render: (row) => {
        const addr = row.shippingAddress || {};
        const name = row.shippingFullName || addr.fullName || row.user?.name || 'Customer';
        const phone = row.shippingPhone || addr.phone || row.user?.phone || row.user?.email || '';
        const city = row.shippingCity || addr.city || '';
        return (
          <div>
            <span className="font-semibold text-white block">{name}</span>
            <span className="text-[10px] text-slate-400 block">{phone}</span>
            {city && <span className="text-[10px] text-[#b98f4a] block">📍 {city}</span>}
          </div>
        );
      },
    },
    {
      header: 'Total Payable',
      accessor: 'total',
      render: (row) => (
        <span className="font-bold text-emerald-400">
          ₹{Number(row.total || row.totalAmount || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      header: 'Fulfillment Status',
      accessor: 'status',
      render: (row) => (
        <select
          value={row.status || 'PENDING'}
          onChange={(e) => handleStatusChange(row.id, e.target.value)}
          className="bg-[#121318] border border-slate-700 text-xs font-bold text-amber-400 px-2.5 py-1 rounded cursor-pointer outline-none focus:border-[#7b5818]"
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
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <Link
          to={`/admin/orders/${row.id}`}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-[#b98f4a] rounded text-xs font-semibold inline-flex items-center gap-1 transition"
        >
          <Eye className="w-3.5 h-3.5" /> Manage
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#16171d] border border-slate-800 p-6 rounded-lg">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Order Management & Fulfillment</h1>
          <p className="text-xs text-[#b98f4a] mt-1">Review customer orders, delivery addresses, and transition fulfillment status.</p>
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-[#1f2028] border border-slate-700 text-xs font-semibold text-white px-3 py-2 rounded outline-none cursor-pointer"
        >
          <option value="">All Order Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        pagination={pagination}
        onPageChange={fetchOrders}
        onRefresh={() => fetchOrders(pagination.page)}
        emptyMessage="No customer orders found."
      />

      <ProblemModal
        isOpen={Boolean(problemMessage)}
        title="Order Status Alert"
        message={problemMessage || ''}
        onClose={() => setProblemMessage(null)}
      />
    </div>
  );
};
