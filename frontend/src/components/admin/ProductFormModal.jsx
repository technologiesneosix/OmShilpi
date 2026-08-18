import React, { useState, useEffect } from 'react';
import { X, Upload, AlertCircle, Package, DollarSign, Layers, Tag, Box } from 'lucide-react';
import { adminApi } from '../../api/admin.api';

export const ProductFormModal = ({ isOpen, onClose, product, categories = [], collections = [], onSuccess }) => {
  if (!isOpen) return null;

  const isEditing = Boolean(product?.id);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    shortDescription: '',
    description: '',
    price: '',
    compareAtPrice: '',
    makingCharge: '',
    taxRate: '3',
    metal: 'Gold',
    purity: '22K',
    grossWeight: '',
    netWeight: '',
    stoneType: '',
    stoneWeight: '',
    certification: 'BIS Hallmarked',
    categoryId: '',
    collectionId: '',
    isActive: true,
    isFeatured: false,
    isNewArrival: true,
    quantity: 10,
    lowStockThreshold: 5,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Selected file or media tab selection for product photo
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageTab, setImageTab] = useState('upload'); // 'upload' | 'media'
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [availableMedia, setAvailableMedia] = useState([]);

  useEffect(() => {
    adminApi.getProducts({ limit: 20 })
      .then(res => {
        const list = res.data?.products || res.data || [];
        const imgs = [];
        list.forEach(p => {
          if (Array.isArray(p.images)) {
            p.images.forEach(img => {
              if (img.url) imgs.push({ url: img.url, name: p.name });
            });
          }
        });
        setAvailableMedia(imgs);
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        sku: product.sku || '',
        shortDescription: product.shortDescription || '',
        description: product.description || '',
        price: product.price ? String(product.price) : '',
        compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : '',
        makingCharge: product.makingCharge ? String(product.makingCharge) : '',
        taxRate: product.taxRate ? String(product.taxRate) : '3',
        metal: product.metal || 'Gold',
        purity: product.purity || '22K',
        grossWeight: product.grossWeight ? String(product.grossWeight) : '',
        netWeight: product.netWeight ? String(product.netWeight) : '',
        stoneType: product.stoneType || '',
        stoneWeight: product.stoneWeight ? String(product.stoneWeight) : '',
        certification: product.certification || 'BIS Hallmarked',
        categoryId: product.categoryId || '',
        collectionId: product.collectionId || '',
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured ?? false,
        isNewArrival: product.isNewArrival ?? false,
        quantity: product.inventory?.quantity ?? 10,
        lowStockThreshold: product.inventory?.lowStockThreshold ?? 5,
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        sku: '',
        shortDescription: '',
        description: '',
        price: '',
        compareAtPrice: '',
        makingCharge: '',
        taxRate: '3',
        metal: 'Gold',
        purity: '22K',
        grossWeight: '',
        netWeight: '',
        stoneType: '',
        stoneWeight: '',
        certification: 'BIS Hallmarked',
        categoryId: '',
        collectionId: '',
        isActive: true,
        isFeatured: false,
        isNewArrival: true,
        quantity: 10,
        lowStockThreshold: 5,
      });
    }
    setSelectedFile(null);
    setImageUrlInput('');
    setError(null);
  }, [product, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Product Name is required.');
      return;
    }
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      setError('Valid Selling Base Price is required.');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || undefined,
        sku: formData.sku.trim() || undefined,
        shortDescription: formData.shortDescription.trim() || undefined,
        description: formData.description.trim() || undefined,
        price: Number(formData.price),
        compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined,
        makingCharge: formData.makingCharge ? Number(formData.makingCharge) : undefined,
        taxRate: formData.taxRate ? Number(formData.taxRate) : 3,
        metal: formData.metal || 'Gold',
        purity: formData.purity || '22K',
        grossWeight: formData.grossWeight ? Number(formData.grossWeight) : undefined,
        netWeight: formData.netWeight ? Number(formData.netWeight) : undefined,
        stoneType: formData.stoneType.trim() || undefined,
        stoneWeight: formData.stoneWeight ? Number(formData.stoneWeight) : undefined,
        certification: formData.certification.trim() || 'BIS Hallmarked',
        categoryId: formData.categoryId || undefined,
        collectionId: formData.collectionId || undefined,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        isNewArrival: formData.isNewArrival,
        quantity: Number(formData.quantity || 10),
        lowStockThreshold: Number(formData.lowStockThreshold || 5),
      };

      let savedProduct;
      if (isEditing) {
        const res = await adminApi.updateProduct(product.id, payload);
        savedProduct = res.data?.product || res.product || res.data || res;
      } else {
        const res = await adminApi.createProduct(payload);
        savedProduct = res.data?.product || res.product || res.data || res;
      }

      // If an image file was selected, upload via media API
      if (selectedFile && savedProduct?.id) {
        await adminApi.uploadProductImage(savedProduct.id, selectedFile).catch(err => {
          console.warn('Media upload warning:', err);
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save product details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#191a21] border border-[#7b5818]/60 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl text-slate-200 overflow-hidden">
        
        {/* Sticky Top Bar: Header + Live Product Name Indicator */}
        <div className="bg-[#16171d] border-b border-slate-800 p-4 sm:p-5 flex justify-between items-center shrink-0">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                {isEditing ? 'Edit Fine Jewellery Product' : 'Create New Fine Jewellery Product'}
              </h2>
              {formData.name.trim() && (
                <span className="bg-[#7b5818]/40 border border-[#7b5818] text-[#b98f4a] text-xs font-semibold px-2.5 py-0.5 rounded-full truncate max-w-[220px]">
                  {formData.name}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#b98f4a]">
              {isEditing ? `Product ID: ${product.id}` : 'Fill in base price, making charges, GST tax rate, and stock quantity.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs">
          
          {error && (
            <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* Section 1: Product Title & SKU */}
          <div className="space-y-4 p-4 bg-[#121318] border border-[#7b5818]/40 rounded-lg">
            <h3 className="font-serif text-sm font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#b98f4a]" /> 1. Product Title & Identifier
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#b98f4a] font-bold mb-1 text-xs">
                  Product Name * <span className="text-slate-400 font-normal">(Displayed to patrons on website)</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. 22K Royal Kundan Gold Necklace"
                  className="w-full bg-[#16171d] border border-[#7b5818] text-white p-3 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-[#7b5818]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-xs">
                  Stock Keeping Unit (SKU) <span className="text-slate-400 font-normal">(Auto-generated if blank)</span>
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={e => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g. OSJ-GLD-1985"
                  className="w-full bg-[#16171d] border border-slate-700 text-white p-3 rounded-lg text-xs font-mono outline-none focus:border-[#7b5818]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing, Making Charges & GST Tax */}
          <div className="space-y-4 p-4 bg-[#121318] border border-slate-800 rounded-lg">
            <h3 className="font-serif text-sm font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#b98f4a]" /> 2. Pricing Breakdown, Making Charges & GST
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[#b98f4a] font-bold text-xs mb-1">Selling Base Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  placeholder="50000"
                  className="w-full bg-[#16171d] border border-slate-700 text-white p-2.5 rounded text-sm font-semibold outline-none focus:border-[#7b5818]"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold text-xs mb-1">MRP / Compare Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.compareAtPrice}
                  onChange={e => setFormData({ ...formData, compareAtPrice: e.target.value })}
                  placeholder="60000"
                  className="w-full bg-[#16171d] border border-slate-700 text-white p-2.5 rounded text-sm outline-none focus:border-[#7b5818]"
                />
              </div>

              <div>
                <label className="block text-amber-300 font-semibold text-xs mb-1">Making Charge (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.makingCharge}
                  onChange={e => setFormData({ ...formData, makingCharge: e.target.value })}
                  placeholder="2500"
                  className="w-full bg-[#16171d] border border-amber-800/60 text-white p-2.5 rounded text-sm outline-none focus:border-[#7b5818]"
                />
              </div>

              <div>
                <label className="block text-emerald-400 font-semibold text-xs mb-1">GST Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.taxRate}
                  onChange={e => setFormData({ ...formData, taxRate: e.target.value })}
                  placeholder="3"
                  className="w-full bg-[#16171d] border border-emerald-800/60 text-white p-2.5 rounded text-sm outline-none focus:border-[#7b5818]"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              * Note: Base price is displayed on shop cards. Making charges and 3% GST tax are automatically itemized during customer checkout.
            </p>
          </div>

          {/* Section 3: Jewellery Specifications & Categorization */}
          <div className="space-y-4 p-4 bg-[#121318] border border-slate-800 rounded-lg">
            <h3 className="font-serif text-sm font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#b98f4a]" /> 3. Jewellery Specifications & Catalog Hierarchy
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Metal</label>
                <select
                  value={formData.metal}
                  onChange={e => setFormData({ ...formData, metal: e.target.value })}
                  className="w-full bg-[#16171d] border border-slate-700 text-white p-2 rounded"
                >
                  <option value="Gold">Gold</option>
                  <option value="Diamond">Diamond</option>
                  <option value="Silver">Silver</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Purity</label>
                <select
                  value={formData.purity}
                  onChange={e => setFormData({ ...formData, purity: e.target.value })}
                  className="w-full bg-[#16171d] border border-slate-700 text-white p-2 rounded"
                >
                  <option value="22K">22K Gold</option>
                  <option value="18K">18K Gold</option>
                  <option value="14K">14K Gold</option>
                  <option value="925">925 Sterling Silver</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Gross Wt (g)</label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.grossWeight}
                  onChange={e => setFormData({ ...formData, grossWeight: e.target.value })}
                  className="w-full bg-[#16171d] border border-slate-700 text-white p-2 rounded"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Certification</label>
                <input
                  type="text"
                  value={formData.certification}
                  onChange={e => setFormData({ ...formData, certification: e.target.value })}
                  className="w-full bg-[#16171d] border border-slate-700 text-white p-2 rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full bg-[#16171d] border border-slate-700 text-white p-2.5 rounded"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Curated Collection</label>
                <select
                  value={formData.collectionId}
                  onChange={e => setFormData({ ...formData, collectionId: e.target.value })}
                  className="w-full bg-[#16171d] border border-slate-700 text-white p-2.5 rounded"
                >
                  <option value="">-- Select Collection --</option>
                  {collections.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-[#16171d] border border-slate-700 text-white p-2.5 rounded"
                placeholder="Detailed craftsmanship narrative..."
              ></textarea>
            </div>
          </div>

          {/* Section 4: Product Photo Asset (Cloudinary & Media Tab) */}
          <div className="space-y-3 p-4 bg-[#121318] border border-slate-800 rounded-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <label className="text-slate-200 font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-[#b98f4a]" /> 4. Product Photo (Upload File or Select from Media Tab)
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setImageTab('upload')}
                  className={`px-3 py-1 text-[11px] font-bold rounded cursor-pointer transition ${
                    imageTab === 'upload' ? 'bg-[#7b5818] text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab('media')}
                  className={`px-3 py-1 text-[11px] font-bold rounded cursor-pointer transition ${
                    imageTab === 'media' ? 'bg-[#7b5818] text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Media Library Tab
                </button>
              </div>
            </div>

            {imageTab === 'upload' ? (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    setSelectedFile(e.target.files[0]);
                    setImageUrlInput('');
                  }}
                  className="w-full bg-[#16171d] border border-slate-700 text-slate-300 p-2 rounded cursor-pointer text-xs focus:border-[#7b5818]"
                />
                {selectedFile && (
                  <p className="text-[11px] text-emerald-400 mt-1 font-semibold">
                    ✓ Selected File: {selectedFile.name} (Will upload directly to Cloudinary on save)
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Image URL / Asset Link:</label>
                  <input
                    type="text"
                    value={imageUrlInput}
                    onChange={e => {
                      setImageUrlInput(e.target.value);
                      setSelectedFile(null);
                    }}
                    placeholder="https://images.unsplash.com/... or Cloudinary URL"
                    className="w-full bg-[#16171d] border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-[#7b5818]"
                  />
                </div>

                {availableMedia.length > 0 && (
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-[#b98f4a] tracking-wider mb-2">
                      Click any photo from Media Library to attach to product:
                    </span>
                    <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto p-1 bg-[#16171d] border border-slate-800 rounded">
                      {availableMedia.map((m, idx) => (
                        <img
                          key={idx}
                          src={m.url}
                          alt={m.name}
                          onClick={() => {
                            setImageUrlInput(m.url);
                            setSelectedFile(null);
                          }}
                          className={`w-full h-12 object-cover rounded cursor-pointer border-2 transition ${
                            imageUrlInput === m.url ? 'border-[#7b5818] scale-105 shadow' : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                          title={m.name}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 5: Merchandising Flags */}
          <div className="flex flex-wrap items-center gap-6 p-4 bg-[#121318] border border-slate-800 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer text-slate-200">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                className="accent-[#7b5818]"
              />
              <span>Active on Website</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-200">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="accent-[#7b5818]"
              />
              <span>Featured Bestseller</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-200">
              <input
                type="checkbox"
                checked={formData.isNewArrival}
                onChange={e => setFormData({ ...formData, isNewArrival: e.target.checked })}
                className="accent-[#7b5818]"
              />
              <span>New Arrival</span>
            </label>
          </div>

          {/* Section 6: Inventory Allocation Box */}
          <div className="p-4 bg-[#121318] border border-[#7b5818]/60 rounded-lg space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Box className="w-4 h-4 text-[#b98f4a]" />
              <h3 className="font-serif text-sm font-bold text-white">5. Inventory & Stock Allocation</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#b98f4a] font-bold mb-1 text-xs">
                  Initial Inventory Quantity (Number of Items in Stock) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full bg-[#16171d] border border-slate-700 text-white p-2.5 rounded font-bold outline-none focus:border-[#7b5818]"
                  placeholder="e.g. 25"
                />
              </div>

              <div>
                <label className="block text-slate-200 font-semibold mb-1 text-xs">
                  Low Stock Alert Threshold
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.lowStockThreshold || 5}
                  onChange={e => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                  className="w-full bg-[#16171d] border border-slate-700 text-white p-2.5 rounded text-xs outline-none focus:border-[#7b5818]"
                  placeholder="e.g. 5"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Sticky Bottom Bar: Cancel & Save Action Buttons */}
        <div className="bg-[#16171d] border-t border-slate-800 p-4 sm:p-5 flex justify-between items-center shrink-0">
          <div className="text-xs text-slate-400 hidden sm:block">
            {formData.name ? (
              <span>Target Product: <strong className="text-white">{formData.name}</strong></span>
            ) : (
              <span>Please fill in product name and selling price.</span>
            )}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-700 hover:bg-slate-800 rounded-lg font-semibold text-slate-300 text-xs transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2.5 bg-[#7b5818] hover:bg-[#604100] text-white rounded-lg font-semibold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg flex items-center gap-2"
            >
              {saving ? 'Saving Product...' : isEditing ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
