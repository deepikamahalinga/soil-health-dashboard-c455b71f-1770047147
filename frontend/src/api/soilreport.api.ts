// soilreport.api.ts

import axios, { AxiosError, AxiosInstance } from 'axios';

// Types
export interface SoilReport {
  id: string;
  state: string;
  // Add other fields as needed
}

export interface SoilReportFilters {
  state?: string;
  // Add other filter fields
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
}

// API Client Class
export class SoilReportApi {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    this.client = axios.create({
      baseURL: `${this.baseUrl}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response Interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response) {
          throw {
            message: error.response.data.message || 'An error occurred',
            code: error.response.status,
          };
        }
        throw {
          message: 'Network error',
          code: 'NETWORK_ERROR',
        };
      }
    );
  }

  // Get all soil reports with optional filters, pagination and sorting
  async getAllSoilReports(
    filters?: SoilReportFilters,
    pagination?: PaginationParams,
    sort?: SortParams
  ): Promise<ApiResponse<SoilReport[]>> {
    try {
      const params = {
        ...filters,
        ...pagination,
        ...sort,
      };
      
      const response = await this.client.get('/soilreports', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get soil report by ID
  async getSoilReportById(id: string): Promise<ApiResponse<SoilReport>> {
    try {
      const response = await this.client.get(`/soilreports/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create new soil report
  async createSoilReport(data: Omit<SoilReport, 'id'>): Promise<ApiResponse<SoilReport>> {
    try {
      const response = await this.client.post('/soilreports', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update soil report
  async updateSoilReport(
    id: string,
    data: Partial<SoilReport>
  ): Promise<ApiResponse<SoilReport>> {
    try {
      const response = await this.client.put(`/soilreports/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete soil report
  async deleteSoilReport(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.client.delete(`/soilreports/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handler
  private handleError(error: any): ApiError {
    if (axios.isAxiosError(error)) {
      return {
        message: error.response?.data?.message || 'An error occurred',
        code: error.response?.status?.toString(),
      };
    }
    return {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    };
  }
}

// Create and export singleton instance
export const soilReportApi = new SoilReportApi();

// Export default for flexibility
export default soilReportApi;