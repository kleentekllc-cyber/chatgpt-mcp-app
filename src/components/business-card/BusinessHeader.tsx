/**
 * BusinessHeader Component
 * Displays business name, category badge, and close button
 */

import React from 'react';

interface BusinessHeaderProps {
  name: string;
  category?: string;
  onClose: () => void;
}

export const BusinessHeader: React.FC<BusinessHeaderProps> = ({
  name,
  category,
  onClose,
}) => {
  return (
    <div className="flex items-start justify-between p-4 border-b border-gray-200">
      <div className="flex-1 pr-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{name}</h2>
        {category && (
          <span className="inline-block px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
            {category}
          </span>
        )}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Close business details"
        type="button"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};
