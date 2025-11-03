/**
 * InfoSection Component
 * Displays address, phone, price level, and distance
 */

import React from 'react';

interface InfoSectionProps {
  address: string;
  phone?: string;
  priceDisplay?: string;
  distance?: number;
}

export const InfoSection: React.FC<InfoSectionProps> = ({
  address,
  phone,
  priceDisplay,
  distance,
}) => {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Address */}
        <div className="flex items-start gap-2">
          <svg
            className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <div>
            <p className="text-sm text-gray-600 font-medium">Address</p>
            <p className="text-sm text-gray-900">{address}</p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-start gap-2">
          <svg
            className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          <div>
            <p className="text-sm text-gray-600 font-medium">Phone</p>
            <p className="text-sm text-gray-900">
              {phone || <span className="text-gray-400">Not available</span>}
            </p>
          </div>
        </div>

        {/* Price Level */}
        {priceDisplay && (
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm text-gray-600 font-medium">Price</p>
              <p className="text-sm text-gray-900">{priceDisplay}</p>
            </div>
          </div>
        )}

        {/* Distance */}
        {distance !== undefined && (
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <div>
              <p className="text-sm text-gray-600 font-medium">Distance</p>
              <p className="text-sm text-gray-900">
                {distance < 1
                  ? `${Math.round(distance * 1000)}m`
                  : `${distance.toFixed(1)}km`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
