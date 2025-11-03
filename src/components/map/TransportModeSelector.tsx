/**
 * TransportModeSelector Component
 * Allows user to select transportation mode for directions
 */

import React from 'react';
import { TravelMode } from '../../types/directions';

export interface TransportModeSelectorProps {
  selectedMode: TravelMode;
  onModeChange: (mode: TravelMode) => void;
  disabledModes?: TravelMode[];
  className?: string;
}

interface ModeOption {
  mode: TravelMode;
  label: string;
  icon: JSX.Element;
  ariaLabel: string;
}

export const TransportModeSelector: React.FC<TransportModeSelectorProps> = ({
  selectedMode,
  onModeChange,
  disabledModes = [],
  className = '',
}) => {
  const modes: ModeOption[] = [
    {
      mode: TravelMode.DRIVING,
      label: 'Drive',
      ariaLabel: 'Driving directions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19l-7-7 7-7m5 14l7-7-7-7"
          />
        </svg>
      ),
    },
    {
      mode: TravelMode.WALKING,
      label: 'Walk',
      ariaLabel: 'Walking directions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      mode: TravelMode.TRANSIT,
      label: 'Transit',
      ariaLabel: 'Public transit directions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    {
      mode: TravelMode.BICYCLING,
      label: 'Bike',
      ariaLabel: 'Bicycling directions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
        </svg>
      ),
    },
  ];

  return (
    <div className={`flex gap-2 ${className}`} role="group" aria-label="Transportation mode selector">
      {modes.map((modeOption) => {
        const isSelected = selectedMode === modeOption.mode;
        const isDisabled = disabledModes.includes(modeOption.mode);

        return (
          <button
            key={modeOption.mode}
            onClick={() => !isDisabled && onModeChange(modeOption.mode)}
            disabled={isDisabled}
            className={`
              flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[64px] rounded-lg
              border-2 transition-all duration-200
              ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }
              ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            `}
            style={{ minHeight: '44px', minWidth: '44px' }}
            aria-label={modeOption.ariaLabel}
            aria-pressed={isSelected}
            type="button"
          >
            <span className="flex items-center justify-center">{modeOption.icon}</span>
            <span className="text-xs font-medium">{modeOption.label}</span>
          </button>
        );
      })}
    </div>
  );
};
