import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { adminApi } from '../../api/admin.api';

export const CollectionFormModal = ({ isOpen, onClose, collection = null, onSuccess }) => {
  const isEditing = !!collection;

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    bannerImage: '',
    isActive: true,
    sortOrder: 0,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (collection) {
      setFormData({
        name: collection.name || '',
        slug: collection.slug || '',
        description: collection.description || '',
        image: collection.image || '',
        bannerImage: collection.bannerImage || '',
        isActive: collection.isActive ?? true,
        sortOrder: collection.sortOrder || 0,
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        image: '',
        bannerImage: '',
        isActive: true,
        sortOrder: 0,
      });
    }
  }, [collection, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        image: formData.image.trim() || undefined,
        bannerImage: formData.bannerImage.trim() || undefined,
        isActive: formData.isActive,
        sortOrder: Number(formData.sortOrder || 0),
      };
      if (formData.slug.trim()) payload.slug = formData.slug.trim();

      if (isEditing) {
        await adminApi.updateCollection(collection.id, payload);
      } else {
        await adminApi.createCollection(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save collection');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#191a21] border border-slate-700 rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl text-slate-200">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="font-serif text-lg font-bold text-white">
            {isEditing ? `Edit Collection: ${collection.name}` : 'Add New Curated Collection'}
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Collection Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#121318] border border-slate-700 text-white p-2.5 rounded outline-none focus:border-[#7b5818]"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Slug (Auto-generated if empty)</label>
            <input
              type="text"
              value={formData.slug}
              onChange={e => setFormData({ ...formData, slug: e.target.value })}
              className="w-full bg-[#121318] border border-slate-700 text-white p-2.5 rounded outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Cover Image URL</label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={formData.image}
              onChange={e => setFormData({ ...formData, image: e.target.value })}
              className="w-full bg-[#121318] border border-slate-700 text-white p-2.5 rounded outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#121318] border border-slate-700 text-white p-2.5 rounded"
            ></textarea>
          </div>

          <div className="flex items-center gap-4 p-3 bg-[#121318] rounded">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                className="accent-[#7b5818]"
              />
              <span>Active on Website</span>
            </label>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-700 rounded text-slate-300">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-[#7b5818] text-white rounded font-semibold">
              {saving ? 'Saving...' : 'Save Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
