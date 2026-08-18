import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, CheckCircle, Sparkles, Image as ImageIcon, MessageSquareQuote } from 'lucide-react';
import { adminApi } from '../../../api/admin.api';
import { BannerFormModal } from '../../../components/admin/BannerFormModal';
import { TestimonialModal } from '../../../components/admin/TestimonialModal';
import { ConfirmModal } from '../../../components/admin/ConfirmModal';

export const Content = () => {
  const [activeTab, setActiveTab] = useState('banners'); // 'banners', 'testimonials', 'homeContent'

  // Banners & Testimonials state
  const [banners, setBanners] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Homepage CMS metadata state
  const [homeContent, setHomeContent] = useState({
    hero: { title: '', subtitle: '', description: '', ctaText: 'Explore Collection', ctaLink: '/shop' },
    brandMessage: { title: '', description: '' },
    about: { title: '', description: '' },
    announcementText: 'Complimentary Insured Express Shipping Across India',
    storePhone: '+91 (022) 2890-4821',
    storeEmail: 'care@omshilpijewels.com',
  });
  const [savingCms, setSavingCms] = useState(false);
  const [cmsSavedMsg, setCmsSavedMsg] = useState(false);

  // Modals state
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [testimonialModalOpen, setTestimonialModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingTarget, setDeletingTarget] = useState(null); // { type: 'banner'|'testimonial', item: {} }

  const loadData = async () => {
    try {
      setLoading(true);
      const [bannersRes, testimonialsRes, homeRes] = await Promise.all([
        adminApi.getBanners().catch(() => ({ data: [] })),
        adminApi.getTestimonials().catch(() => ({ data: [] })),
        adminApi.getHomepageContent().catch(() => ({ data: {} })),
      ]);

      const b = bannersRes.data?.banners || bannersRes.data || [];
      const t = testimonialsRes.data?.testimonials || testimonialsRes.data || [];
      const hc = homeRes.data || homeRes || {};

      setBanners(Array.isArray(b) ? b : []);
      setTestimonials(Array.isArray(t) ? t : []);
      if (hc.hero || hc.brandMessage) {
        setHomeContent(prev => ({
          ...prev,
          ...hc,
        }));
      }
    } catch (err) {
      console.warn('Could not load CMS content:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveHomepageContent = async (e) => {
    e.preventDefault();
    try {
      setSavingCms(true);
      await adminApi.updateHomepageContent(homeContent);
      setCmsSavedMsg(true);
      setTimeout(() => setCmsSavedMsg(false), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update homepage content');
    } finally {
      setSavingCms(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingTarget) return;
    try {
      if (deletingTarget.type === 'banner') {
        await adminApi.deleteBanner(deletingTarget.item.id);
      } else {
        await adminApi.deleteTestimonial(deletingTarget.item.id);
      }
      setDeleteOpen(false);
      setDeletingTarget(null);
      loadData();
    } catch (err) {
      alert(err.message || 'Delete operation failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#16171d] border border-slate-800 p-6 rounded-lg">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Website Content CMS</h1>
          <p className="text-xs text-[#b98f4a] mt-1">Manage hero banners, customer testimonials, brand story, and header announcements.</p>
        </div>

        <div className="flex gap-2 bg-[#121318] p-1.5 border border-slate-800 rounded">
          <button
            onClick={() => setActiveTab('banners')}
            className={`px-3 py-1.5 rounded text-xs font-semibold ${activeTab === 'banners' ? 'bg-[#7b5818] text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Hero Banners
          </button>
          <button
            onClick={() => setActiveTab('testimonials')}
            className={`px-3 py-1.5 rounded text-xs font-semibold ${activeTab === 'testimonials' ? 'bg-[#7b5818] text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Testimonials
          </button>
          <button
            onClick={() => setActiveTab('homeContent')}
            className={`px-3 py-1.5 rounded text-xs font-semibold ${activeTab === 'homeContent' ? 'bg-[#7b5818] text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Homepage Content
          </button>
        </div>
      </div>

      {/* TAB 1: HERO BANNERS */}
      {activeTab === 'banners' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#b98f4a]" /> Hero Carousel Banners
            </h3>
            <button
              onClick={() => {
                setEditingBanner(null);
                setBannerModalOpen(true);
              }}
              className="bg-[#7b5818] text-white text-xs font-semibold px-4 py-2 rounded flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Hero Banner
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((b) => (
              <div key={b.id} className="bg-[#16171d] border border-slate-800 rounded-lg overflow-hidden flex flex-col justify-between">
                <div className="aspect-21/9 bg-slate-900 relative">
                  <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                  <span className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                    b.isActive ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {b.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="font-serif text-base font-bold text-white">{b.title}</h4>
                  {b.subtitle && <p className="text-xs text-slate-400">{b.subtitle}</p>}
                  <p className="text-[11px] text-[#b98f4a] font-mono">Link: {b.linkUrl}</p>
                </div>
                <div className="p-3 border-t border-slate-800 flex justify-end gap-2 bg-[#121318]">
                  <button
                    onClick={() => {
                      setEditingBanner(b);
                      setBannerModalOpen(true);
                    }}
                    className="p-1.5 text-slate-300 hover:text-[#b98f4a] bg-slate-800 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setDeletingTarget({ type: 'banner', item: b });
                      setDeleteOpen(true);
                    }}
                    className="p-1.5 text-slate-300 hover:text-red-400 bg-slate-800 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: TESTIMONIALS */}
      {activeTab === 'testimonials' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <MessageSquareQuote className="w-5 h-5 text-[#b98f4a]" /> Customer Testimonials
            </h3>
            <button
              onClick={() => {
                setEditingTestimonial(null);
                setTestimonialModalOpen(true);
              }}
              className="bg-[#7b5818] text-white text-xs font-semibold px-4 py-2 rounded flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Testimonial
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-[#16171d] border border-slate-800 rounded-lg p-5 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <span className="text-amber-400 font-bold text-xs">{"★".repeat(t.rating || 5)}</span>
                  <p className="text-xs text-slate-300 italic">"{t.content || t.review}"</p>
                </div>
                <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-white text-xs">{t.name || t.author}</h5>
                    <p className="text-[10px] text-slate-400">{t.role || t.location || 'Verified Patron'}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingTestimonial(t);
                        setTestimonialModalOpen(true);
                      }}
                      className="p-1 text-slate-300 hover:text-[#b98f4a]"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingTarget({ type: 'testimonial', item: t });
                        setDeleteOpen(true);
                      }}
                      className="p-1 text-slate-300 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: HOMEPAGE CONTENT & ANNOUNCEMENTS */}
      {activeTab === 'homeContent' && (
        <form onSubmit={handleSaveHomepageContent} className="bg-[#16171d] border border-slate-800 rounded-lg p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-serif text-lg font-bold text-white">Homepage Content & Brand Message</h3>
            <button
              type="submit"
              disabled={savingCms}
              className="bg-[#7b5818] hover:bg-[#604100] text-white text-xs font-semibold px-5 py-2 rounded flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" /> {savingCms ? 'Saving...' : 'Save CMS Content'}
            </button>
          </div>

          {cmsSavedMsg && (
            <div className="p-3 bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs rounded flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Website content saved! Changes are live on customer storefront.
            </div>
          )}

          {/* Hero Content Section */}
          <div className="space-y-3 p-4 bg-[#121318] rounded border border-slate-800">
            <h4 className="font-serif text-sm font-bold text-[#b98f4a]">Hero Headline & Subtitle</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Hero Title</label>
                <input
                  type="text"
                  value={homeContent.hero?.title || ''}
                  onChange={e => setHomeContent({
                    ...homeContent,
                    hero: { ...homeContent.hero, title: e.target.value }
                  })}
                  className="w-full bg-[#1a1b23] border border-slate-700 text-white p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Hero Subtitle</label>
                <input
                  type="text"
                  value={homeContent.hero?.subtitle || ''}
                  onChange={e => setHomeContent({
                    ...homeContent,
                    hero: { ...homeContent.hero, subtitle: e.target.value }
                  })}
                  className="w-full bg-[#1a1b23] border border-slate-700 text-white p-2 rounded"
                />
              </div>
            </div>
          </div>

          {/* Announcement Bar & Contact Settings */}
          <div className="space-y-3 p-4 bg-[#121318] rounded border border-slate-800">
            <h4 className="font-serif text-sm font-bold text-[#b98f4a]">Announcement Bar & Store Details</h4>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Top Announcement Bar Text</label>
                <input
                  type="text"
                  value={homeContent.announcementText || ''}
                  onChange={e => setHomeContent({ ...homeContent, announcementText: e.target.value })}
                  className="w-full bg-[#1a1b23] border border-slate-700 text-white p-2 rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Store Phone</label>
                  <input
                    type="text"
                    value={homeContent.storePhone || ''}
                    onChange={e => setHomeContent({ ...homeContent, storePhone: e.target.value })}
                    className="w-full bg-[#1a1b23] border border-slate-700 text-white p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Store Email</label>
                  <input
                    type="email"
                    value={homeContent.storeEmail || ''}
                    onChange={e => setHomeContent({ ...homeContent, storeEmail: e.target.value })}
                    className="w-full bg-[#1a1b23] border border-slate-700 text-white p-2 rounded"
                  />
                </div>
              </div>
            </div>
          </div>

        </form>
      )}

      {/* Modals */}
      <BannerFormModal
        isOpen={bannerModalOpen}
        onClose={() => setBannerModalOpen(false)}
        banner={editingBanner}
        onSuccess={loadData}
      />

      <TestimonialModal
        isOpen={testimonialModalOpen}
        onClose={() => setTestimonialModalOpen(false)}
        testimonial={editingTestimonial}
        onSuccess={loadData}
      />

      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteItem}
        title="Confirm Deletion"
        message="Are you sure you want to delete this content item?"
      />
    </div>
  );
};
