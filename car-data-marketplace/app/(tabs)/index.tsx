import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { CarDataMetrics } from '@/components/CarDataMetrics';
import { WalletCard } from '@/components/WalletCard';
import { carDataService } from '@/services/carDataService';
import { CarData, CarDataSummary, UserWalletInfo } from '@/types/CarData';
import MapReplay from '@/components/MapReplay';

// Helper function to format date
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function HomeScreen() {
  const [currentData, setCurrentData] = useState<CarData | null>(null);
  const [dataSummary, setDataSummary] = useState<CarDataSummary | null>(null); // Renamed from summary to avoid conflict
  const [walletInfo, setWalletInfo] = useState<UserWalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Added isLoading state
  const [refreshing, setRefreshing] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setIsLoading(true); // Set loading true at the start
    try {
      const currentVehicleData = await carDataService.getCurrentVehicleData();
      setCurrentData(currentVehicleData);
      
      const summaryData = await carDataService.getDataSummary(); // Use a different variable name
      setDataSummary(summaryData);
      
      const wallet = await carDataService.getUserWallet();
      setWalletInfo(wallet);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load vehicle data');
    } finally {
      setIsLoading(false); // Set loading false at the end
    }
  };

  const handleRefreshEarnings = async () => {
    if (!walletInfo) return;
    
    setRefreshing(true);
    try {
      const earnings = await carDataService.simulateEarnings();
      
      if (earnings > 0) {
        const updatedWallet = await carDataService.getUserWallet();
        setWalletInfo(updatedWallet);
        Alert.alert('Earnings Updated', `You earned $${earnings.toFixed(2)} from your shared data!`);
      } else {
        Alert.alert('No New Earnings', 'Start sharing your data to earn rewards');
      }
    } catch (error) {
      console.error('Error refreshing earnings:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Convert currentData to metrics format
  const getCurrentDataMetrics = () => {
    if (!currentData) return [];
    
    return [
      {
        label: 'Speed',
        value: currentData.speed,
        unit: 'mph',
        icon: 'speedometer',
        color: '#007AFF'
      },
      {
        label: 'RPM',
        value: currentData.rpm,
        icon: 'pulse',
        color: '#FF9500'
      },
      {
        label: 'Fuel Level',
        value: currentData.fuelLevel,
        unit: '%',
        icon: 'water',
        color: '#34C759'
      },
      {
        label: 'Engine Temp',
        value: currentData.engineTemp,
        unit: '°C',
        icon: 'thermometer',
        color: '#FF3B30'
      }
    ];
  };
  
  // Convert summary to metrics format
  const getSummaryMetrics = () => {
    if (!dataSummary) return [];
    
    return [
      {
        label: 'Avg Speed',
        value: dataSummary.avgSpeed,
        unit: 'mph',
        icon: 'speedometer',
        color: '#007AFF'
      },
      {
        label: 'Max Speed',
        value: dataSummary.maxSpeed,
        unit: 'mph',
        icon: 'trending-up',
        color: '#FF3B30'
      },
      {
        label: 'Distance',
        value: dataSummary.distanceTraveled,
        unit: 'mi',
        icon: 'navigate',
        color: '#5856D6'
      },
      {
        label: 'Fuel Used',
        value: dataSummary.fuelUsed,
        unit: 'gal',
        icon: 'water',
        color: '#34C759'
      }
    ];
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#1B1F24', dark: '#1B1F24' }}
      headerImage={
        <Image
          source={require('@/assets/images/car-bg.png')}
          style={{ 
            width: '100%',
            height: '100%',  // Fill the entire header height
            resizeMode: 'cover',
            position: 'absolute',
            top: 0,          // Ensure it starts from the very top
            left: 0,
            right: 0,
            bottom: 0
          }} 
        />
      }>
      {/* Enhanced banner with gradient background */}
      <ThemedView style={styles.bannerContainer}>
        <View style={styles.bannerContent}>
          <View>
            <ThemedText type="title" style={styles.bannerTitle}>
              Welcome to Your Car Data Dashboard
            </ThemedText>
            <ThemedText style={styles.bannerSubtitle}>
              {walletInfo ? `${walletInfo.sharingActive ? 'Actively sharing' : 'Start sharing'} data to earn rewards` : 'Connect your vehicle to start'}
            </ThemedText>
          </View>
          <View style={styles.iconContainer}>
            <HelloWave />
          </View>
        </View>
        
        {/* Visual elements to represent car data flow */}
        <View style={styles.dataFlowIndicator}>
          <View style={[styles.dataPoint, styles.dataPoint1]} />
          <View style={[styles.dataPoint, styles.dataPoint2]} />
          <View style={[styles.dataPoint, styles.dataPoint3]} />
        </View>
      </ThemedView>

      {/* Map Replay component */}
      <ThemedView style={styles.mapContainer}>
        <MapReplay />
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">Live Metrics</ThemedText>
        {/* Ensure CarDataMetrics receives the correct props based on its definition */}
        {/* Assuming CarDataMetrics might not need all these, or has specific prop names */}
        {/* For now, passing what seems logical based on previous structure */}
        <CarDataMetrics 
          metrics={getCurrentDataMetrics()} 
          title="Live Car Data" 
          subtitle={currentData?.timestamp ? `Last updated: ${formatTime(currentData.timestamp)}` : undefined}
          // summary={dataSummary} // If CarDataMetrics needs a summary prop directly
          // isLoading={isLoading} // If CarDataMetrics handles its own loading state or needs this
        />
      </ThemedView>
      
      {/* Live Car Data - This section might be redundant if CarDataMetrics above handles it */}
      {/* {currentData && (
        <CarDataMetrics 
          metrics={getCurrentDataMetrics()} 
          title="Live Car Data" 
          subtitle={currentData.timestamp ? `Last updated: ${formatTime(currentData.timestamp)}` : undefined}
        />
      )} */}
      
      {/* Trip Summary */}
      {dataSummary && (
        <CarDataMetrics 
          metrics={getSummaryMetrics(dataSummary)} // Pass dataSummary to the function
          title="Trip Summary"
          subtitle="Past 24 hours"
        />
      )}
      
      {/* Wallet Information */}
      {walletInfo && (
        <WalletCard 
          walletInfo={walletInfo} 
          onRefresh={handleRefreshEarnings}
          loading={refreshing}
        />
      )}

      {/* Vehicle Information */}
      <ThemedView style={styles.vehicleContainer} lightColor="rgba(30, 34, 42, 0.7)" darkColor="rgba(30, 34, 42, 0.7)">
        <View style={styles.vehicleHeader}>
          <ThemedText type="subtitle">Your Vehicle</ThemedText>
          <Ionicons name="car" size={24} color="#007AFF" />
        </View>
        
        <View style={styles.vehicleDetailsContainer}>
          <View style={styles.vehicleDetail}>
            <ThemedText style={styles.vehicleDetailLabel}>Make</ThemedText>
            <ThemedText style={styles.vehicleDetailValue}>Tesla</ThemedText>
          </View>
          <View style={styles.vehicleDetail}>
            <ThemedText style={styles.vehicleDetailLabel}>Model</ThemedText>
            <ThemedText style={styles.vehicleDetailValue}>Model 3</ThemedText>
          </View>
          <View style={styles.vehicleDetail}>
            <ThemedText style={styles.vehicleDetailLabel}>Year</ThemedText>
            <ThemedText style={styles.vehicleDetailValue}>2023</ThemedText>
          </View>
          <View style={styles.vehicleDetail}>
            <ThemedText style={styles.vehicleDetailLabel}>Connection</ThemedText>
            <ThemedText style={styles.vehicleDetailValue}>OBD-II</ThemedText>
          </View>
        </View>
      </ThemedView>
      
      <ThemedText style={styles.footerText}>
        This app simulates a DePIN-powered car data marketplace. Tap on the Marketplace tab to view and share your vehicle data.
      </ThemedText>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    height: 120,
    width: '100%',
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  // New banner styles
  bannerContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Gradient-like background effect achieved by the background color plus a border
    backgroundColor: 'rgba(30, 34, 42, 0.9)', // Slightly transparent dark background
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderLeftWidth: 4,
    borderLeftColor: '#0a7ea4', // Accent color matching the car icon
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTitle: {
    marginBottom: 6,
    fontSize: 22,
  },
  bannerSubtitle: {
    opacity: 0.7,
    fontSize: 14,
  },
  iconContainer: {
    backgroundColor: 'rgba(10, 126, 164, 0.2)', // Light blue bg for the car icon
    padding: 10,
    borderRadius: 50,
    marginLeft: 10,
  },
  // Animation dots to simulate data flow
  dataFlowIndicator: {
    flexDirection: 'row',
    marginTop: 12,
  },
  dataPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dataPoint1: {
    backgroundColor: '#0a7ea4', // Primary tint
    opacity: 0.7,
  },
  dataPoint2: {
    backgroundColor: '#0a7ea4',
    opacity: 0.5,
  },
  dataPoint3: {
    backgroundColor: '#0a7ea4',
    opacity: 0.3,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 217, 100, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CD964',
    marginRight: 6,
  },
  statusText: {
    color: '#4CD964',
    fontSize: 14,
    fontWeight: '600',
  },
  vehicleContainer: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  vehicleDetailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  vehicleDetail: {
    width: '48%',
    marginBottom: 16,
  },
  vehicleDetailLabel: {
    opacity: 0.7,
    marginBottom: 4,
  },
  vehicleDetailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 14,
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  mapContainer: {
    height: 300, 
    width: '100%',
    marginBottom: 16, 
    borderWidth: 1,
    borderColor: '#ddd', 
    borderRadius: 8,
    overflow: 'hidden', 
  },
  sectionContainer: { // Added sectionContainer style
    marginBottom: 16,
    paddingHorizontal: 16, // Optional: for consistency with other sections
  },
});
