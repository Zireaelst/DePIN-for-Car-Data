import AsyncStorage from '@react-native-async-storage/async-storage';
import { CarData, CarDataSummary, MarketplaceListingType, UserWalletInfo } from '../types/CarData';
import { getLatestOBDData, getOBDDataSegment } from './obdDataLoader';

// Mock data generation
const generateMockCarData = (minutes = 60): CarData[] => {
  const now = new Date();
  const data: CarData[] = [];
  
  for (let i = 0; i < minutes; i++) {
    const timestamp = new Date(now.getTime() - (minutes - i) * 60000).toISOString();
    const baseSpeed = 35 + Math.random() * 30;
    const baseRpm = 1000 + Math.random() * 1500;
    
    // Add some variation to make the data more realistic
    const speedVariation = Math.sin(i / 10) * 15;
    const rpmVariation = Math.sin(i / 8) * 500;
    
    // Base coordinates for a simulated drive (adjust as needed)
    const baseLat = 37.7749 + (Math.random() - 0.5) * 0.01;
    const baseLong = -122.4194 + (Math.random() - 0.5) * 0.01;
    
    // Random diagnostic code for ~10% of entries
    const hasDiagnostic = Math.random() < 0.1;
    const diagnosticCodes = ['P0420', 'P0171', 'P0301', 'P0456', 'P0442'];
    
    data.push({
      timestamp,
      speed: Math.round(baseSpeed + speedVariation),
      rpm: Math.round(baseRpm + rpmVariation),
      fuelLevel: 75 - i * (15 / minutes), // Gradually decreasing fuel level
      engineTemp: 195 + Math.sin(i / 20) * 8, // Fluctuating engine temp
      latitude: baseLat + (i / minutes) * 0.01,
      longitude: baseLong + (i / minutes) * 0.01,
      ...(hasDiagnostic && { diagnosticCode: diagnosticCodes[Math.floor(Math.random() * diagnosticCodes.length)] })
    });
  }
  
  return data;
};

// Calculate summary statistics from car data
const calculateCarDataSummary = (data: CarData[]): CarDataSummary => {
  if (data.length === 0) {
    return {
      avgSpeed: 0,
      maxSpeed: 0,
      avgRpm: 0,
      maxRpm: 0,
      fuelUsed: 0,
      distanceTraveled: 0,
      timeActive: 0
    };
  }
  
  const speeds = data.map(d => d.speed);
  const rpms = data.map(d => d.rpm);
  const fuelStart = data[0].fuelLevel;
  const fuelEnd = data[data.length - 1].fuelLevel;
  
  // Calculate distance based on average speed and time
  const timeActiveMinutes = data.length; // Assuming each data point is 1 minute apart
  const avgSpeed = speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length;
  const distanceMiles = (avgSpeed * timeActiveMinutes) / 60; // Convert to miles
  
  return {
    avgSpeed: avgSpeed,
    maxSpeed: Math.max(...speeds),
    avgRpm: rpms.reduce((sum, rpm) => sum + rpm, 0) / rpms.length,
    maxRpm: Math.max(...rpms),
    fuelUsed: Math.max(0, fuelStart - fuelEnd), // In percentage
    distanceTraveled: distanceMiles,
    timeActive: timeActiveMinutes
  };
};

// Mock marketplace listings
const mockMarketplaceListings: MarketplaceListingType[] = [
  {
    id: '1',
    title: 'City Driving Patterns',
    description: 'Speed and acceleration data from urban driving',
    price: 5,
    dataType: 'speed',
    duration: 'weekly',
    provider: 'UrbanDriver',
    providerRating: 4.7,
    totalSold: 136,
    shared: false
  },
  {
    id: '2',
    title: 'Highway Commute Routes',
    description: 'GPS tracking data for highway routes',
    price: 3.5,
    dataType: 'location',
    duration: 'daily',
    provider: 'CommutePro',
    providerRating: 4.2,
    totalSold: 89,
    shared: false
  },
  {
    id: '3',
    title: 'Engine Performance Analytics',
    description: 'Comprehensive engine data for performance tuning',
    price: 12,
    dataType: 'full',
    duration: 'monthly',
    provider: 'EngineGeek',
    providerRating: 4.9,
    totalSold: 215,
    shared: false
  },
  {
    id: '4',
    title: 'Electric Vehicle Range Data',
    description: 'Battery performance across different conditions',
    price: 7.5,
    dataType: 'diagnostics',
    duration: 'monthly',
    provider: 'EVInsights',
    providerRating: 4.5,
    totalSold: 172,
    shared: false
  },
  {
    id: '5',
    title: 'Fuel Consumption Patterns',
    description: 'Detailed fuel usage data for economic analysis',
    price: 4.5,
    dataType: 'fuel',
    duration: 'weekly',
    provider: 'EcoDriver',
    providerRating: 4.3,
    totalSold: 107,
    shared: false
  },
  {
    id: '6',
    title: 'Traffic Pattern Analysis',
    description: 'Time-based traffic flow data from daily commutes',
    price: 6.0,
    dataType: 'location',
    duration: 'weekly',
    provider: 'TrafficInsight',
    providerRating: 4.6,
    totalSold: 156,
    shared: false
  },
  {
    id: '7',
    title: 'Diagnostic Alert Data',
    description: 'Vehicle diagnostic code patterns and frequencies',
    price: 8.5,
    dataType: 'diagnostics',
    duration: 'monthly',
    provider: 'DiagnosticPro',
    providerRating: 4.8,
    totalSold: 192,
    shared: false
  },
  {
    id: '8',
    title: 'Weather Impact Analysis',
    description: 'Vehicle performance data during various weather conditions',
    price: 5.5,
    dataType: 'full',
    duration: 'weekly',
    provider: 'WeatherDrive',
    providerRating: 4.4,
    totalSold: 84,
    shared: false
  },
  {
    id: '9',
    title: 'Weekend Driving Patterns',
    description: 'Recreational vs. weekday driving behavior analysis',
    price: 3.0,
    dataType: 'speed',
    duration: 'weekly',
    provider: 'LeisureDrive',
    providerRating: 4.1,
    totalSold: 67,
    shared: false
  },
  {
    id: '10',
    title: 'Car Component Wear Metrics',
    description: 'Long-term data on component performance and degradation',
    price: 9.75,
    dataType: 'diagnostics',
    duration: 'monthly',
    provider: 'PartPredict',
    providerRating: 4.7,
    totalSold: 118,
    shared: false
  }
];

// Mock wallet with some initial data
const mockWalletInfo: UserWalletInfo = {
  address: '0x7a4E8d373C70c106A0E056b7087142B03dAd79D3',
  balance: 25.75,
  earnings: 12.25,
  sharingActive: false
};

// Storage keys
const KEYS = {
  CAR_DATA: 'car_data',
  LISTINGS: 'marketplace_listings',
  USER_WALLET: 'user_wallet',
  SHARED_DATA_TYPES: 'shared_data_types',
  USE_REAL_DATA: 'use_real_data'
};

// Service methods
export const carDataService = {
  // Get current vehicle data (now with real OBD data option)
  getCurrentVehicleData: async (): Promise<CarData> => {
    try {
      const useRealData = await AsyncStorage.getItem(KEYS.USE_REAL_DATA) === 'true';
      
      if (useRealData) {
        // Try to get real OBD data
        const latestData = await getLatestOBDData();
        if (latestData) {
          return latestData;
        }
      }
      
      // Fall back to mock data if real data isn't available or enabled
      return generateMockCarData(1)[0];
    } catch (error) {
      console.error('Error getting current vehicle data:', error);
      return generateMockCarData(1)[0];
    }
  },
  
  // Get historical vehicle data
  getHistoricalData: async (minutes: number = 60): Promise<CarData[]> => {
    try {
      const useRealData = await AsyncStorage.getItem(KEYS.USE_REAL_DATA) === 'true';
      
      if (useRealData) {
        // Try to get real OBD data
        const obdData = await getOBDDataSegment(minutes);
        if (obdData && obdData.length > 0) {
          // Store the real data for later use
          await AsyncStorage.setItem(KEYS.CAR_DATA, JSON.stringify(obdData));
          return obdData;
        }
      }
      
      // If real data isn't available or enabled, try stored data or generate mock
      const storedData = await AsyncStorage.getItem(KEYS.CAR_DATA);
      if (storedData) {
        return JSON.parse(storedData);
      } else {
        const newData = generateMockCarData(minutes);
        await AsyncStorage.setItem(KEYS.CAR_DATA, JSON.stringify(newData));
        return newData;
      }
    } catch (error) {
      console.error('Error retrieving car data:', error);
      return generateMockCarData(minutes);
    }
  },
  
  // Toggle between real and mock data
  toggleDataSource: async (): Promise<boolean> => {
    try {
      const currentSetting = await AsyncStorage.getItem(KEYS.USE_REAL_DATA);
      const newSetting = currentSetting === 'true' ? 'false' : 'true';
      
      await AsyncStorage.setItem(KEYS.USE_REAL_DATA, newSetting);
      
      // Clear cached data to ensure we get fresh data of the selected type
      await AsyncStorage.removeItem(KEYS.CAR_DATA);
      
      return newSetting === 'true';
    } catch (error) {
      console.error('Error toggling data source:', error);
      return false;
    }
  },
  
  // Check if real data is being used
  isUsingRealData: async (): Promise<boolean> => {
    try {
      return await AsyncStorage.getItem(KEYS.USE_REAL_DATA) === 'true';
    } catch (error) {
      console.error('Error checking data source:', error);
      return false;
    }
  },
  
  // Get data summary
  getDataSummary: async (): Promise<CarDataSummary> => {
    const data = await carDataService.getHistoricalData();
    return calculateCarDataSummary(data);
  },
  
  // Get marketplace listings
  getMarketplaceListings: async (): Promise<MarketplaceListingType[]> => {
    try {
      const storedListings = await AsyncStorage.getItem(KEYS.LISTINGS);
      if (storedListings) {
        return JSON.parse(storedListings);
      } else {
        await AsyncStorage.setItem(KEYS.LISTINGS, JSON.stringify(mockMarketplaceListings));
        return mockMarketplaceListings;
      }
    } catch (error) {
      console.error('Error retrieving marketplace listings:', error);
      return mockMarketplaceListings;
    }
  },
  
  // Toggle data sharing for a specific listing
  toggleDataSharing: async (listingId: string): Promise<boolean> => {
    try {
      const listings = await carDataService.getMarketplaceListings();
      const updatedListings = listings.map(listing => 
        listing.id === listingId ? {...listing, shared: !listing.shared} : listing
      );
      
      await AsyncStorage.setItem(KEYS.LISTINGS, JSON.stringify(updatedListings));
      
      // Update wallet sharing status if any data is being shared
      const isAnySharingActive = updatedListings.some(listing => listing.shared);
      const wallet = await carDataService.getUserWallet();
      await carDataService.updateUserWallet({
        ...wallet,
        sharingActive: isAnySharingActive
      });
      
      return true;
    } catch (error) {
      console.error('Error toggling data sharing:', error);
      return false;
    }
  },
  
  // Get user wallet info
  getUserWallet: async (): Promise<UserWalletInfo> => {
    try {
      const storedWallet = await AsyncStorage.getItem(KEYS.USER_WALLET);
      if (storedWallet) {
        return JSON.parse(storedWallet);
      } else {
        await AsyncStorage.setItem(KEYS.USER_WALLET, JSON.stringify(mockWalletInfo));
        return mockWalletInfo;
      }
    } catch (error) {
      console.error('Error retrieving wallet info:', error);
      return mockWalletInfo;
    }
  },
  
  // Update user wallet info
  updateUserWallet: async (walletInfo: UserWalletInfo): Promise<boolean> => {
    try {
      await AsyncStorage.setItem(KEYS.USER_WALLET, JSON.stringify(walletInfo));
      return true;
    } catch (error) {
      console.error('Error updating wallet info:', error);
      return false;
    }
  },
  
  // Simulate earning tokens from shared data
  simulateEarnings: async (): Promise<number> => {
    try {
      const wallet = await carDataService.getUserWallet();
      if (!wallet.sharingActive) return 0;
      
      const listings = await carDataService.getMarketplaceListings();
      const sharedListings = listings.filter(listing => listing.shared);
      
      // Calculate earnings based on shared data types
      let newEarnings = 0;
      sharedListings.forEach(listing => {
        // Simple earning simulation based on data type and price
        const baseRate = listing.price / 30; // Assume monthly price divided by 30 for daily rate
        newEarnings += baseRate * (Math.random() * 0.5 + 0.5); // Random factor between 0.5 and 1
      });
      
      // Update wallet with new earnings
      const updatedWallet = {
        ...wallet,
        earnings: wallet.earnings + newEarnings,
        balance: wallet.balance + newEarnings
      };
      
      await carDataService.updateUserWallet(updatedWallet);
      return newEarnings;
    } catch (error) {
      console.error('Error simulating earnings:', error);
      return 0;
    }
  },
  
  // Reset all stored data (for testing)
  resetAllData: async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([
        KEYS.CAR_DATA,
        KEYS.LISTINGS,
        KEYS.USER_WALLET,
        KEYS.SHARED_DATA_TYPES,
        KEYS.USE_REAL_DATA
      ]);
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  }
};