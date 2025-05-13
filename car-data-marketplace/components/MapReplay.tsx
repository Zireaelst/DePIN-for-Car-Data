import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native'; // Added Platform
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { CarData } from '../types/CarData';
import { carDataService } from '../services/carDataService';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

const MAP_REPLAY_UPDATE_INTERVAL = 1000; // milliseconds
const HISTORICAL_DATA_MINUTES = 60; // Fetch last 60 minutes of data for replay

const MapReplay: React.FC = () => {
  const [routeCoordinates, setRouteCoordinates] = useState<CarData[]>([]);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [currentRegion, setCurrentRegion] = useState<Region | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapRef = useRef<MapView>(null);
  const intervalRef = useRef<number | null>(null);
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (Platform.OS === 'web') { // Don't fetch data or initialize map on web for now
      setIsLoading(false);
      setError('Map replay is not currently available on the web.');
      return;
    }
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Fetch more data points for a smoother replay if available
        const data = await carDataService.getHistoricalData(HISTORICAL_DATA_MINUTES * 2); 
        if (data && data.length > 0) {
          setRouteCoordinates(data);
          const initialRegion = {
            latitude: data[0].latitude,
            longitude: data[0].longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          setCurrentRegion(initialRegion);
          if (mapRef.current) {
            mapRef.current.animateToRegion(initialRegion, 1000);
          }
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

    fetchData();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Ensure dependencies are correct if any are added to the fetchData logic

  useEffect(() => {
    if (Platform.OS === 'web' || routeCoordinates.length === 0 || currentPositionIndex >= routeCoordinates.length -1) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    if (routeCoordinates.length > 0 && currentPositionIndex < routeCoordinates.length -1) {
      intervalRef.current = setInterval(() => {
        setCurrentPositionIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          if (nextIndex < routeCoordinates.length) {
            const newPosition = routeCoordinates[nextIndex];
            if (mapRef.current && newPosition) {
              mapRef.current.animateToRegion({
                latitude: newPosition.latitude,
                longitude: newPosition.longitude,
                latitudeDelta: currentRegion?.latitudeDelta || 0.01, // Keep zoom level
                longitudeDelta: currentRegion?.longitudeDelta || 0.01,
              }, MAP_REPLAY_UPDATE_INTERVAL / 2);
            }
            return nextIndex;
          }
          if (intervalRef.current) clearInterval(intervalRef.current); // Stop interval at the end
          return prevIndex;
        });
      }, MAP_REPLAY_UPDATE_INTERVAL);
    } else if (intervalRef.current && currentPositionIndex >= routeCoordinates.length -1) {
        clearInterval(intervalRef.current); // Ensure interval is cleared if already at the end
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [routeCoordinates, currentPositionIndex, currentRegion]);

  if (Platform.OS === 'web') {
    return (
      <ThemedView style={[styles.container, styles.webPlaceholder]}>
        <ThemedText style={styles.webPlaceholderText}>
          Map Replay is not available on the web version at this time.
        </ThemedText>
      </ThemedView>
    );
  }

  if (isLoading) {
    return <ThemedView style={styles.container}><ThemedText>Loading map data...</ThemedText></ThemedView>;
  }

  if (error) {
    return <ThemedView style={styles.container}><ThemedText>Error: {error}</ThemedText></ThemedView>;
  }

  if (routeCoordinates.length === 0) {
    return <ThemedView style={styles.container}><ThemedText>No route data to display.</ThemedText></ThemedView>;
  }

  const currentDataPoint = routeCoordinates[currentPositionIndex];
  const polylineCoords = routeCoordinates.map(p => ({ latitude: p.latitude, longitude: p.longitude }));

  return (
    <ThemedView style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined} // Google Maps for Android
        initialRegion={currentRegion}
        onRegionChangeComplete={setCurrentRegion} // Update region when user manually moves map
        showsUserLocation={false}
        showsMyLocationButton={false}
        mapType={colorScheme === 'dark' ? 'mutedStandard' : 'standard'} // Basic map type
      >
        <Polyline
          coordinates={polylineCoords}
          strokeColor={themeColors.tint} 
          strokeWidth={4}
        />
        {currentDataPoint && (
          <Marker
            coordinate={{
              latitude: currentDataPoint.latitude,
              longitude: currentDataPoint.longitude,
            }}
            title="Vehicle"
            description={`Speed: ${currentDataPoint.speed.toFixed(1)} mph`}
            pinColor={themeColors.tint}
          />
        )}
      </MapView>
      {currentDataPoint && (
        <ThemedView style={[styles.dataOverlay, {backgroundColor: themeColors.background}]}>
          <ThemedText style={styles.dataText}>Timestamp: {new Date(currentDataPoint.timestamp).toLocaleTimeString()}</ThemedText>
          <ThemedText style={styles.dataText}>Speed: {currentDataPoint.speed.toFixed(1)} mph</ThemedText>
          <ThemedText style={styles.dataText}>RPM: {currentDataPoint.rpm}</ThemedText>
          <ThemedText style={styles.dataText}>Fuel: {currentDataPoint.fuelLevel.toFixed(1)}%</ThemedText>
          {currentDataPoint.diagnosticCode && <ThemedText style={styles.dataText}>DTC: {currentDataPoint.diagnosticCode}</ThemedText>}
        </ThemedView>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: '100%',
    // Let's make the map take up more of its container space
    // height: '70%', // Adjust as needed
    flex: 1, 
  },
  dataOverlay: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 10 : 20, // Adjust for web if it were to render
    left: 10,
    right: 10,
    padding: 10,
    borderRadius: 8,
  },
  dataText: {
    fontSize: 14,
    marginBottom: 4,
  },
  webPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    height: 300, // Match mapContainer height from index.tsx
  },
  webPlaceholderText: {
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.7,
  }
});

export default MapReplay;
