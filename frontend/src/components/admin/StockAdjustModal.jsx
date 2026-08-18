import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { adminApi } from '../../api/admin.api';

export const StockAdjustModal = ({ isOpen, onClose, productItem = null, onSuccess }) => {
  const [adjustType, setAdjustType] = useState('add'); // 'add', 'subtract', 'set'
  const [amount, setAmount] = useState('1');
  const [reason, setReason] = useState('Manual Stock Reconciliation');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !productItem) return null;

  const currentQty = productItem.quantity ?? productItem.inventory?.quantity ?? 0;
  const productId = productItem.productId || productItem.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const val = parseInt(amount, 10);
      if (isNaN(val) || val <= 0) {
        throw new Error('Please enter a valid stock amount greater than zero.');
      }

      if (adjustType === 'set') {
        await adminApi.setStock(productId, val);
      } else {
        const change = adjustType === 'add' ? val : -val;
        await adminApi.adjustStock(productId, change, reason);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update stock');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#191a21] border border-slate-700 rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-200">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="font-serif text-lg font-bold text-white">
            Stock Adjust: {productItem.product?.name || productItem.name}
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

        <div className="p-3 bg-[#121318] border border-slate-800 rounded text-xs flex justify-between items-center">
          <span className="text-slate-400">Current In-Stock Quantity:</span>
          <strong className="text-white text-sm font-mono">{currentQty} units</strong>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Adjustment Action</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAdjustType('add')}
                className={`py-2 rounded font-semibold text-xs border ${
                  adjustType === 'add' ? 'bg-[#7b5818] border-[#b98f4a] text-white' : 'bg-[#121318] border-slate-700 text-slate-400'
                }`}
              >
                + Add Stock
              </button>
              <button
                type="button"
                onClick={() => setAdjustType('subtract')}
                className={`py-2 rounded font-semibold text-xs border ${
                  adjustType === 'subtract' ? 'bg-red-900 border-red-700 text-white' : 'bg-[#121318] border-slate-700 text-slate-400'
                }`}
              >
                - Reduce Stock
              </button>
              <button
                type="button"
                onClick={() => setAdjustType('set')}
                className={`py-2 rounded font-semibold text-xs border ${
                  adjustType === 'set' ? 'bg-blue-900 border-blue-700 text-white' : 'bg-[#121318] border-slate-700 text-slate-400'
                }`}
              >
                Set Exact Qty
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {adjustType === 'set' ? 'New Total Quantity' : 'Quantity Amount'} *
            </label>
            <input
              type="number"
              min="1"
              required
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-[#121318] border border-slate-700 text-white p-2.5 rounded outline-none focus:border-[#7b5818] font-bold text-sm"
            />
          </div>

          {adjustType !== 'set' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Reason / Note</label>
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full bg-[#121318] border border-slate-700 text-white p-2.5 rounded outline-none"
              />
            </div>
          )}

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-700 rounded text-slate-300">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-[#7b5818] text-white rounded font-semibold">
              {saving ? 'Updating...' : 'Confirm Stock Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
