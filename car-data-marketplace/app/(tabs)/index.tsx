import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Alert, Platform } from 'react-native';
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

// Helper function to format date
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function HomeScreen() {
  const [currentData, setCurrentData] = useState<CarData | null>(null);
  const [summary, setSummary] = useState<CarDataSummary | null>(null);
  const [walletInfo, setWalletInfo] = useState<UserWalletInfo | null>(null);
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
    try {
      const currentVehicleData = await carDataService.getCurrentVehicleData();
      setCurrentData(currentVehicleData);
      
      const dataSummary = await carDataService.getDataSummary();
      setSummary(dataSummary);
      
      const wallet = await carDataService.getUserWallet();
      setWalletInfo(wallet);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load vehicle data');
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
    if (!summary) return [];
    
    return [
      {
        label: 'Avg Speed',
        value: summary.avgSpeed,
        unit: 'mph',
        icon: 'speedometer',
        color: '#007AFF'
      },
      {
        label: 'Max Speed',
        value: summary.maxSpeed,
        unit: 'mph',
        icon: 'trending-up',
        color: '#FF3B30'
      },
      {
        label: 'Distance',
        value: summary.distanceTraveled,
        unit: 'mi',
        icon: 'navigate',
        color: '#5856D6'
      },
      {
        label: 'Fuel Used',
        value: summary.fuelUsed,
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
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer} lightColor="transparent" darkColor="transparent">
        <ThemedText type="title">DeCharge Car Data</ThemedText>
        <View style={styles.statusContainer}>
          <View style={styles.statusDot} />
          <ThemedText style={styles.statusText}>Connected</ThemedText>
        </View>
      </ThemedView>

      {/* Live Car Data */}
      {currentData && (
        <CarDataMetrics 
          metrics={getCurrentDataMetrics()} 
          title="Live Car Data" 
          subtitle={currentData.timestamp ? `Last updated: ${formatTime(currentData.timestamp)}` : undefined}
        />
      )}
      
      {/* Trip Summary */}
      {summary && (
        <CarDataMetrics 
          metrics={getSummaryMetrics()}
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
    height: 178,
    width: '100%',
    bottom: 0,
    left: 0,
    position: 'absolute',
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
});
