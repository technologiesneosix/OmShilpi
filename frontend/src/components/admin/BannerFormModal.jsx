import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { adminApi } from '../../api/admin.api';

export const BannerFormModal = ({ isOpen, onClose, banner = null, onSuccess }) => {
  const isEditing = !!banner;

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    linkUrl: '/shop',
    buttonText: 'Explore Collection',
    isActive: true,
    sortOrder: 0,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        imageUrl: banner.imageUrl || '',
        linkUrl: banner.linkUrl || '/shop',
        buttonText: banner.buttonText || 'Explore Collection',
        isActive: banner.isActive ?? true,
        sortOrder: banner.sortOrder || 0,
      });
    } else {
      setFormData({
        title: '',
        subtitle: '',
        imageUrl: '',
        linkUrl: '/shop',
        buttonText: 'Explore Collection',
        isActive: true,
        sortOrder: 0,
      });
    }
  }, [banner, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const payload = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim() || undefined,
        imageUrl: formData.imageUrl.trim(),
        linkUrl: formData.linkUrl.trim() || '/shop',
        buttonText: formData.buttonText.trim() || 'Explore Collection',
        isActive: formData.isActive,
        sortOrder: Number(formData.sortOrder || 0),
      };

      if (isEditing) {
        await adminApi.updateBanner(banner.id, payload);
      } else {
        await adminApi.createBanner(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save hero banner');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#191a21] border border-slate-700 rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl text-slate-200">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="font-serif text-lg font-bold text-white">
            {isEditing ? `Edit Banner: ${banner.title}` : 'Add Homepage Hero Banner'}
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
            <label className="block text-slate-300 font-semibold mb-1">Banner Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-[#121318] border border-slate-700 text-white p-2.5 rounded outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Subtitle / Tagline</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full bg-[#121318] border border-slate-700 text-white p-2.5 rounded outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Banner Image URL *</label>
            <input
              type="text"
              required
              placeholder="https://images.unsplash.com/..."
              value={formData.imageUrl}
              onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full bg-[#121318] border border-slate-700 text-white p-2.5 rounded outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Button Text</label>
              <input
                type="text"
                value={formData.buttonText}
                onChange={e => setFormData({ ...formData, buttonText: e.target.value })}
                className="w-full bg-[#121318] border border-slate-700 text-white p-2.5 rounded outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Button Link</label>
              <input
                type="text"
                value={formData.linkUrl}
                onChange={e => setFormData({ ...formData, linkUrl: e.target.value })}
                className="w-full bg-[#121318] border border-slate-700 text-white p-2.5 rounded outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-[#121318] rounded">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                className="accent-[#7b5818]"
              />
              <span>Active on Homepage Hero</span>
            </label>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-700 rounded text-slate-300">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-[#7b5818] text-white rounded font-semibold">
              {saving ? 'Saving...' : 'Save Hero Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
