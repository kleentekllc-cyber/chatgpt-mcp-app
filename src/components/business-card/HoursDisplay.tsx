/**
 * HoursDisplay Component
 * Displays operating hours with current status and expandable weekly schedule
 */

import React, { useState, useMemo } from 'react';
import { Hours } from '../../types/business';

interface HoursDisplayProps {
  hours?: Hours;
}

export const HoursDisplay: React.FC<HoursDisplayProps> = ({ hours }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Parse current day and status
  const currentStatus = useMemo(() => {
    if (!hours) {
      return {
        isOpen: false,
        status: 'Hours unavailable',
        statusColor: 'text-gray-500',
        bgColor: 'bg-gray-100',
        currentDayIndex: new Date().getDay(),
      };
    }

    const now = new Date();
    const currentDayIndex = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    let isOpen = hours.isOpenNow ?? false;
    let status = 'Closed';
    let statusColor = 'text-red-600';
    let bgColor = 'bg-red-50';
    let closingSoon = false;

    if (hours.periods && hours.periods.length > 0) {
      const todayPeriods = hours.periods.filter((p) => p.open.day === currentDayIndex);

      for (const period of todayPeriods) {
        const openTime = parseInt(period.open.time.substring(0, 2)) * 60 + parseInt(period.open.time.substring(2));
        const closeTime = period.close
          ? parseInt(period.close.time.substring(0, 2)) * 60 + parseInt(period.close.time.substring(2))
          : 24 * 60; // Open 24 hours if no close time

        if (currentTime >= openTime && currentTime < closeTime) {
          isOpen = true;
          status = 'Open';
          statusColor = 'text-green-600';
          bgColor = 'bg-green-50';

          // Check if closing soon (within 1 hour)
          const timeUntilClose = closeTime - currentTime;
          if (timeUntilClose <= 60 && timeUntilClose > 0) {
            closingSoon = true;
            status = 'Closing soon';
            statusColor = 'text-yellow-600';
            bgColor = 'bg-yellow-50';
          }
          break;
        }
      }

      // If closed, find next opening time
      if (!isOpen && !closingSoon) {
        const nextOpening = findNextOpening(hours.periods, currentDayIndex, currentTime);
        if (nextOpening) {
          status = nextOpening;
        }
      }
    } else if (hours.isOpenNow !== undefined) {
      isOpen = hours.isOpenNow;
      status = isOpen ? 'Open' : 'Closed';
      statusColor = isOpen ? 'text-green-600' : 'text-red-600';
      bgColor = isOpen ? 'bg-green-50' : 'bg-red-50';
    }

    return { isOpen, status, statusColor, bgColor, currentDayIndex };
  }, [hours]);

  if (!hours) {
    return (
      <div id="business-info" className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm text-gray-500">Hours unavailable</span>
        </div>
      </div>
    );
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div id="business-info" className="p-4 border-b border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-sm font-semibold text-gray-900">Hours</h3>
          </div>

          {/* Current status */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${currentStatus.bgColor} ${currentStatus.statusColor}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  currentStatus.isOpen ? 'bg-green-600' : 'bg-red-600'
                }`}
                aria-hidden="true"
              />
              {currentStatus.status}
            </span>
          </div>

          {/* Today's hours */}
          {hours.weekdayText && hours.weekdayText[currentStatus.currentDayIndex] && (
            <div className="text-sm text-gray-700 mb-2">
              <span className="font-medium">Today: </span>
              {formatHoursText(hours.weekdayText[currentStatus.currentDayIndex])}
            </div>
          )}
        </div>

        {/* Expand/Collapse button */}
        {hours.weekdayText && hours.weekdayText.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={isExpanded ? 'Hide weekly hours' : 'Show weekly hours'}
            aria-expanded={isExpanded}
            type="button"
          >
            <svg
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Expandable weekly schedule */}
      {isExpanded && hours.weekdayText && (
        <div className="mt-3 space-y-1.5 text-sm">
          {hours.weekdayText.map((dayText, index) => {
            const isToday = index === currentStatus.currentDayIndex;
            return (
              <div
                key={index}
                className={`flex justify-between py-1.5 px-2 rounded ${
                  isToday ? 'bg-blue-50 font-medium' : ''
                }`}
              >
                <span className={isToday ? 'text-blue-900' : 'text-gray-700'}>{dayNames[index]}</span>
                <span className={isToday ? 'text-blue-900' : 'text-gray-600'}>
                  {formatHoursText(dayText)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * Helper function to format hours text
 */
function formatHoursText(text: string): string {
  // Extract just the hours portion (after the day name and colon)
  const parts = text.split(': ');
  if (parts.length > 1) {
    const hours = parts[1];

    // Handle special cases
    if (hours.toLowerCase().includes('open 24')) {
      return 'Open 24 hours';
    }
    if (hours.toLowerCase() === 'closed') {
      return 'Closed';
    }

    return hours;
  }
  return text;
}

/**
 * Helper function to find next opening time
 */
function findNextOpening(
  periods: any[],
  currentDay: number,
  currentTime: number
): string | null {
  // Look for next opening in the same day
  const todayPeriods = periods.filter((p) => p.open.day === currentDay);
  for (const period of todayPeriods) {
    const openTime = parseInt(period.open.time.substring(0, 2)) * 60 + parseInt(period.open.time.substring(2));
    if (openTime > currentTime) {
      const hours = Math.floor(openTime / 60);
      const minutes = openTime % 60;
      const timeStr = formatTime(hours, minutes);
      return `Opens today at ${timeStr}`;
    }
  }

  // Look for next opening in upcoming days
  for (let i = 1; i <= 7; i++) {
    const nextDay = (currentDay + i) % 7;
    const nextDayPeriods = periods.filter((p) => p.open.day === nextDay);
    if (nextDayPeriods.length > 0) {
      const period = nextDayPeriods[0];
      const openTime = parseInt(period.open.time.substring(0, 2)) * 60 + parseInt(period.open.time.substring(2));
      const hours = Math.floor(openTime / 60);
      const minutes = openTime % 60;
      const timeStr = formatTime(hours, minutes);
      const dayName = i === 1 ? 'tomorrow' : getDayName(nextDay);
      return `Opens ${dayName} at ${timeStr}`;
    }
  }

  return null;
}

/**
 * Helper function to format time in 12-hour format
 */
function formatTime(hours: number, minutes: number): string {
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Helper function to get day name
 */
function getDayName(day: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[day];
}
