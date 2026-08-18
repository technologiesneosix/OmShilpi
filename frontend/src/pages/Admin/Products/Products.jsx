import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, ShieldCheck, Check, X, Sparkles, Filter } from 'lucide-react';
import { adminApi } from '../../../api/admin.api';
import { DataTable } from '../../../components/admin/DataTable';
import { ProductFormModal } from '../../../components/admin/ProductFormModal';
import { ConfirmModal } from '../../../components/admin/ConfirmModal';

export const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMetal, setSelectedMetal] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedMetal) params.metal = selectedMetal;

      const res = await adminApi.getProducts(params);
      const prodsList = res.data?.products || res.data || res.products || [];
      const meta = res.meta || res.pagination || {};

      setProducts(Array.isArray(prodsList) ? prodsList : []);
      setPagination({
        page: meta.page || page,
        totalPages: meta.totalPages || meta.pages || 1,
        total: meta.total || prodsList.length,
      });
    } catch (err) {
      console.warn('Could not fetch admin products list:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [catRes, colRes] = await Promise.all([
        adminApi.getCategories().catch(() => ({ data: [] })),
        adminApi.getCollections().catch(() => ({ data: [] })),
      ]);
      setCategories(catRes.data?.categories || catRes.data || []);
      setCollections(colRes.data?.collections || colRes.data || []);
    } catch (err) {
      console.warn('Could not fetch categories/collections:', err);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchProducts(1);
  }, [searchQuery, selectedMetal]);

  const handleToggleActive = async (prod) => {
    try {
      await adminApi.updateProduct(prod.id, { isActive: !prod.isActive });
      fetchProducts(pagination.page);
    } catch (err) {
      alert(err.message || 'Could not update status');
    }
  };

  const handleToggleFeatured = async (prod) => {
    try {
      await adminApi.updateProduct(prod.id, { isFeatured: !prod.isFeatured });
      fetchProducts(pagination.page);
    } catch (err) {
      alert(err.message || 'Could not update bestseller status');
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      setActionLoading(true);
      await adminApi.deleteProduct(deletingProduct.id);
      setDeleteOpen(false);
      setDeletingProduct(null);
      fetchProducts(pagination.page);
    } catch (err) {
      alert(err.message || 'Could not delete product');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: 'Product',
      accessor: 'name',
      render: (row) => {
        const img = row.images?.[0]?.url || row.image || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=150';
        return (
          <div className="flex items-center gap-3">
            <img src={img} alt={row.name} className="w-10 h-10 object-cover rounded bg-slate-800 border border-slate-700" />
            <div>
              <span className="font-semibold text-white block">{row.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">SKU: {row.sku || 'N/A'}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Metal & Purity',
      accessor: 'metal',
      render: (row) => (
        <span className="text-xs text-slate-300">
          {row.metal || 'Gold'} {row.purity ? `• ${row.purity}` : ''}
        </span>
      ),
    },
    {
      header: 'Price (₹)',
      accessor: 'price',
      render: (row) => (
        <div>
          <span className="font-bold text-emerald-400">₹{Number(row.price || 0).toLocaleString('en-IN')}</span>
          {row.compareAtPrice && (
            <span className="block text-[10px] text-slate-500 line-through">
              ₹{Number(row.compareAtPrice).toLocaleString('en-IN')}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Stock',
      accessor: 'inventory',
      render: (row) => {
        const qty = row.inventory?.quantity ?? 0;
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            qty > 5 ? 'bg-emerald-950 text-emerald-400' : qty > 0 ? 'bg-amber-950 text-amber-400' : 'bg-red-950 text-red-400'
          }`}>
            {qty} in stock
          </span>
        );
      },
    },
    {
      header: 'Flags',
      accessor: 'flags',
      render: (row) => (
        <div className="flex gap-1.5">
          <button
            onClick={() => handleToggleFeatured(row)}
            title="Toggle Bestseller Status"
            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
              row.isFeatured ? 'bg-[#7b5818] text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Bestseller
          </button>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (row) => (
        <button
          onClick={() => handleToggleActive(row)}
          className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
            row.isActive ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
          }`}
        >
          {row.isActive ? 'Active' : 'Draft'}
        </button>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingProduct(row);
              setFormOpen(true);
            }}
            className="p-1.5 text-slate-300 hover:text-[#b98f4a] bg-slate-800 hover:bg-slate-700 rounded transition cursor-pointer"
            title="Edit Product"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setDeletingProduct(row);
              setDeleteOpen(true);
            }}
            className="p-1.5 text-slate-300 hover:text-red-400 bg-slate-800 hover:bg-slate-700 rounded transition cursor-pointer"
            title="Delete Product"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#16171d] border border-slate-800 p-6 rounded-lg">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Product Catalog Management</h1>
          <p className="text-xs text-slate-400 mt-1">Manage jewellery specs, Cloudinary images, pricing, and stock status.</p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setFormOpen(true);
          }}
          className="bg-[#7b5818] hover:bg-[#604100] text-white text-xs font-semibold px-5 py-2.5 rounded flex items-center gap-2 transition cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex gap-3 bg-[#16171d] p-3 border border-slate-800 rounded">
        <select
          value={selectedMetal}
          onChange={(e) => setSelectedMetal(e.target.value)}
          className="bg-[#1f2028] border border-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded outline-none"
        >
          <option value="">All Metal Types</option>
          <option value="Gold">Gold</option>
          <option value="Diamond">Diamond</option>
          <option value="Silver">Silver</option>
        </select>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        pagination={pagination}
        onPageChange={fetchProducts}
        onRefresh={() => fetchProducts(pagination.page)}
        emptyMessage="No products found in backend catalog."
      />

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        product={editingProduct}
        categories={categories}
        collections={collections}
        onSuccess={() => fetchProducts(pagination.page)}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title={`Delete '${deletingProduct?.name}'`}
        message="Are you sure you want to permanently delete this product from the backend database?"
        loading={actionLoading}
      />
    </div>
  );
};
