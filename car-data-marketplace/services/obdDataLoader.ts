// OBD Data Loader
// Utility to load and parse OBD data from the synthetic dataset

import * as FileSystem from 'expo-file-system';
import { CarData } from '../types/CarData';

// Path to the OBD data file in the assets folder
// Note: For embedded assets, we'll use require() directly
// const OBD_DATA_FILE = FileSystem.documentDirectory + 'synthetic_obd_data_24h.json'; // Keep for potential future use if writing/caching

// Path for caching the data in the document directory
const CACHED_OBD_DATA_FILE = FileSystem.documentDirectory + 'synthetic_obd_data_cache.json';

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
    // Try to load from cache first
    const cachedFileInfo = await FileSystem.getInfoAsync(CACHED_OBD_DATA_FILE);

    if (cachedFileInfo.exists) {
      console.log('Loading OBD data from cache.');
      const fileContent = await FileSystem.readAsStringAsync(CACHED_OBD_DATA_FILE);
      const obdData = JSON.parse(fileContent);
      return obdData.slice(0, Math.min(1440, obdData.length))
        .map((item: any) => convertOBDDataToCarData(item));
    }

    // If not in cache, load from embedded asset
    console.log('OBD data not in cache. Loading from embedded asset.');
    // Use require to load the JSON data from the assets folder
    const obdDataAsset = require('../assets/synthetic_obd_data_24h.json');
    
    // Save to document directory (cache) for future use
    await FileSystem.writeAsStringAsync(
      CACHED_OBD_DATA_FILE,
      JSON.stringify(obdDataAsset)
    );
    
    // Convert and return the data
    // Ensure obdDataAsset is an array before slicing and mapping
    if (Array.isArray(obdDataAsset)) {
      return obdDataAsset.slice(0, Math.min(1440, obdDataAsset.length))
        .map((item: any) => convertOBDDataToCarData(item));
    } else {
      console.error('Embedded OBD data is not in the expected array format.');
      return [];
    }
    
  } catch (error) {
    console.error('Error loading OBD data:', error);
    // If any error occurs (e.g., require fails, JSON parsing error), return empty array
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