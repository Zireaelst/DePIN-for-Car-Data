import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { CarData } from '../types/CarData';
import { carDataService } from '../services/carDataService';

// Use dynamic imports for web-only components to prevent SSR issues
const hasWindow = typeof window !== 'undefined';

// Only import Leaflet components when running in browser
let MapContainer, TileLayer, Marker, Polyline, useMap, L;
if (hasWindow) {
  // Import dynamically
  const leafletReact = require('react-leaflet');
  MapContainer = leafletReact.MapContainer;
  TileLayer = leafletReact.TileLayer;
  Marker = leafletReact.Marker;
  Polyline = leafletReact.Polyline;
  useMap = leafletReact.useMap;
  
  // Import CSS
  require('leaflet/dist/leaflet.css');
  
  // Fix Leaflet icon issues
  L = require('leaflet');
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
}

// Create a custom marker icon with a blue pin
const createCustomIcon = (L) => {
  return L.divIcon({
    html: `<div style="
      background-color: #0a7ea4;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 5px rgba(0,0,0,0.5);
    "></div>`,
    className: 'custom-div-icon',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

const MAP_REPLAY_UPDATE_INTERVAL = 1000; // milliseconds
const HISTORICAL_DATA_MINUTES = 60; // Fetch last 60 minutes of data for replay

const MapReplay: React.FC = () => {
  const [routeCoordinates, setRouteCoordinates] = useState<CarData[]>([]);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false); // Track if we're in client-side environment
  const intervalRef = useRef<number | null>(null);
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const mapRef = useRef(null);

  // Set isClient to true once component mounts (we're in browser environment)
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Fetch more data points for a smoother replay if available
        const data = await carDataService.getHistoricalData(HISTORICAL_DATA_MINUTES * 2); 
        if (data && data.length > 0) {
          setRouteCoordinates(data);
        } else {
          setError('No historical data available for map replay.');
        }
      } catch (e) {
        console.error('Failed to load data for map replay:', e);
        setError('Failed to load route data.');
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch data on client-side
    if (isClient) {
      fetchData();
    }

    return () => {
      if (intervalRef.current && typeof window !== 'undefined') {
        clearInterval(intervalRef.current);
      }
    };
  }, [isClient]); // Depend on isClient

  useEffect(() => {
    // Only set up interval if we're in the browser and have data
    if (!isClient || routeCoordinates.length === 0 || currentPositionIndex >= routeCoordinates.length - 1) {
      return;
    }
    
    // Safely access window
    if (typeof window !== 'undefined') {
      intervalRef.current = window.setInterval(() => {
        setCurrentPositionIndex(prevIndex => {
          const nextIndex = prevIndex + 1;
          if (nextIndex >= routeCoordinates.length && intervalRef.current && typeof window !== 'undefined') {
            window.clearInterval(intervalRef.current);
          }
          return nextIndex < routeCoordinates.length ? nextIndex : prevIndex;
        });
      }, MAP_REPLAY_UPDATE_INTERVAL);
    }
    
    return () => {
      if (intervalRef.current && typeof window !== 'undefined') {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [routeCoordinates, currentPositionIndex, isClient]);

  // Server-side or loading state
  if (!isClient || isLoading) {
    return <ThemedView style={styles.container}><ThemedText>Loading map data...</ThemedText></ThemedView>;
  }

  if (error) {
    return <ThemedView style={styles.container}><ThemedText>Error: {error}</ThemedText></ThemedView>;
  }

  if (routeCoordinates.length === 0) {
    return <ThemedView style={styles.container}><ThemedText>No route data to display.</ThemedText></ThemedView>;
  }

  const currentDataPoint = routeCoordinates[currentPositionIndex];
  // Don't create polyline coords for every point - just relevant section of the journey
  // This helps prevent the white line flashing issue
  const polylineCoords = routeCoordinates
    .slice(0, currentPositionIndex + 1) // Only plot the path up to current position
    .map(p => [p.latitude, p.longitude] as [number, number]);
    
  const mapCenter: [number, number] = [currentDataPoint.latitude, currentDataPoint.longitude];
  
  // Choose map tiles based on color scheme
  const mapTilesUrl = colorScheme === 'dark' 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  
  const attribution = colorScheme === 'dark'
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <ThemedView style={styles.container}>
      <div style={{ height: '100%', width: '100%', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
        {hasWindow && MapContainer ? (
          <MapContainer 
            center={mapCenter} 
            zoom={15} 
            style={{ height: '100%', width: '100%' }}
            attributionControl={false}
            ref={mapRef}
          >
            <TileLayer url={mapTilesUrl} attribution={attribution} />
            <Polyline 
              positions={polylineCoords} 
              color={themeColors.tint} 
              weight={4}
            />
            {hasWindow && L && (
              <Marker 
                position={mapCenter} 
                icon={createCustomIcon(L)}
              />
            )}
          </MapContainer>
        ) : (
          <ThemedText>Loading map...</ThemedText>
        )}

        {/* Fixed data overlay that stays at bottom of map */}
        {currentDataPoint && hasWindow && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            right: '10px',
            padding: '10px',
            borderRadius: '6px',
            backgroundColor: colorScheme === 'dark' ? 'rgba(30, 34, 42, 0.85)' : 'rgba(30, 34, 42, 0.7)',
            color: 'white',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
            zIndex: 1000,
          }}>
            <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>
              Timestamp: {new Date(currentDataPoint.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', second: '2-digit'})}
            </div>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <div style={{ marginRight: '16px' }}>
                <span>Speed: {currentDataPoint.speed.toFixed(1)} mph</span>
              </div>
              <div style={{ marginRight: '16px' }}>
                <span>RPM: {currentDataPoint.rpm}</span>
              </div>
              <div>
                <span>Fuel: {currentDataPoint.fuelLevel.toFixed(1)}%</span>
              </div>
              {currentDataPoint.diagnosticCode && (
                <div style={{ marginLeft: '16px' }}>
                  <span>DTC: {currentDataPoint.diagnosticCode}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    height: 300,
  },
});

export default MapReplay;
