import React from 'react';

interface BaseModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'normal' | 'compact';
}

/**
 * Base modal component that provides common structure and styling for all modals
 * @param title - The title to display in the modal header
 * @param onClose - Function to call when the modal should be closed
 * @param children - The content to display in the modal body
 * @param size - Size of the modal (normal or compact)
 */
export const BaseModal: React.FC<BaseModalProps> = ({ 
  title, 
  onClose, 
  children,
  size = 'normal'
}) => {
  const maxWidthClass = size === 'compact' ? 'max-w-xl' : 'max-w-2xl';
  const paddingClass = size === 'compact' ? 'p-4' : 'p-6';

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" 
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-lg shadow-lg ${maxWidthClass} w-full ${paddingClass}`} 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-3">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}; 