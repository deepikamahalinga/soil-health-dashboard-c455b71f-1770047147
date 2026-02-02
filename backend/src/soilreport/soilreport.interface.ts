import { Recommendation } from './recommendation'; // Assuming this exists

/**
 * Core soil health data for a specific location
 * @interface SoilReport
 */
export interface SoilReport {
  /**
   * Unique identifier for soil report
   */
  id: string;

  /**
   * Indian state name
   */
  state: string;

  /**
   * pH level of soil (0-14)
   */
  pH: number;

  /**
   * Nitrogen content in ppm
   */
  nitrogen: number;

  /**
   * Phosphorus content in ppm  
   */
  phosphorus: number;

  /**
   * Potassium content in ppm
   */
  potassium: number;

  /**
   * Associated fertilizer recommendations
   */
  recommendations?: Recommendation[];
}

/**
 * Partial type for updating soil report
 */
export type UpdateSoilReportDto = Partial<Omit<SoilReport, 'id' | 'recommendations'>>;

/**
 * Type for creating new soil report
 */
export type CreateSoilReportDto = Omit<SoilReport, 'id' | 'recommendations'>;

/**
 * Type for soil report with populated recommendations
 */
export type SoilReportWithRecommendations = Required<SoilReport>;

/**
 * Type for soil report without recommendations
 */
export type SoilReportBase = Omit<SoilReport, 'recommendations'>;

/**
 * Type for filtering soil reports
 */
export interface SoilReportFilters {
  state?: string;
  fromDate?: Date;
  toDate?: Date;
}