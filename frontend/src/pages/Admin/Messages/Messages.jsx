import React, { useState, useEffect } from 'react';
import { MessageSquare, Mail, Phone, Clock, CheckCircle } from 'lucide-react';
import { adminApi } from '../../../api/admin.api';
import { DataTable } from '../../../components/admin/DataTable';

export const Messages = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getEnquiries();
      const list = res.data?.enquiries || res.data || [];
      setEnquiries(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Could not fetch enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await adminApi.updateEnquiryStatus(id, status);
      fetchEnquiries();
    } catch (err) {
      alert(err.message || 'Failed to update enquiry status');
    }
  };

  const columns = [
    {
      header: 'Customer',
      accessor: 'name',
      render: (row) => (
        <div>
          <span className="font-semibold text-white block">{row.name}</span>
          <span className="text-[10px] text-slate-400">{row.email} • {row.phone || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Subject',
      accessor: 'subject',
      render: (row) => (
        <span className="font-semibold text-[#b98f4a] text-xs block">
          {row.subject || 'General Enquiry'}
        </span>
      ),
    },
    {
      header: 'Message',
      accessor: 'message',
      render: (row) => (
        <p className="text-xs text-slate-300 line-clamp-2 max-w-sm">
          {row.message}
        </p>
      ),
    },
    {
      header: 'Received Date',
      accessor: 'createdAt',
      render: (row) => (
        <span className="text-xs text-slate-400">
          {new Date(row.createdAt).toLocaleDateString('en-IN')}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <select
          value={row.status || 'NEW'}
          onChange={(e) => handleStatusChange(row.id, e.target.value)}
          className="bg-[#121318] border border-slate-700 text-xs font-bold text-[#b98f4a] px-2 py-1 rounded cursor-pointer outline-none"
        >
          <option value="NEW">NEW</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="CLOSED">CLOSED</option>
        </select>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-[#16171d] border border-slate-800 p-6 rounded-lg">
        <h1 className="font-serif text-2xl font-bold text-white">Customer Enquiries & Messages</h1>
        <p className="text-xs text-[#b98f4a] mt-1">Review contact form submissions, custom design requests, and concierge messages.</p>
      </div>

      <DataTable
        columns={columns}
        data={enquiries}
        loading={loading}
        onRefresh={fetchEnquiries}
        emptyMessage="No customer messages received yet."
      />
    </div>
  );
};
