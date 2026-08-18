import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, ShieldCheck, Database, CreditCard, Building2, Server, Image as ImageIcon, Save, CheckCircle } from 'lucide-react';
import { adminApi } from '../../../api/admin.api';

export const Settings = () => {
  const [healthStatus, setHealthStatus] = useState('Checking...');
  const [logoUrl, setLogoUrl] = useState('/logo.png');
  const [faviconUrl, setFaviconUrl] = useState('/favicon.png');
  const [savingBrand, setSavingBrand] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const [storeInfo, setStoreInfo] = useState({
    brandName: 'Om Shilpi Jewels Private Limited',
    flagshipAddress: 'Flagship Store, Zaveri Bazaar, Mumbai, Maharashtra 400002',
    conciergeEmail: 'care@omshilpijewels.com',
    phone: '+91 (022) 2890-4821 / +91 98200 12345',
    bisHallmarkId: 'HM-MH-1985-OSJ',
  });
  const [savingStoreInfo, setSavingStoreInfo] = useState(false);
  const [storeInfoMsg, setStoreInfoMsg] = useState(null);

  useEffect(() => {
    fetch('/api/v1/health')
      .then(res => res.json())
      .then(data => setHealthStatus(data.status || 'OPERATIONAL'))
      .catch(() => setHealthStatus('OFFLINE'));

    // Fetch live branding
    adminApi.getBranding()
      .then(res => {
        const data = res.data || res;
        if (data.logoUrl) setLogoUrl(data.logoUrl);
        if (data.faviconUrl) setFaviconUrl(data.faviconUrl);
      })
      .catch(() => null);

    // Fetch live store info
    adminApi.getStoreInfo()
      .then(res => {
        const data = res.data || res;
        if (data.brandName) {
          setStoreInfo({
            brandName: data.brandName || '',
            flagshipAddress: data.flagshipAddress || '',
            conciergeEmail: data.conciergeEmail || '',
            phone: data.phone || '',
            bisHallmarkId: data.bisHallmarkId || '',
          });
        }
      })
      .catch(() => null);
  }, []);

  const handleSaveStoreInfo = async (e) => {
    e.preventDefault();
    try {
      setSavingStoreInfo(true);
      setStoreInfoMsg(null);
      await adminApi.updateStoreInfo(storeInfo);
      setStoreInfoMsg('Store Headquarters Information saved successfully!');
      setTimeout(() => setStoreInfoMsg(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update store information');
    } finally {
      setSavingStoreInfo(false);
    }
  };

  const handleSaveBranding = async (e) => {
    e.preventDefault();
    try {
      setSavingBrand(true);
      setSuccessMsg(null);
      await adminApi.updateBranding({ logoUrl, faviconUrl });
      
      // Update DOM favicon dynamically
      const faviconElem = document.querySelector("link[rel='icon']");
      if (faviconElem) faviconElem.href = faviconUrl;

      setSuccessMsg('Storefront Brand Logo and Website Favicon updated successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update brand assets');
    } finally {
      setSavingBrand(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#16171d] border border-slate-800 p-6 rounded-lg">
        <h1 className="font-serif text-2xl font-bold text-white">System Settings & Brand Management</h1>
        <p className="text-xs text-[#b98f4a] mt-1">Manage storefront brand logo, browser favicon, backend health, and payment gateway configuration.</p>
      </div>

      {/* Brand Identity & Favicon Management Section */}
      <form onSubmit={handleSaveBranding} className="bg-[#16171d] border border-slate-800 rounded-lg p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#b98f4a]" /> Storefront Logo & Website Favicon CMS
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Customize the brand logo and browser favicon displayed across the storefront and admin portal.</p>
          </div>

          <button
            type="submit"
            disabled={savingBrand}
            className="bg-[#7b5818] hover:bg-[#604100] text-white text-xs font-semibold px-5 py-2.5 rounded flex items-center gap-2 transition cursor-pointer"
          >
            <Save className="w-4 h-4" /> {savingBrand ? 'Saving Assets...' : 'Save Brand Assets'}
          </button>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded text-xs font-semibold text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Logo Field & Preview */}
          <div className="space-y-3 p-4 bg-[#121318] border border-slate-800 rounded-lg">
            <label className="block text-slate-200 font-semibold text-xs uppercase tracking-wider">
              Storefront & CMS Brand Logo URL
            </label>
            
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={logoUrl}
                onChange={e => setLogoUrl(e.target.value)}
                placeholder="/logo.png or https://..."
                className="w-full bg-[#16171d] border border-slate-700 text-white p-2.5 rounded text-xs font-mono outline-none focus:border-[#7b5818]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <label className="bg-[#1f2028] hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded cursor-pointer transition inline-flex items-center gap-1.5">
                <span>📁 Upload Logo Image File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setLogoUrl(reader.result);
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="hidden"
                />
              </label>
              <span className="text-[10px] text-slate-400">Upload from local device or Media tab</span>
            </div>

            <div className="pt-2">
              <span className="block text-[11px] text-slate-400 mb-2">Live Logo Preview:</span>
              <div className="p-4 bg-[#16171d] border border-slate-800 rounded flex items-center justify-center min-h-[90px]">
                <img
                  src={logoUrl}
                  alt="Brand Logo Preview"
                  className="max-h-16 w-auto object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/logo.png';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Favicon Field & Preview */}
          <div className="space-y-3 p-4 bg-[#121318] border border-slate-800 rounded-lg">
            <label className="block text-slate-200 font-semibold text-xs uppercase tracking-wider">
              Website Browser Favicon Icon URL
            </label>
            
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={faviconUrl}
                onChange={e => setFaviconUrl(e.target.value)}
                placeholder="/favicon.png or https://..."
                className="w-full bg-[#16171d] border border-slate-700 text-white p-2.5 rounded text-xs font-mono outline-none focus:border-[#7b5818]"
              />
            </div>

            <div className="pt-2">
              <span className="block text-[11px] text-slate-400 mb-2">Browser Favicon Icon Preview:</span>
              <div className="p-4 bg-[#16171d] border border-slate-800 rounded flex items-center justify-center min-h-[90px]">
                <div className="flex items-center gap-3 p-3 bg-[#201b0f] border border-[#7b5818]/40 rounded">
                  <img
                    src={faviconUrl}
                    alt="Favicon Preview"
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/favicon.png';
                    }}
                  />
                  <span className="text-xs font-serif text-[#b98f4a]">Om Shilpi Tab Icon</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Store & Headquarters Info Form */}
        <form onSubmit={handleSaveStoreInfo} className="bg-[#16171d] border border-slate-800 rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#b98f4a]" /> Store Headquarters Information
            </h3>
            <button
              type="submit"
              disabled={savingStoreInfo}
              className="bg-[#7b5818] hover:bg-[#604100] text-white text-xs font-semibold px-4 py-1.5 rounded flex items-center gap-1.5 transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" /> {savingStoreInfo ? 'Saving...' : 'Save Details'}
            </button>
          </div>

          {storeInfoMsg && (
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-800 rounded text-xs font-semibold text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> {storeInfoMsg}
            </div>
          )}

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Store Brand Name *</label>
              <input
                type="text"
                required
                value={storeInfo.brandName}
                onChange={e => setStoreInfo({ ...storeInfo, brandName: e.target.value })}
                className="w-full bg-[#121318] border border-slate-700 text-white p-2 rounded outline-none focus:border-[#7b5818] font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Flagship Location Address *</label>
              <input
                type="text"
                required
                value={storeInfo.flagshipAddress}
                onChange={e => setStoreInfo({ ...storeInfo, flagshipAddress: e.target.value })}
                className="w-full bg-[#121318] border border-slate-700 text-white p-2 rounded outline-none focus:border-[#7b5818]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Concierge Support Email *</label>
                <input
                  type="email"
                  required
                  value={storeInfo.conciergeEmail}
                  onChange={e => setStoreInfo({ ...storeInfo, conciergeEmail: e.target.value })}
                  className="w-full bg-[#121318] border border-slate-700 text-white p-2 rounded outline-none focus:border-[#7b5818]"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Concierge Phone Numbers</label>
                <input
                  type="text"
                  value={storeInfo.phone}
                  onChange={e => setStoreInfo({ ...storeInfo, phone: e.target.value })}
                  className="w-full bg-[#121318] border border-slate-700 text-white p-2 rounded outline-none focus:border-[#7b5818]"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">BIS Hallmark License ID *</label>
              <input
                type="text"
                required
                value={storeInfo.bisHallmarkId}
                onChange={e => setStoreInfo({ ...storeInfo, bisHallmarkId: e.target.value })}
                className="w-full bg-[#121318] border border-slate-700 text-emerald-400 p-2 rounded outline-none focus:border-[#7b5818] font-mono font-bold"
              />
            </div>
          </div>
        </form>

        {/* System & API Gateway Status */}
        <div className="bg-[#16171d] border border-slate-800 rounded-lg p-6 space-y-4">
          <h3 className="font-serif text-base font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
            <Server className="w-5 h-5 text-[#b98f4a]" /> Service & Integrations Health
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 bg-[#121318] border border-slate-800 rounded">
              <span className="text-slate-300">Backend Express API</span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                {healthStatus}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-[#121318] border border-slate-800 rounded">
              <span className="text-slate-300">Aiven Cloud MySQL Database</span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                CONNECTED
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-[#121318] border border-slate-800 rounded">
              <span className="text-slate-300">Razorpay Payment Gateway (Test Mode)</span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                rzp_test_TQRGl6jIraGkGa
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-[#121318] border border-slate-800 rounded">
              <span className="text-slate-300">Cloudinary Media Storage Bucket</span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                vqmemckw
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
