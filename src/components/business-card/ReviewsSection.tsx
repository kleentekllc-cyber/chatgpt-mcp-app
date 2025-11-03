/**
 * ReviewsSection Component
 * Displays aggregate rating and review snippets
 */

import React, { useState } from 'react';
import { Review } from '../../types/business';

interface ReviewsSectionProps {
  rating?: number;
  reviewCount?: number;
  reviews?: Review[];
  googleMapsUrl?: string;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  rating,
  reviewCount,
  reviews,
  googleMapsUrl,
}) => {
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());

  const toggleReviewExpansion = (index: number) => {
    setExpandedReviews((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // If no rating or reviews, don't render
  if (!rating && (!reviews || reviews.length === 0)) {
    return null;
  }

  // Display up to 3 reviews
  const displayReviews = reviews?.slice(0, 3) || [];

  return (
    <div className="p-4 border-b border-gray-200">
      {/* Rating header */}
      {rating && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl font-bold text-gray-900">{rating.toFixed(1)}</span>
            <div className="flex items-center">
              {renderStars(rating)}
            </div>
          </div>
          {reviewCount !== undefined && (
            <p className="text-sm text-gray-600">
              Based on {reviewCount.toLocaleString()} {reviewCount === 1 ? 'review' : 'reviews'}
            </p>
          )}
        </div>
      )}

      {/* Review snippets */}
      {displayReviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Recent Reviews</h3>
          {displayReviews.map((review, index) => {
            const isExpanded = expandedReviews.has(index);
            const isMobile = window.innerWidth < 768;
            const charLimit = isMobile ? 200 : 300;
            const needsTruncation = review.text.length > charLimit;
            const displayText =
              !isExpanded && needsTruncation
                ? review.text.substring(0, charLimit) + '...'
                : review.text;

            return (
              <div key={index} className="pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                {/* Author info */}
                <div className="flex items-start gap-3 mb-2">
                  {review.profilePhoto ? (
                    <img
                      src={review.profilePhoto}
                      alt={review.author}
                      className="w-10 h-10 rounded-full flex-shrink-0"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{review.author}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center">{renderStars(review.rating, 'small')}</div>
                      <span className="text-xs text-gray-500">{review.relativeTime}</span>
                    </div>
                  </div>
                </div>

                {/* Review text */}
                <p className="text-sm text-gray-700 leading-relaxed">{displayText}</p>

                {/* Read more button */}
                {needsTruncation && (
                  <button
                    onClick={() => toggleReviewExpansion(index)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus:underline"
                    aria-label={isExpanded ? 'Show less' : 'Read more'}
                    type="button"
                  >
                    {isExpanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* See all reviews link */}
      {googleMapsUrl && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus:underline"
          >
            See all reviews on Google Maps
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
          <p className="text-xs text-gray-500 mt-2">Reviews powered by Google</p>
        </div>
      )}
    </div>
  );
};

/**
 * Helper function to render star rating
 */
function renderStars(rating: number, size: 'small' | 'normal' = 'normal'): React.ReactNode {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const sizeClass = size === 'small' ? 'w-4 h-4' : 'w-5 h-5';

  // Full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <svg
        key={`full-${i}`}
        className={`${sizeClass} text-yellow-400`}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    );
  }

  // Half star
  if (hasHalfStar) {
    stars.push(
      <svg
        key="half"
        className={`${sizeClass} text-yellow-400`}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="half-star">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="#E5E7EB" />
          </linearGradient>
        </defs>
        <path
          fill="url(#half-star)"
          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
        />
      </svg>
    );
  }

  // Empty stars
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <svg
        key={`empty-${i}`}
        className={`${sizeClass} text-gray-300`}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    );
  }

  return (
    <div className="flex items-center" role="img" aria-label={`${rating} out of 5 stars`}>
      {stars}
    </div>
  );
}
