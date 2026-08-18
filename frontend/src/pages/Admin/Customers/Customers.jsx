import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Calendar, Shield } from 'lucide-react';
import { adminApi } from '../../../api/admin.api';
import { DataTable } from '../../../components/admin/DataTable';

export const Customers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        // Extract users from registered orders or me/dashboard list
        const res = await adminApi.getOrders({ limit: 50 });
        const orders = res.data?.orders || res.data || [];
        const extractedUsersMap = new Map();
        orders.forEach(o => {
          if (o.user && o.user.email && !extractedUsersMap.has(o.user.email)) {
            extractedUsersMap.set(o.user.email, {
              id: o.user.id,
              name: o.user.name,
              email: o.user.email,
              phone: o.user.phone || o.shippingAddress?.phone || 'N/A',
              role: o.user.role || 'CUSTOMER',
              orderCount: 1,
              totalSpent: Number(o.totalAmount || 0),
              createdAt: o.user.createdAt || o.createdAt,
            });
          } else if (o.user && extractedUsersMap.has(o.user.email)) {
            const existing = extractedUsersMap.get(o.user.email);
            existing.orderCount += 1;
            existing.totalSpent += Number(o.totalAmount || 0);
          }
        });

        setUsers(Array.from(extractedUsersMap.values()));
      } catch (err) {
        console.warn('Could not fetch customer list:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const columns = [
    {
      header: 'Customer Name',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#7b5818] text-white flex items-center justify-center font-bold text-xs">
            {row.name?.charAt(0) || 'C'}
          </div>
          <div>
            <span className="font-semibold text-white block">{row.name}</span>
            <span className="text-[10px] text-slate-400">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Phone Number',
      accessor: 'phone',
      render: (row) => <span className="text-xs text-slate-300">{row.phone}</span>,
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (row) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
          {row.role}
        </span>
      ),
    },
    {
      header: 'Total Orders',
      accessor: 'orderCount',
      render: (row) => <span className="font-bold text-white text-xs">{row.orderCount} order(s)</span>,
    },
    {
      header: 'Total Value',
      accessor: 'totalSpent',
      render: (row) => <span className="font-bold text-emerald-400 text-xs">₹{row.totalSpent.toLocaleString('en-IN')}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-[#16171d] border border-slate-800 p-6 rounded-lg">
        <h1 className="font-serif text-2xl font-bold text-white">Customer Directory</h1>
        <p className="text-xs text-[#b98f4a] mt-1">Registered patron accounts and order volume summary.</p>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="No customer records found yet."
      />
    </div>
  );
};
