/**
 * Marker Clustering Utilities
 * Manages clustering configuration and activation logic
 */

import { ClusterConfig } from '../types/business';

/**
 * Default cluster configuration
 */
export const DEFAULT_CLUSTER_CONFIG: ClusterConfig = {
  minZoom: 0,
  maxZoom: 21,
  gridSize: 60,
  activateThreshold: 50,
  maxBusinesses: 200,
};

/**
 * Check if clustering should be activated
 */
export function shouldActivateClustering(
  businessCount: number,
  config: ClusterConfig = DEFAULT_CLUSTER_CONFIG
): boolean {
  return businessCount >= config.activateThreshold;
}

/**
 * Get cluster styles based on business count
 */
export function getClusterStyles() {
  return [
    {
      textColor: 'white',
      textSize: 12,
      url: 'data:image/svg+xml;base64,' + btoa(generateClusterIcon('#4285F4', 40)),
      height: 40,
      width: 40,
      anchorText: [0, 0],
    },
    {
      textColor: 'white',
      textSize: 13,
      url: 'data:image/svg+xml;base64,' + btoa(generateClusterIcon('#FBC02D', 50)),
      height: 50,
      width: 50,
      anchorText: [0, 0],
    },
    {
      textColor: 'white',
      textSize: 14,
      url: 'data:image/svg+xml;base64,' + btoa(generateClusterIcon('#E53935', 60)),
      height: 60,
      width: 60,
      anchorText: [0, 0],
    },
  ];
}

/**
 * Generate SVG cluster icon
 */
function generateClusterIcon(color: string, size: number): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}"
              fill="${color}" stroke="white" stroke-width="2"/>
    </svg>
  `;
}

/**
 * Calculate cluster size category based on marker count
 * Returns index for cluster styles array (0 = small, 1 = medium, 2 = large)
 */
export function getClusterSizeCategory(markerCount: number): number {
  if (markerCount < 10) return 0;
  if (markerCount < 30) return 1;
  return 2;
}

/**
 * Get cluster renderer function for MarkerClusterer
 */
export function createClusterRenderer() {
  return {
    render: ({ count, position }: { count: number; position: google.maps.LatLng }) => {
      const category = getClusterSizeCategory(count);
      const colors = ['#4285F4', '#FBC02D', '#E53935'];
      const sizes = [40, 50, 60];

      const color = colors[category];
      const size = sizes[category];

      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
          <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}"
                  fill="${color}" stroke="white" stroke-width="2" opacity="0.8"/>
          <text x="${size / 2}" y="${size / 2}"
                text-anchor="middle" dominant-baseline="central"
                font-family="Arial, sans-serif" font-size="14" font-weight="bold"
                fill="white">${count}</text>
        </svg>
      `;

      const icon = {
        url: 'data:image/svg+xml;base64,' + btoa(svg),
        scaledSize: new google.maps.Size(size, size),
        anchor: new google.maps.Point(size / 2, size / 2),
      };

      return new google.maps.Marker({
        position,
        icon,
        zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
      });
    },
  };
}
