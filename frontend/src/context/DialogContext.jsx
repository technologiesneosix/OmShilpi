import React, { createContext, useContext, useState, useCallback } from 'react';
import { CustomDialog } from '../components/common/CustomDialog';

const DialogContext = createContext();

export const DialogProvider = ({ children }) => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancel',
    onConfirm: null,
    onCancel: null,
  });

  const closeDialog = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const showDialog = useCallback((config) => {
    setDialogState({
      isOpen: true,
      type: config.type || 'info',
      title: config.title || '',
      message: config.message || '',
      confirmText: config.confirmText || 'OK',
      cancelText: config.cancelText || 'Cancel',
      onConfirm: config.onConfirm || null,
      onCancel: config.onCancel || null,
    });
  }, []);

  const showAuthModal = useCallback((message = 'Please sign in to add items to your cart.') => {
    showDialog({
      type: 'auth',
      title: 'Sign In Required',
      message: message,
    });
  }, [showDialog]);

  const showAlert = useCallback((message, title = '', type = 'info') => {
    showDialog({
      type,
      title,
      message,
    });
  }, [showDialog]);

  const showConfirm = useCallback(({ title, message, onConfirm, onCancel, confirmText, cancelText }) => {
    showDialog({
      type: 'confirm',
      title: title || 'Confirm Action',
      message: message || 'Are you sure you want to proceed?',
      confirmText: confirmText || 'Confirm',
      cancelText: cancelText || 'Cancel',
      onConfirm,
      onCancel,
    });
  }, [showDialog]);

  return (
    <DialogContext.Provider
      value={{
        showDialog,
        showAuthModal,
        showAlert,
        showConfirm,
        closeDialog,
      }}
    >
      {children}
      <CustomDialog
        isOpen={dialogState.isOpen}
        type={dialogState.type}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        onConfirm={dialogState.onConfirm}
        onCancel={dialogState.onCancel}
        onClose={closeDialog}
      />
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};
