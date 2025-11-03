/**
 * PhotoGallery Component
 * Displays hero image and scrollable photo carousel with navigation
 */

import React, { useState, useRef, useEffect } from 'react';
import { Photo } from '../../types/business';
import { getPhotoUrl } from '../../lib/api/placeDetails';

interface PhotoGalleryProps {
  photos: Photo[];
  businessName: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  businessName,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const [showAttributions, setShowAttributions] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Limit to 10 photos
  const displayPhotos = photos.slice(0, 10);

  useEffect(() => {
    // Set up Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setLoadedImages((prev) => new Set(prev).add(index));
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all thumbnail elements
    const thumbnails = carouselRef.current?.querySelectorAll('[data-index]');
    thumbnails?.forEach((thumb) => observer.observe(thumb));

    return () => {
      observer.disconnect();
    };
  }, [displayPhotos.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : displayPhotos.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < displayPhotos.length - 1 ? prev + 1 : 0));
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  };

  // Touch gesture support
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      handleNext();
    }
    if (touchStart - touchEnd < -50) {
      handlePrevious();
    }
  };

  if (!displayPhotos || displayPhotos.length === 0) {
    // Placeholder when no photos available
    return (
      <div className="relative w-full bg-gray-200 flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
        <div className="text-center text-gray-400">
          <svg
            className="w-16 h-16 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm">No photos available</p>
        </div>
      </div>
    );
  }

  const currentPhoto = displayPhotos[currentIndex];

  return (
    <div className="relative">
      {/* Skip link for accessibility */}
      <a
        href="#business-info"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
      >
        Skip photo gallery
      </a>

      {/* Hero Image */}
      <div
        className="relative w-full bg-gray-200"
        style={{ aspectRatio: '16/9' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="img"
        aria-label={`Photo ${currentIndex + 1} of ${displayPhotos.length} for ${businessName}`}
      >
        {loadedImages.has(currentIndex) ? (
          <img
            src={getPhotoUrl(currentPhoto.photoReference, 800)}
            alt={`${businessName} - Photo ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            loading={currentIndex === 0 ? 'eager' : 'lazy'}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 animate-pulse" />
        )}

        {/* Photo count indicator */}
        <div className="absolute top-4 right-4 px-3 py-1 bg-black bg-opacity-60 text-white text-sm rounded-full">
          {currentIndex + 1} / {displayPhotos.length}
        </div>

        {/* Attribution toggle button */}
        {currentPhoto.attributions && currentPhoto.attributions.length > 0 && (
          <button
            onClick={() => setShowAttributions(!showAttributions)}
            className="absolute bottom-4 right-4 px-2 py-1 bg-black bg-opacity-60 text-white text-xs rounded hover:bg-opacity-80 transition-opacity"
            aria-label="Show photo attributions"
            type="button"
          >
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        )}

        {/* Attributions overlay */}
        {showAttributions && currentPhoto.attributions && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-black bg-opacity-80 text-white text-xs">
            {currentPhoto.attributions.map((attr, idx) => (
              <div key={idx} dangerouslySetInnerHTML={{ __html: attr }} />
            ))}
          </div>
        )}

        {/* Navigation arrows (desktop) */}
        {displayPhotos.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
              aria-label="Previous photo"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={handleNext}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
              aria-label="Next photo"
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnail carousel */}
      {displayPhotos.length > 1 && (
        <div
          ref={carouselRef}
          className="flex gap-2 p-4 overflow-x-auto scrollbar-hide bg-gray-50"
          role="list"
          aria-label="Photo thumbnails"
        >
          {displayPhotos.map((photo, index) => (
            <button
              key={index}
              data-index={index}
              onClick={() => handleThumbnailClick(index)}
              className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                index === currentIndex
                  ? 'border-blue-600 opacity-100'
                  : 'border-gray-300 opacity-60 hover:opacity-100'
              }`}
              aria-label={`View photo ${index + 1}`}
              aria-pressed={index === currentIndex}
              type="button"
              role="listitem"
            >
              {loadedImages.has(index) ? (
                <img
                  src={getPhotoUrl(photo.photoReference, 200)}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 animate-pulse" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
