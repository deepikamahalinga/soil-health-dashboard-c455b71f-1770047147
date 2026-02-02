// types/api.ts
export interface SoilReport {
  id: string;
  location: {
    latitude: number;
    longitude: number;
  };
  pH: number;
  nutrients: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  organicMatter: number;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}