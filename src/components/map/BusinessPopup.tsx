/**
 * BusinessPopup Component
 * Displays business information in map info window
 */

import React from 'react';
import { PopupData } from '../../types/business';

export interface BusinessPopupProps {
  data: PopupData;
}

/**
 * BusinessPopup component for rendering in InfoWindow
 */
export const BusinessPopup: React.FC<BusinessPopupProps> = ({ data }) => {
  return (
    <div className="p-3 max-w-xs">
      {/* Business Name */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{data.name}</h3>

      {/* Photo */}
      {data.photo && (
        <div className="mb-3">
          <img
            src={`/api/photo?reference=${data.photo}&maxwidth=200&maxheight=150`}
            alt={data.name}
            className="w-full h-32 object-cover rounded"
            loading="lazy"
          />
        </div>
      )}

      {/* Rating */}
      {data.rating && (
        <div className="flex items-center mb-2">
          <span className="text-yellow-500 mr-2" aria-label={`Rating: ${data.rating}`}>
            {data.ratingDisplay}
          </span>
        </div>
      )}

      {/* Price Level */}
      {data.priceDisplay && data.priceDisplay !== 'Price not available' && (
        <div className="mb-2 text-sm text-gray-600">{data.priceDisplay}</div>
      )}

      {/* Category */}
      {data.category && (
        <div className="mb-2 text-sm text-gray-500">{data.category}</div>
      )}

      {/* Address */}
      <div className="mb-2 text-sm text-gray-700">
        <svg
          className="inline w-4 h-4 mr-1"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
        {data.address}
      </div>

      {/* Business Status */}
      <div className="text-sm">
        <span
          className={`inline-block px-2 py-1 rounded ${
            data.status === 'Open'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {data.status}
        </span>
      </div>
    </div>
  );
};

/**
 * Generate HTML string for InfoWindow content
 * Used when React component can't be directly rendered in InfoWindow
 */
export function generatePopupHTML(data: PopupData): string {
  const photoHtml = data.photo
    ? `<div class="mb-3">
         <img src="/api/photo?reference=${data.photo}&maxwidth=200&maxheight=150"
              alt="${data.name}"
              class="w-full h-32 object-cover rounded"
              loading="lazy" />
       </div>`
    : '';

  const ratingHtml = data.rating
    ? `<div class="flex items-center mb-2">
         <span class="text-yellow-500 mr-2">${data.ratingDisplay}</span>
       </div>`
    : '';

  const priceHtml =
    data.priceDisplay && data.priceDisplay !== 'Price not available'
      ? `<div class="mb-2 text-sm text-gray-600">${data.priceDisplay}</div>`
      : '';

  const categoryHtml = data.category
    ? `<div class="mb-2 text-sm text-gray-500">${data.category}</div>`
    : '';

  const statusClass =
    data.status === 'Open'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';

  return `
    <div class="p-3 max-w-xs" style="max-width: 280px;">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">${data.name}</h3>
      ${photoHtml}
      ${ratingHtml}
      ${priceHtml}
      ${categoryHtml}
      <div class="mb-2 text-sm text-gray-700">
        <svg class="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
        </svg>
        ${data.address}
      </div>
      <div class="text-sm">
        <span class="inline-block px-2 py-1 rounded ${statusClass}">
          ${data.status}
        </span>
      </div>
    </div>
  `;
}
