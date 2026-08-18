import React, { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, CheckCircle, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { adminApi } from '../../../api/admin.api';
import { DataTable } from '../../../components/admin/DataTable';
import { StockAdjustModal } from '../../../components/admin/StockAdjustModal';

export const Inventory = () => {
  const [inventoryList, setInventoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all', 'low', 'out'
  const [adjustingItem, setAdjustingItem] = useState(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      let res;
      if (filterType === 'low') {
        res = await adminApi.getLowStockInventory();
      } else if (filterType === 'out') {
        res = await adminApi.getOutOfStockInventory();
      } else {
        res = await adminApi.getInventory();
      }

      const list = res.data?.inventory || res.data || res || [];
      setInventoryList(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Could not fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [filterType]);

  const columns = [
    {
      header: 'Product',
      accessor: 'product',
      render: (row) => {
        const prod = row.product || row;
        const img = prod.images?.[0]?.url || prod.image || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=100';
        return (
          <div className="flex items-center gap-3">
            <img src={img} alt={prod.name} className="w-9 h-9 object-cover rounded bg-slate-800 border border-slate-700" />
            <div>
              <span className="font-semibold text-white block">{prod.name || 'Product'}</span>
              <span className="text-[10px] text-slate-400 font-mono">SKU: {prod.sku || 'N/A'}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Current In-Stock Qty',
      accessor: 'quantity',
      render: (row) => {
        const qty = row.quantity ?? row.inventory?.quantity ?? 0;
        return (
          <span className="font-bold text-sm font-mono text-white">
            {qty} units
          </span>
        );
      },
    },
    {
      header: 'Stock Status',
      accessor: 'status',
      render: (row) => {
        const qty = row.quantity ?? row.inventory?.quantity ?? 0;
        const lowThreshold = row.lowStockThreshold ?? 5;
        let badge = 'IN_STOCK';
        if (qty <= 0) badge = 'OUT_OF_STOCK';
        else if (qty <= lowThreshold) badge = 'LOW_STOCK';

        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            badge === 'IN_STOCK'
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              : badge === 'LOW_STOCK'
              ? 'bg-amber-950 text-amber-400 border border-amber-800'
              : 'bg-red-950 text-red-400 border border-red-800'
          }`}>
            {badge}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <button
          onClick={() => setAdjustingItem(row)}
          className="px-3 py-1 bg-[#7b5818] hover:bg-[#604100] text-white rounded text-xs font-semibold transition cursor-pointer"
        >
          Adjust Stock
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#16171d] border border-slate-800 p-6 rounded-lg">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Inventory Control & Stock Audit</h1>
          <p className="text-xs text-[#b98f4a] mt-1">Real-time inventory levels, low-stock warnings, and atomic stock adjustments.</p>
        </div>

        <div className="flex gap-2 bg-[#121318] p-1.5 border border-slate-800 rounded">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded text-xs font-semibold ${filterType === 'all' ? 'bg-[#7b5818] text-white' : 'text-slate-400 hover:text-white'}`}
          >
            All Stock
          </button>
          <button
            onClick={() => setFilterType('low')}
            className={`px-3 py-1.5 rounded text-xs font-semibold ${filterType === 'low' ? 'bg-amber-900 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Low Stock Alerts
          </button>
          <button
            onClick={() => setFilterType('out')}
            className={`px-3 py-1.5 rounded text-xs font-semibold ${filterType === 'out' ? 'bg-red-900 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Out of Stock
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={inventoryList}
        loading={loading}
        onRefresh={fetchInventory}
        emptyMessage="No inventory records found for selected filter."
      />

      <StockAdjustModal
        isOpen={!!adjustingItem}
        onClose={() => setAdjustingItem(null)}
        productItem={adjustingItem}
        onSuccess={fetchInventory}
      />
    </div>
  );
};
