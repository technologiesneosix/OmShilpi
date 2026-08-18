import React from 'react';
import { AlertTriangle, Trash2, Info, X } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  type = 'danger', // 'danger' | 'warning' | 'info'
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onClose,
  loading = false,
}) => {
  if (!isOpen) return null;

  const iconMap = {
    danger: <Trash2 className="w-6 h-6 text-red-400" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-400" />,
    info: <Info className="w-6 h-6 text-[#b98f4a]" />,
  };

  const buttonStyleMap = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white',
    info: 'bg-[#7b5818] hover:bg-[#604100] text-white',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#16171d] border border-[#7b5818]/60 rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl text-slate-200 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon + Title */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="p-2.5 bg-[#121318] border border-slate-800 rounded-lg shrink-0">
            {iconMap[type] || iconMap.info}
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-white">{title}</h3>
            <p className="text-[11px] text-[#b98f4a] font-mono">Om Shilpi CMS Confirmation</p>
          </div>
        </div>

        {/* Message Content */}
        <p className="text-xs text-slate-300 leading-relaxed">
          {message}
        </p>

        {/* Actions Footer */}
        <div className="flex justify-end items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2 text-xs font-bold rounded-lg transition cursor-pointer shadow-md flex items-center gap-2 ${
              buttonStyleMap[type] || buttonStyleMap.info
            }`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>

      </div>
    </div>
  );
};

export const ProblemModal = ({
  isOpen,
  title = 'Action Required',
  message = 'An unexpected issue occurred.',
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#16171d] border border-red-900/60 rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl text-slate-200 relative">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="p-2.5 bg-red-950/60 border border-red-800/60 rounded-lg shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-white">{title}</h3>
            <p className="text-[11px] text-red-400 font-mono">System Notice</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-[#121318] p-3 rounded border border-slate-800">
          {message}
        </p>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#7b5818] hover:bg-[#604100] text-white text-xs font-bold rounded-lg transition cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>

      </div>
    </div>
  );
};
