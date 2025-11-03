/**
 * ActionButtons Component
 * Displays action buttons for directions, call, website, and share
 */

import React from 'react';

interface ActionButtonsProps {
  phone?: string;
  website?: string;
  googleMapsUrl?: string;
  placeId: string;
  onDirections?: (placeId: string) => void;
  onCall?: (phone: string) => void;
  onWebsite?: (url: string) => void;
  onShare?: (placeId: string) => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  phone,
  website,
  googleMapsUrl,
  placeId,
  onDirections,
  onCall,
  onWebsite,
  onShare,
}) => {
  const handleDirections = () => {
    if (onDirections) {
      onDirections(placeId);
    } else if (googleMapsUrl) {
      window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCall = () => {
    if (phone) {
      if (onCall) {
        onCall(phone);
      } else {
        window.location.href = `tel:${phone}`;
      }
    }
  };

  const handleWebsite = () => {
    if (website) {
      if (onWebsite) {
        onWebsite(website);
      } else {
        window.open(website, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(placeId);
    } else if (navigator.share && googleMapsUrl) {
      navigator
        .share({
          title: 'Check out this place',
          url: googleMapsUrl,
        })
        .catch((error) => console.log('Error sharing:', error));
    } else if (googleMapsUrl) {
      navigator.clipboard.writeText(googleMapsUrl);
      // Could show a toast notification here
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-gray-50">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Directions Button - Primary Action */}
        <button
          onClick={handleDirections}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Get directions"
          type="button"
        >
          <svg
            className="w-5 h-5"
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
          <span className="hidden sm:inline">Directions</span>
        </button>

        {/* Call Button */}
        <button
          onClick={handleCall}
          disabled={!phone}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
          aria-label={phone ? 'Call business' : 'Phone number not available'}
          title={!phone ? 'Phone number not available' : undefined}
          type="button"
        >
          <svg
            className="w-5 h-5"
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
          <span className="hidden sm:inline">Call</span>
        </button>

        {/* Website Button */}
        <button
          onClick={handleWebsite}
          disabled={!website}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
          aria-label={website ? 'Visit website' : 'Website not available'}
          title={!website ? 'Website not available' : undefined}
          type="button"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            />
          </svg>
          <span className="hidden sm:inline">Website</span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Share business"
          type="button"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>
    </div>
  );
};
