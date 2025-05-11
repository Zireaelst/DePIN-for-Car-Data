// OBD Data Loader
// Utility to load and parse OBD data from the synthetic dataset

import * as FileSystem from 'expo-file-system';
import { CarData } from '../types/CarData';

// Path to the OBD data file
const OBD_DATA_FILE = FileSystem.documentDirectory + 'synthetic_obd_data_24h.json';

// Function to convert OBD data format to our CarData format
export const convertOBDDataToCarData = (obdData: any): CarData => {
  return {
    timestamp: obdData.timestamp,
    speed: obdData.speed_kmph * 0.621371, // Convert km/h to mph
    rpm: obdData.engine_rpm,
    fuelLevel: obdData.fuel_level_pct,
    engineTemp: (obdData.engine_temp_c * 9/5) + 32, // Convert Celsius to Fahrenheit
    latitude: obdData.lat,
    longitude: obdData.lon,
    diagnosticCode: obdData.dtc_code || undefined
  };
};

// Load OBD data from the file
export const loadOBDData = async (): Promise<CarData[]> => {
  try {
    // Check if file exists in the document directory
    const fileInfo = await FileSystem.getInfoAsync(OBD_DATA_FILE);
    
    if (!fileInfo.exists) {
      console.log('OBD data file not found in document directory. Using embedded data.');
      
      // We'll use fetch to get the embedded asset
      // This is a workaround since we can't directly import large JSON files in React Native
      try {
        // Fetch the data from an embedded asset or fetch from a remote source if needed
        const response = require('../../assets/synthetic_obd_data_24h.json');
        const obdData = response;
        
        // Save to document directory for future use
        await FileSystem.writeAsStringAsync(
          OBD_DATA_FILE,
          JSON.stringify(obdData)
        );
        
        // Convert and return the data
        return obdData.slice(0, Math.min(1440, obdData.length))
          .map((item: any) => convertOBDDataToCarData(item));
      } catch (error) {
        console.error('Error loading embedded data:', error);
        return [];
      }
    }
    
    // Read from the file
    const fileContent = await FileSystem.readAsStringAsync(OBD_DATA_FILE);
    const obdData = JSON.parse(fileContent);
    
    // Convert OBD format to CarData format
    return obdData.slice(0, Math.min(1440, obdData.length))
      .map((item: any) => convertOBDDataToCarData(item));
    
  } catch (error) {
    console.error('Error loading OBD data:', error);
    return [];
  }
};

// Get a specific segment of OBD data (for recent/historical sections)
export const getOBDDataSegment = async (minutes: number = 60): Promise<CarData[]> => {
  try {
    const allData = await loadOBDData();
    
    // Get the most recent X minutes of data
    return allData.slice(Math.max(0, allData.length - minutes));
  } catch (error) {
    console.error('Error getting OBD data segment:', error);
    return [];
  }
};

// Get the latest OBD data point (most recent)
export const getLatestOBDData = async (): Promise<CarData | null> => {
  try {
    const allData = await loadOBDData();
    
    if (allData.length > 0) {
      return allData[allData.length - 1];
    }
    
    return null;
  } catch (error) {
    console.error('Error getting latest OBD data:', error);
    return null;
  }
};