import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { adminApi } from '../../api/admin.api';

export const TestimonialModal = ({ isOpen, onClose, testimonial = null, onSuccess }) => {
  const isEditing = !!testimonial;

  const [formData, setFormData] = useState({
    name: '',
    role: 'Verified Patron',
    content: '',
    rating: 5,
    isActive: true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (testimonial) {
      setFormData({
        name: testimonial.name || testimonial.author || '',
        role: testimonial.role || testimonial.location || 'Verified Patron',
        content: testimonial.content || testimonial.review || '',
        rating: testimonial.rating || 5,
        isActive: testimonial.isActive ?? true,
      });
    } else {
      setFormData({
        name: '',
        role: 'Verified Patron',
        content: '',
        rating: 5,
        isActive: true,
      });
    }
  }, [testimonial, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const payload = {
        name: formData.name.trim(),
        role: formData.role.trim() || 'Verified Patron',
        content: formData.content.trim(),
        rating: Number(formData.rating || 5),
        isActive: formData.isActive,
      };

      if (isEditing) {
        await adminApi.updateTestimonial(testimonial.id, payload);
      } else {
        await adminApi.createTestimonial(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save testimonial');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#191a21] border border-slate-700 rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl text-slate-200">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="font-serif text-lg font-bold text-white">
            {isEditing ? `Edit Review from ${testimonial.name}` : 'Add Patron Testimonial'}
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Patron Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#121318] border border-slate-700 text-white p-2.5 rounded outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Location / Tagline</label>
              <input
                type="text"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-[#121318] border border-slate-700 text-white p-2.5 rounded outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Star Rating (1 - 5)</label>
            <select
              value={formData.rating}
              onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })}
              className="w-full bg-[#121318] border border-slate-700 text-white p-2.5 rounded"
            >
              <option value="5">5 Stars (Excellent)</option>
              <option value="4">4 Stars (Good)</option>
              <option value="3">3 Stars</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Review Content *</label>
            <textarea
              rows="4"
              required
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
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
              <span>Active on Homepage</span>
            </label>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-700 rounded text-slate-300">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-[#7b5818] text-white rounded font-semibold">
              {saving ? 'Saving...' : 'Save Testimonial'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
