export interface CarData {
  timestamp: string;
  speed: number;
  rpm: number;
  fuelLevel: number;
  engineTemp: number;
  latitude: number;
  longitude: number;
  diagnosticCode?: string;
}

export interface CarDataSummary {
  avgSpeed: number;
  maxSpeed: number;
  avgRpm: number;
  maxRpm: number;
  fuelUsed: number;
  distanceTraveled: number;
  timeActive: number;
}

export interface MarketplaceListingType {
  id: string;
  title: string;
  description: string;
  price: number;
  dataType: 'speed' | 'location' | 'diagnostics' | 'full';
  duration: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'once';
  provider: string;
  providerRating: number;
  totalSold: number;
  shared: boolean;
}

export interface UserWalletInfo {
  address: string;
  balance: number;
  earnings: number;
  sharingActive: boolean;
}