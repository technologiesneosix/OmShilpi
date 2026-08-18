import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorState = ({
  title = 'Unable to Load Data',
  message = 'We encountered an error connecting to our server. Please try again.',
  onRetry,
}) => {
  return (
    <div className="text-center py-12 px-4 bg-red-50 border border-red-200 rounded max-w-md mx-auto my-8">
      <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-3" />
      <h4 className="text-lg font-semibold text-red-900 mb-1">{title}</h4>
      <p className="text-sm text-red-700 mb-5">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      )}
    </div>
  );
};
