import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Upload, Trash2, Check, Copy, Layers } from 'lucide-react';
import { adminApi } from '../../../api/admin.api';
import { ConfirmModal, ProblemModal } from '../../../components/admin/ConfirmModal';

export const Media = () => {
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  
  // Custom CMS Modal States
  const [deleteTarget, setDeleteTarget] = useState(null); // { productId, imageId }
  const [problemMessage, setProblemMessage] = useState(null);

  // Logo upload states
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoSuccess, setLogoSuccess] = useState(null);
  const [branding, setBranding] = useState({ logoUrl: '/logo.png', faviconUrl: '/favicon.png' });

  const fetchAllMedia = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getProducts({ limit: 50 });
      const productList = res.data?.products || res.data || [];
      setProducts(productList);

      const allImgs = [];
      productList.forEach(p => {
        if (Array.isArray(p.images)) {
          p.images.forEach(img => {
            allImgs.push({
              ...img,
              productName: p.name,
              productId: p.id,
            });
          });
        }
      });
      setImages(allImgs);
    } catch (err) {
      console.warn('Could not fetch media list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMedia();

    adminApi.getBranding()
      .then(res => {
        const data = res.data || res;
        if (data.logoUrl || data.faviconUrl) {
          setBranding({ logoUrl: data.logoUrl || '/logo.png', faviconUrl: data.faviconUrl || '/favicon.png' });
        }
      })
      .catch(() => null);
  }, []);

  const handleMultiUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (products.length === 0) {
      setProblemMessage('Please create at least one product first to attach uploaded images.');
      return;
    }

    const targetProductId = products[0].id;

    try {
      setUploading(true);
      for (const file of files) {
        await adminApi.uploadProductImage(targetProductId, file).catch(err => console.warn('Single image upload failed:', err));
      }
      await fetchAllMedia();
    } catch (err) {
      setProblemMessage(err.message || 'Multi-image upload to Cloudinary failed.');
    } finally {
      setUploading(false);
    }
  };

  const confirmDeleteImage = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.deleteProductImage(deleteTarget.productId, deleteTarget.imageId);
      setDeleteTarget(null);
      await fetchAllMedia();
    } catch (err) {
      setDeleteTarget(null);
      setProblemMessage(err.message || 'Failed to delete image from Cloudinary.');
    }
  };

  const copyToClipboard = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLogoFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLogoUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result;
        await adminApi.updateBranding({ logoUrl: dataUrl });
        setBranding(prev => ({ ...prev, logoUrl: dataUrl }));
        setLogoSuccess('New store logo uploaded and applied across the website!');
        setTimeout(() => setLogoSuccess(null), 4000);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setProblemMessage(err.message || 'Logo upload failed');
    } finally {
      setLogoUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#16171d] border border-slate-800 p-6 rounded-lg">
        <h1 className="font-serif text-2xl font-bold text-white">Media Library & Cloudinary Assets</h1>
        <p className="text-xs text-[#b98f4a] mt-1">
          Upload multi-photo product galleries, manage Cloudinary assets, and update store branding logos.
        </p>
      </div>

      {/* Official Brand Logo Upload Section */}
      <div className="bg-[#16171d] border border-[#7b5818]/60 rounded-lg p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#b98f4a]" /> Storefront Brand Logo Upload
            </h3>
            <p className="text-xs text-slate-400">Upload a new transparent or high-res brand logo image file to update the Storefront and CMS immediately.</p>
          </div>

          <label className="bg-[#7b5818] hover:bg-[#604100] text-white text-xs font-semibold px-5 py-2.5 rounded cursor-pointer transition flex items-center gap-2">
            <Upload className="w-4 h-4" /> {logoUploading ? 'Uploading Logo...' : 'Upload New Logo File'}
            <input
              type="file"
              accept="image/*"
              disabled={logoUploading}
              onChange={handleLogoFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {logoSuccess && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded text-xs font-semibold text-emerald-300">
            {logoSuccess}
          </div>
        )}

        <div className="flex items-center gap-6 pt-1">
          <span className="text-xs text-slate-400">Current Active Logo:</span>
          <div className="p-3 bg-[#121318] border border-slate-800 rounded flex items-center justify-center">
            <img
              src={branding.logoUrl}
              alt="Active Storefront Logo"
              className="h-12 w-auto object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/logo.png';
              }}
            />
          </div>
        </div>
      </div>

      {/* Multi-Photo Cloudinary Upload Zone */}
      <div className="bg-[#16171d] border border-dashed border-[#7b5818]/60 rounded-lg p-8 text-center space-y-3">
        <Upload className="w-8 h-8 text-[#b98f4a] mx-auto" />
        <h3 className="font-serif text-base font-bold text-white">Multi-Photo Upload to Cloudinary</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Select multiple high-resolution JPEG, PNG, or WebP product photos simultaneously from your device.
        </p>
        
        <label className="inline-block bg-[#7b5818] hover:bg-[#604100] text-white text-xs font-semibold px-6 py-3 rounded-lg cursor-pointer transition shadow-lg">
          {uploading ? 'Uploading Multiple Photos...' : '📁 Choose Multiple Photos'}
          <input
            type="file"
            multiple
            accept="image/*"
            disabled={uploading}
            onChange={handleMultiUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Media Assets Gallery Grid */}
      <div className="bg-[#16171d] border border-slate-800 rounded-lg p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#b98f4a]" /> Global Media Assets Gallery ({images.length})
          </h3>
        </div>

        {loading ? (
          <p className="text-xs text-slate-400 text-center py-8">Loading Cloudinary media list...</p>
        ) : images.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-xs text-slate-400">No product images uploaded to Cloudinary yet.</p>
            <p className="text-[11px] text-[#b98f4a]">Use the Multi-Photo Upload button above to add photos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((img) => (
              <div key={img.id} className="bg-[#121318] border border-slate-800 rounded overflow-hidden flex flex-col justify-between group">
                <div className="aspect-square bg-slate-900 relative">
                  <img src={img.url} alt={img.altText || 'Media'} className="w-full h-full object-cover" />
                  {img.isPrimary && (
                    <span className="absolute top-2 left-2 bg-[#7b5818] text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow">
                      Primary
                    </span>
                  )}
                  {img.productName && (
                    <span className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur text-white text-[10px] truncate px-2 py-1 rounded">
                      {img.productName}
                    </span>
                  )}
                </div>

                <div className="p-2.5 flex justify-between items-center text-xs bg-[#16171d] border-t border-slate-800">
                  <button
                    onClick={() => copyToClipboard(img.url, img.id)}
                    className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white font-semibold cursor-pointer"
                  >
                    {copiedId === img.id ? (
                      <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Copied!</span>
                    ) : (
                      <span className="flex items-center gap-1"><Copy className="w-3.5 h-3.5" /> Copy URL</span>
                    )}
                  </button>

                  <button
                    onClick={() => setDeleteTarget({ productId: img.productId, imageId: img.id })}
                    className="p-1 text-slate-400 hover:text-red-400 cursor-pointer"
                    title="Delete Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Styled CMS Theme Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Media Asset"
        message="Are you sure you want to delete this product photo from Cloudinary? This action cannot be undone."
        type="danger"
        confirmText="Delete Asset"
        onConfirm={confirmDeleteImage}
        onClose={() => setDeleteTarget(null)}
      />

      {/* Styled CMS Theme Problem/Error Modal */}
      <ProblemModal
        isOpen={Boolean(problemMessage)}
        title="Media Operation Alert"
        message={problemMessage || ''}
        onClose={() => setProblemMessage(null)}
      />
    </div>
  );
};
