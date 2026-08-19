import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LogIn, UserPlus, AlertCircle, CheckCircle2, HelpCircle, X, Info } from 'lucide-react';

export const CustomDialog = ({
  isOpen,
  type = 'info', // 'auth' | 'info' | 'success' | 'warning' | 'error' | 'confirm'
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  onClose,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSignIn = () => {
    onClose();
    navigate('/login');
  };

  const handleRegister = () => {
    onClose();
    navigate('/register');
  };

  const renderIcon = () => {
    switch (type) {
      case 'auth':
        return (
          <div className="w-12 h-12 rounded-full bg-[#fdf9f2] border border-[#7b5818]/30 flex items-center justify-center text-[#7b5818] shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
        );
      case 'success':
        return (
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-inner">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-inner">
            <AlertCircle className="w-6 h-6" />
          </div>
        );
      case 'error':
        return (
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-inner">
            <AlertCircle className="w-6 h-6" />
          </div>
        );
      case 'confirm':
        return (
          <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-inner">
            <HelpCircle className="w-6 h-6" />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-full bg-[#fdf9f2] border border-[#7b5818]/30 flex items-center justify-center text-[#7b5818] shadow-inner">
            <Info className="w-6 h-6" />
          </div>
        );
    }
  };

  const getDefaultTitle = () => {
    if (title) return title;
    switch (type) {
      case 'auth':
        return 'Sign In Required';
      case 'success':
        return 'Success';
      case 'warning':
        return 'Attention Needed';
      case 'error':
        return 'Notice';
      case 'confirm':
        return 'Please Confirm';
      default:
        return 'Om Shilpi Notice';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative bg-white border border-[#e6e2db] rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl overflow-hidden animate-pop-in space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative gold top bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#7b5818] via-[#d2c4b4] to-[#7b5818]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header content */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          {renderIcon()}
          
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-bold text-[#1c1c18] tracking-tight">
              {getDefaultTitle()}
            </h3>
            <p className="text-xs uppercase font-semibold text-[#7b5818] tracking-wider">
              Om Shilpi Fine Jewellery
            </p>
          </div>
        </div>

        {/* Message Body */}
        <div className="bg-[#fdf9f2] border border-[#e6e2db] rounded-xl p-4 text-center">
          <p className="text-sm text-[#4f4539] leading-relaxed">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        {type === 'auth' ? (
          <div className="space-y-2.5 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={handleSignIn}
                className="w-full flex items-center justify-center gap-2 bg-[#7b5818] hover:bg-[#604100] text-white py-2.5 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider transition cursor-pointer shadow-md"
              >
                <LogIn className="w-4 h-4" /> Sign In
              </button>
              <button
                onClick={handleRegister}
                className="w-full flex items-center justify-center gap-2 bg-white border border-[#7b5818] text-[#7b5818] hover:bg-[#fdf9f2] py-2.5 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
              >
                <UserPlus className="w-4 h-4" /> Register
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-800 py-1 transition cursor-pointer"
            >
              Continue Browsing
            </button>
          </div>
        ) : type === 'confirm' ? (
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => {
                if (onCancel) onCancel();
                onClose();
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
              className="px-5 py-2 bg-[#7b5818] hover:bg-[#604100] text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-sm"
            >
              {confirmText}
            </button>
          </div>
        ) : (
          <div className="flex justify-center pt-1">
            <button
              onClick={onClose}
              className="w-full sm:w-auto min-w-[140px] bg-[#7b5818] hover:bg-[#604100] text-white py-2.5 px-6 rounded-lg text-xs font-semibold uppercase tracking-wider transition cursor-pointer shadow-sm text-center"
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
