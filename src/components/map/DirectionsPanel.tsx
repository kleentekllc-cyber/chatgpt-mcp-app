/**
 * DirectionsPanel Component
 * Displays turn-by-turn directions with route information
 */

import React, { useState } from 'react';
import { Route, TravelMode, DirectionStep, ManeuverType } from '../../types/directions';
import { TransportModeSelector } from './TransportModeSelector';

export interface DirectionsPanelProps {
  route: Route | null;
  travelMode: TravelMode;
  onTravelModeChange: (mode: TravelMode) => void;
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
  businessName?: string;
  disabledModes?: TravelMode[];
}

/**
 * Get maneuver icon for a direction step
 */
function getManeuverIcon(maneuver?: ManeuverType): JSX.Element {
  const className = "w-5 h-5 flex-shrink-0";

  if (!maneuver || maneuver === 'straight') {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    );
  }

  if (maneuver.includes('left')) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
      </svg>
    );
  }

  if (maneuver.includes('right')) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    );
  }

  if (maneuver.includes('uturn')) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
        />
      </svg>
    );
  }

  // Default icon
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  );
}

/**
 * Remove HTML tags from instruction text
 */
function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

export const DirectionsPanel: React.FC<DirectionsPanelProps> = ({
  route,
  travelMode,
  onTravelModeChange,
  onClose,
  loading = false,
  error = null,
  businessName,
  disabledModes = [],
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const leg = route?.legs[0];
  const steps = leg?.steps || [];

  return (
    <div
      className={`
        fixed inset-x-0 bottom-0 bg-white shadow-2xl z-40
        sm:inset-y-0 sm:left-0 sm:right-auto sm:w-96
        flex flex-col
        ${isCollapsed ? 'h-20' : 'max-h-[80vh] sm:max-h-full'}
        transition-all duration-300 ease-in-out
      `}
      role="complementary"
      aria-label="Directions panel"
    >
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200">
        {/* Top bar with close button */}
        <div className="flex items-center justify-between p-4 pb-2">
          <h2 className="text-lg font-semibold text-gray-900">
            {businessName ? `Directions to ${businessName}` : 'Directions'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="sm:hidden p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label={isCollapsed ? 'Expand directions' : 'Collapse directions'}
              aria-expanded={!isCollapsed}
              type="button"
            >
              <svg
                className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label="Close directions"
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Transport mode selector */}
        {!isCollapsed && (
          <div className="px-4 pb-3">
            <TransportModeSelector
              selectedMode={travelMode}
              onModeChange={onTravelModeChange}
              disabledModes={disabledModes}
            />
          </div>
        )}

        {/* Summary */}
        {!isCollapsed && leg && !loading && !error && (
          <div className="px-4 pb-3 flex items-center gap-4 text-sm">
            <div className="font-semibold text-gray-900 text-lg">
              {leg.durationInTraffic?.text || leg.duration.text}
            </div>
            <div className="text-gray-600">({leg.distance.text})</div>
          </div>
        )}
      </div>

      {/* Collapsed summary */}
      {isCollapsed && leg && !loading && !error && (
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="font-semibold text-gray-900">{leg.duration.text}</div>
            <div className="text-gray-600 text-sm">({leg.distance.text})</div>
          </div>
        </div>
      )}

      {/* Content */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto">
          {/* Loading state */}
          {loading && (
            <div className="p-4 space-y-3">
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-gray-200 rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error state */}
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
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Directions list */}
          {leg && !loading && !error && (
            <div className="p-4">
              {/* Start location */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">From</div>
                    <div className="text-sm text-gray-900">{leg.startAddress}</div>
                  </div>
                </div>
              </div>

              {/* Steps */}
              <ol className="space-y-4" role="list">
                {steps.map((step, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 hover:bg-gray-50 -mx-2 px-2 py-2 rounded cursor-pointer transition-colors"
                  >
                    <div className="text-gray-600 mt-0.5">{getManeuverIcon(step.maneuver)}</div>
                    <div className="flex-1">
                      <div
                        className="text-sm text-gray-900 mb-1"
                        dangerouslySetInnerHTML={{ __html: step.instruction }}
                      />
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>{step.distance.text}</span>
                        <span>•</span>
                        <span>{step.duration.text}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>

              {/* End location */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">To</div>
                    <div className="text-sm text-gray-900">{leg.endAddress}</div>
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {route.warnings && route.warnings.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  {route.warnings.map((warning, index) => (
                    <p key={index} className="text-xs text-yellow-800">
                      {warning}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
