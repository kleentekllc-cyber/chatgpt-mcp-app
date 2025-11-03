/**
 * MapView Component
 * Renders the Google Maps instance with pan, zoom, and marker support
 * Integrated with BusinessCard for detailed business information and Directions
 */

import React, { useEffect, useRef, useState } from 'react';
import { Map, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import type { MapViewProps } from '../../types/google-maps';
import { Marker } from './Marker';
import { BusinessMarkerData, BusinessData } from '../../types/business';
import { generatePopupHTML } from './BusinessPopup';
import { BusinessCard } from '../business-card';
import { fetchPlaceDetails } from '../../lib/api/placeDetails';
import { useDirections } from '../../context/DirectionsContext';
import { DirectionsPanel } from './DirectionsPanel';
import { RoutePolyline } from './RoutePolyline';
import { decodePolyline } from '../../lib/directions-api-client';

// Default map center: San Francisco
const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 };
const DEFAULT_ZOOM = 12;

// Internal component to handle map instance ref
const MapRefHandler: React.FC<{ mapRef: React.MutableRefObject<any>; onMapLoad?: (map: any) => void }> = ({ mapRef, onMapLoad }) => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      mapRef.current = map;
      if (onMapLoad) {
        onMapLoad(map);
      }
    }
  }, [map, mapRef, onMapLoad]);

  return null;
};

export const MapView: React.FC<MapViewProps> = ({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  markers = [],
  onMapLoad,
}) => {
  const mapRef = useRef<any>(null);
  const [selectedMarker, setSelectedMarker] = useState<BusinessMarkerData | null>(null);
  const [infoWindowPosition, setInfoWindowPosition] = useState<{ lat: number; lng: number } | null>(null);

  // Business card state
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [selectedBusinessData, setSelectedBusinessData] = useState<BusinessData | null>(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const previousMarkerRef = useRef<string | null>(null);

  // Directions state
  const directions = useDirections();

  useEffect(() => {
    // Cleanup function to remove event listeners
    return () => {
      if (mapRef.current && typeof window !== 'undefined' && (window as any).google) {
        (window as any).google.maps.event.clearInstanceListeners(mapRef.current);
      }
    };
  }, []);

  // Fit map bounds when directions are active
  useEffect(() => {
    if (
      directions.isActive &&
      directions.routes.length > 0 &&
      mapRef.current &&
      typeof window !== 'undefined' &&
      (window as any).google
    ) {
      const route = directions.routes[directions.selectedRouteIndex];
      if (route) {
        const bounds = new (window as any).google.maps.LatLngBounds();
        bounds.extend(route.bounds.northeast);
        bounds.extend(route.bounds.southwest);

        mapRef.current.fitBounds(bounds, {
          top: 50,
          bottom: 50,
          left: window.innerWidth < 640 ? 20 : 420, // Account for directions panel on desktop
          right: 50,
        });
      }
    }
  }, [directions.isActive, directions.routes, directions.selectedRouteIndex]);


  const handleMarkerClick = async (marker: any) => {
    // Type guard to check if marker has popup data
    if ('popup' in marker) {
      const businessMarker = marker as BusinessMarkerData;
      setSelectedMarker(businessMarker);
      setInfoWindowPosition(businessMarker.position);

      // Fetch detailed business data
      try {
        setCardLoading(true);
        setCardError(null);
        setIsCardOpen(true);

        const placeId = businessMarker.id;
        const businessData = await fetchPlaceDetails(placeId);

        setSelectedBusinessData(businessData);
        setCardLoading(false);

        // Close info window when card opens
        setSelectedMarker(null);
        setInfoWindowPosition(null);

        // Store current marker for focus return
        previousMarkerRef.current = placeId;
      } catch (error) {
        console.error('Error fetching business details:', error);
        setCardError(error instanceof Error ? error.message : 'Failed to load business details');
        setCardLoading(false);
      }
    }
  };

  const handleInfoWindowClose = () => {
    setSelectedMarker(null);
    setInfoWindowPosition(null);
  };

  const handleCardClose = () => {
    setIsCardOpen(false);
    setSelectedBusinessData(null);
    setCardError(null);
    setCardLoading(false);

    // Return focus to marker (in a real implementation, this would focus the marker element)
    // For now, we'll just clear the reference
    previousMarkerRef.current = null;
  };

  const handleDirections = async () => {
    const business = selectedBusinessData;
    if (business && business.location) {
      try {
        // Close business card
        setIsCardOpen(false);

        // Start directions
        await directions.startDirections(business.location, business.name);
      } catch (error) {
        console.error('Error starting directions:', error);
        // Could show error toast here
      }
    }
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleWebsite = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = (_placeId: string) => {
    const business = selectedBusinessData;
    if (business?.googleMapsUrl) {
      if (navigator.share) {
        navigator
          .share({
            title: business.name,
            text: `Check out ${business.name}`,
            url: business.googleMapsUrl,
          })
          .catch((error) => console.log('Error sharing:', error));
      } else {
        navigator.clipboard.writeText(business.googleMapsUrl);
        alert('Link copied to clipboard!');
      }
    }
  };

  const handleDirectionsClose = () => {
    directions.closeDirections();
    // Optionally reopen business card
    if (selectedBusinessData) {
      setIsCardOpen(true);
    }
  };

  // Get decoded polyline path for selected route
  const routePath =
    directions.isActive &&
    directions.routes.length > 0 &&
    directions.routes[directions.selectedRouteIndex]
      ? decodePolyline(directions.routes[directions.selectedRouteIndex].overviewPolyline)
      : [];

  return (
    <>
      <div className="w-screen h-screen">
        <Map
          defaultCenter={center}
          defaultZoom={zoom}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapId="localhub-map"
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
          streetViewControl={false}
          mapTypeControl={false}
          fullscreenControl={false}
        >
          <MapRefHandler mapRef={mapRef} onMapLoad={onMapLoad} />
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.position}
              label={marker.label}
              icon={marker.icon}
              onClick={() => handleMarkerClick(marker)}
            />
          ))}

          {/* Origin marker when directions are active */}
          {directions.isActive && directions.userLocation && (
            <Marker
              key="directions-origin"
              position={directions.userLocation.coords}
              icon="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iOCIgZmlsbD0iIzM0QTg1MyIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIzIi8+PC9zdmc+"
            />
          )}

          {/* Route polyline */}
          {directions.isActive && routePath.length > 0 && (
            <RoutePolyline path={routePath} color="#4285F4" strokeWeight={5} zIndex={100} />
          )}

          {/* Alternative routes */}
          {directions.isActive &&
            directions.routes.length > 1 &&
            directions.routes.map((route, index) => {
              if (index === directions.selectedRouteIndex) return null;

              const altPath = decodePolyline(route.overviewPolyline);
              return (
                <RoutePolyline
                  key={`alt-route-${index}`}
                  path={altPath}
                  color="#9E9E9E"
                  strokeWeight={4}
                  zIndex={90}
                  opacity={0.6}
                  onClick={() => directions.selectRoute(index)}
                />
              );
            })}

          {/* Info Window for selected marker */}
          {selectedMarker && infoWindowPosition && !isCardOpen && (
            <InfoWindow position={infoWindowPosition} onCloseClick={handleInfoWindowClose}>
              <div dangerouslySetInnerHTML={{ __html: generatePopupHTML(selectedMarker.popup) }} />
            </InfoWindow>
          )}
        </Map>
      </div>

      {/* Business Card */}
      {!directions.isActive && (
        <BusinessCard
          businessData={selectedBusinessData}
          isOpen={isCardOpen}
          onClose={handleCardClose}
          onDirections={handleDirections}
          onCall={handleCall}
          onWebsite={handleWebsite}
          onShare={handleShare}
          loading={cardLoading}
          error={cardError}
        />
      )}

      {/* Directions Panel */}
      {directions.isActive && (
        <DirectionsPanel
          route={
            directions.routes.length > 0 ? directions.routes[directions.selectedRouteIndex] : null
          }
          travelMode={directions.travelMode}
          onTravelModeChange={directions.changeTravelMode}
          onClose={handleDirectionsClose}
          loading={directions.loading}
          error={directions.error}
          businessName={directions.businessName}
        />
      )}
    </>
  );
};
