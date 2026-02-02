// types/api.ts
export interface SoilReport {
  id: string;
  state: string;
  // Add other fields as per schema
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}