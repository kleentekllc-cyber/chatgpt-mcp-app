/**
 * BusinessCard Component
 * Main component displaying detailed business information with animations
 */

import React, { useEffect, useRef } from 'react';
import { BusinessCardProps } from '../../types/business';
import { BusinessHeader } from './BusinessHeader';
import { PhotoGallery } from './PhotoGallery';
import { InfoSection } from './InfoSection';
import { HoursDisplay } from './HoursDisplay';
import { ReviewsSection } from './ReviewsSection';
import { ActionButtons } from './ActionButtons';

export const BusinessCard: React.FC<BusinessCardProps> = ({
  businessData,
  isOpen,
  onClose,
  onDirections,
  onCall,
  onWebsite,
  onShare,
  loading = false,
  error = null,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Set focus to heading when card opens
      setTimeout(() => {
        headingRef.current?.focus();
      }, 350); // After animation completes
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when card is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black z-40 ${
          prefersReducedMotion ? 'bg-opacity-50' : 'animate-fade-in'
        }`}
        style={{
          animation: prefersReducedMotion ? 'none' : 'fadeIn 200ms ease-out',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Business Card */}
      <div
        ref={cardRef}
        className={`fixed inset-x-0 bottom-0 z-50 bg-white shadow-2xl ${
          prefersReducedMotion ? '' : 'animate-slide-up'
        } sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-2xl sm:rounded-lg sm:max-h-[90vh] overflow-hidden`}
        style={{
          animation: prefersReducedMotion ? 'none' : 'slideUp 300ms ease-out',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="business-card-heading"
      >
        <div className="flex flex-col h-full max-h-screen sm:max-h-[90vh]">
          {/* Header */}
          <div ref={headingRef as any} tabIndex={-1}>
            <BusinessHeader
              name={businessData?.name || 'Loading...'}
              category={businessData?.category}
              onClose={onClose}
            />
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {/* Loading State */}
            {loading && <BusinessCardSkeleton />}

            {/* Error State */}
            {error && !loading && (
              <div className="p-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-red-800 mb-1">
                        Some details couldn't be loaded
                      </h3>
                      <p className="text-sm text-red-700">{error}</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium underline focus:outline-none"
                        type="button"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Business Data */}
            {businessData && !loading && (
              <>
                {/* Photo Gallery */}
                {businessData.photos && businessData.photos.length > 0 && (
                  <PhotoGallery photos={businessData.photos} businessName={businessData.name} />
                )}

                {/* Info Section */}
                <InfoSection
                  address={businessData.formatted_address}
                  phone={businessData.phone}
                  priceDisplay={businessData.priceDisplay}
                  distance={businessData.distance}
                />

                {/* Hours Display */}
                <HoursDisplay hours={businessData.hours} />

                {/* Reviews Section */}
                <ReviewsSection
                  rating={businessData.rating}
                  reviewCount={businessData.reviewCount}
                  reviews={businessData.reviews}
                  googleMapsUrl={businessData.googleMapsUrl}
                />
              </>
            )}
          </div>

          {/* Action Buttons - Fixed at bottom */}
          {businessData && !loading && (
            <ActionButtons
              phone={businessData.phone}
              website={businessData.website}
              googleMapsUrl={businessData.googleMapsUrl}
              placeId={businessData.place_id}
              onDirections={onDirections}
              onCall={onCall}
              onWebsite={onWebsite}
              onShare={onShare}
            />
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 0.5;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @media (min-width: 640px) {
          @keyframes slideUp {
            from {
              transform: translate(-50%, calc(-50% + 2rem));
              opacity: 0;
            }
            to {
              transform: translate(-50%, -50%);
              opacity: 1;
            }
          }
        }

        .animate-fade-in {
          animation: fadeIn 200ms ease-out forwards;
        }

        .animate-slide-up {
          animation: slideUp 300ms ease-out forwards;
        }

        /* Hide scrollbar but keep functionality */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in,
          .animate-slide-up {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
};

/**
 * Skeleton loader for loading state
 */
const BusinessCardSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      {/* Photo skeleton */}
      <div className="w-full bg-gray-200" style={{ aspectRatio: '16/9' }} />

      {/* Info skeleton */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-16" />
            <div className="h-5 bg-gray-200 rounded w-full" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-16" />
            <div className="h-5 bg-gray-200 rounded w-24" />
          </div>
        </div>

        {/* Hours skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-6 bg-gray-200 rounded w-32" />
        </div>

        {/* Reviews skeleton */}
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 rounded w-24" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
      </div>

      {/* Action buttons skeleton */}
      <div className="p-4 border-t border-gray-200">
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
};
