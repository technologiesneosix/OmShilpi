import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { adminApi } from '../../../api/admin.api';
import { DataTable } from '../../../components/admin/DataTable';
import { CollectionFormModal } from '../../../components/admin/CollectionFormModal';
import { ConfirmModal, ProblemModal } from '../../../components/admin/ConfirmModal';

export const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [problemMessage, setProblemMessage] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingCollection, setDeletingCollection] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getCollections();
      const list = res.data?.collections || res.data || res.collections || [];
      setCollections(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Could not load collections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleDelete = async () => {
    if (!deletingCollection) return;
    try {
      setActionLoading(true);
      await adminApi.deleteCollection(deletingCollection.id);
      setDeleteOpen(false);
      setDeletingCollection(null);
      fetchCollections();
    } catch (err) {
      setProblemMessage(err.message || 'Could not delete collection');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: 'Collection',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=100'}
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
              setEditingCollection(row);
              setModalOpen(true);
            }}
            className="p-1.5 text-slate-300 hover:text-[#b98f4a] bg-slate-800 hover:bg-slate-700 rounded transition cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setDeletingCollection(row);
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
          <h1 className="font-serif text-2xl font-bold text-white">Curated Collections</h1>
          <p className="text-xs text-[#b98f4a] mt-1">Manage seasonal showcase series (Royal Heritage, Everyday Luxe, Festive Specials, Fine Bridal).</p>
        </div>

        <button
          onClick={() => {
            setEditingCollection(null);
            setModalOpen(true);
          }}
          className="bg-[#7b5818] hover:bg-[#604100] text-white text-xs font-semibold px-5 py-2.5 rounded flex items-center gap-2 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Collection
        </button>
      </div>

      <DataTable
        columns={columns}
        data={collections}
        loading={loading}
        onRefresh={fetchCollections}
        emptyMessage="No collections found."
      />

      <CollectionFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        collection={editingCollection}
        onSuccess={fetchCollections}
      />

      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title={`Delete '${deletingCollection?.name}'`}
        message="Are you sure you want to delete this collection?"
        loading={actionLoading}
      />

      <ProblemModal
        isOpen={Boolean(problemMessage)}
        title="Collection Action Alert"
        message={problemMessage || ''}
        onClose={() => setProblemMessage(null)}
      />
    </div>
  );
};
