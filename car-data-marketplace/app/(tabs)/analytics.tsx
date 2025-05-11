import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, View, RefreshControl, Switch, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { DataChart } from '@/components/DataChart';
import { CarData } from '@/types/CarData';
import { carDataService } from '@/services/carDataService';

export default function AnalyticsScreen() {
  const [carData, setCarData] = useState<CarData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [usingRealData, setUsingRealData] = useState(false);
  
  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
      checkDataSource();
    }, [])
  );
  
  const loadData = async () => {
    setRefreshing(true);
    try {
      const data = await carDataService.getHistoricalData();
      setCarData(data);
    } catch (error) {
      console.error('Error loading historical data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const checkDataSource = async () => {
    try {
      const isUsingReal = await carDataService.isUsingRealData();
      setUsingRealData(isUsingReal);
    } catch (error) {
      console.error('Error checking data source:', error);
    }
  };

  const toggleDataSource = async () => {
    try {
      const isNowUsingReal = await carDataService.toggleDataSource();
      setUsingRealData(isNowUsingReal);
      
      // Show information about the data source change
      Alert.alert(
        isNowUsingReal ? 'Using Real OBD Data' : 'Using Simulated Data',
        isNowUsingReal 
          ? 'Showing real vehicle data captured from OBD logs.'
          : 'Showing simulated vehicle data for demonstration.'
      );
      
      // Reload data with the new source
      loadData();
    } catch (error) {
      console.error('Error toggling data source:', error);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={loadData} />
      }
    >
      <ThemedView style={styles.headerContainer}>
        <View style={styles.titleRow}>
          <ThemedText type="title">Vehicle Data Analytics</ThemedText>
          <View style={styles.dataSourceToggle}>
            <ThemedText style={styles.toggleLabel}>
              {usingRealData ? 'Real OBD' : 'Mock'}
            </ThemedText>
            <Switch
              value={usingRealData}
              onValueChange={toggleDataSource}
              trackColor={{ false: '#767577', true: '#4CD964' }}
              thumbColor="#f4f3f4"
            />
          </View>
        </View>
        <ThemedText style={styles.subtitle}>
          Historical data trends from your vehicle
        </ThemedText>
      </ThemedView>
      
      {carData.length > 0 ? (
        <>
          <DataChart 
            data={carData} 
            chartType="speed" 
            title="Speed Trends"
          />
          
          <DataChart 
            data={carData} 
            chartType="rpm" 
            title="Engine RPM"
          />
          
          <DataChart 
            data={carData} 
            chartType="fuelLevel" 
            title="Fuel Level"
          />
          
          <DataChart 
            data={carData} 
            chartType="engineTemp" 
            title="Engine Temperature"
          />

          {usingRealData && (
            <ThemedView style={styles.infoAlert}>
              <ThemedText type="defaultSemiBold">Using Real OBD Data</ThemedText>
              <ThemedText style={styles.infoAlertText}>
                This data was captured from an actual vehicle&apos;s OBD interface in Bangalore, India.
              </ThemedText>
            </ThemedView>
          )}
          
          <ThemedView style={styles.infoCard}>
            <ThemedText type="defaultSemiBold" style={styles.infoTitle}>
              Data Value Insights
            </ThemedText>
            <ThemedText style={styles.infoText}>
              Your vehicle generates valuable data that can be monetized on the DePIN marketplace.
            </ThemedText>
            <View style={styles.dataPointsContainer}>
              <DataValuePoint 
                title="Speed & Route Data" 
                description="Helps improve traffic predictions and route optimizations"
                value={4.5}
              />
              <DataValuePoint 
                title="Engine Performance" 
                description="Valuable for predictive maintenance and part manufacturers"
                value={6.2}
              />
              <DataValuePoint 
                title="Fuel Consumption" 
                description="Helps improve fuel efficiency algorithms and eco-routing"
                value={3.8}
              />
            </View>
          </ThemedView>
        </>
      ) : (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText>No historical data available</ThemedText>
        </ThemedView>
      )}
    </ScrollView>
  );
}

// Helper component for displaying data value insights
type DataValuePointProps = {
  title: string;
  description: string;
  value: number;
};

const DataValuePoint = ({ title, description, value }: DataValuePointProps) => {
  return (
    <ThemedView style={styles.dataPointCard}>
      <View style={styles.dataPointHeader}>
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
        <ThemedText style={styles.dataPointValue}>${value.toFixed(2)}/mo</ThemedText>
      </View>
      <ThemedText style={styles.dataPointDescription}>{description}</ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  headerContainer: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  dataSourceToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    marginRight: 8,
    fontSize: 14,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  infoAlert: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 204, 0, 0.15)',
    marginVertical: 8,
  },
  infoAlertText: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 4,
  },
  infoTitle: {
    marginBottom: 8,
  },
  infoText: {
    marginBottom: 16,
  },
  dataPointsContainer: {
    gap: 12,
  },
  dataPointCard: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
  },
  dataPointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dataPointValue: {
    fontWeight: '600',
    color: '#4CD964',
  },
  dataPointDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
});