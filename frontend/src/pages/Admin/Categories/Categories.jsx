import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { adminApi } from '../../../api/admin.api';
import { DataTable } from '../../../components/admin/DataTable';
import { CategoryFormModal } from '../../../components/admin/CategoryFormModal';
import { ConfirmModal, ProblemModal } from '../../../components/admin/ConfirmModal';

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getCategories();
      const list = res.data?.categories || res.data || res.categories || [];
      setCategories(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Could not load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const [problemMessage, setProblemMessage] = useState(null);

  const handleDelete = async () => {
    if (!deletingCategory) return;
    try {
      setActionLoading(true);
      await adminApi.deleteCategory(deletingCategory.id);
      setDeleteOpen(false);
      setDeletingCategory(null);
      fetchCategories();
    } catch (err) {
      setProblemMessage(err.message || 'Could not delete category');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: 'Category',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.image || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=100'}
            alt={row.name}
            className="w-9 h-9 object-cover rounded bg-slate-800 border border-slate-700"
          />
          <div>
            <span className="font-semibold text-white block">{row.name}</span>
            <span className="text-[10px] text-slate-400 font-mono">slug: /{row.slug}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (row) => (
        <span className="text-xs text-slate-300 line-clamp-1 max-w-xs">
          {row.description || 'No description provided'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (row) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
          row.isActive ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
        }`}>
          {row.isActive ? 'Active' : 'Disabled'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingCategory(row);
              setModalOpen(true);
            }}
            className="p-1.5 text-slate-300 hover:text-[#b98f4a] bg-slate-800 hover:bg-slate-700 rounded transition cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setDeletingCategory(row);
              setDeleteOpen(true);
            }}
            className="p-1.5 text-slate-300 hover:text-red-400 bg-slate-800 hover:bg-slate-700 rounded transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#16171d] border border-slate-800 p-6 rounded-lg">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Categories Management</h1>
          <p className="text-xs text-[#b98f4a] mt-1">Manage storefront menu categories (Rings, Earrings, Necklaces, Bangles, etc.).</p>
        </div>

        <button
          onClick={() => {
            setEditingCategory(null);
            setModalOpen(true);
          }}
          className="bg-[#7b5818] hover:bg-[#604100] text-white text-xs font-semibold px-5 py-2.5 rounded flex items-center gap-2 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <DataTable
        columns={columns}
        data={categories}
        loading={loading}
        onRefresh={fetchCategories}
        emptyMessage="No categories found."
      />

      <CategoryFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        category={editingCategory}
        onSuccess={fetchCategories}
      />

      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title={`Delete '${deletingCategory?.name}'`}
        message="Are you sure you want to delete this category? Products belonging to this category will become uncategorized."
        loading={actionLoading}
      />

      <ProblemModal
        isOpen={Boolean(problemMessage)}
        title="Category Action Alert"
        message={problemMessage || ''}
        onClose={() => setProblemMessage(null)}
      />
    </div>
  );
};
