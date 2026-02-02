// src/controllers/soilReportController.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { SoilReportService } from '../services/soilReportService';
import { CreateSoilReportDTO, UpdateSoilReportDTO } from '../dtos/soilReportDTO';
import { PaginationParams } from '../types/common';

export class SoilReportController {
  private soilReportService: SoilReportService;

  constructor() {
    this.soilReportService = new SoilReportService();
  }

  /**
   * Get all soil reports with pagination and filtering
   */
  public async getAllSoilReports(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    try {
      const { page = 1, limit = 10, state } = req.query;
      const paginationParams: PaginationParams = {
        page: Number(page),
        limit: Number(limit),
      };

      const filters = state ? { state: String(state) } : {};
      
      const reports = await this.soilReportService.getAllSoilReports(
        paginationParams,
        filters
      );
      
      res.status(200).json(reports);
    } catch (error) {
      res.status(500).json({ 
        message: 'Error fetching soil reports',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get soil report by ID
   */
  public async getSoilReportById(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    try {
      const { id } = req.query;
      
      if (!id || typeof id !== 'string') {
        res.status(400).json({ message: 'Invalid ID provided' });
        return;
      }

      const report = await this.soilReportService.getSoilReportById(id);
      
      if (!report) {
        res.status(404).json({ message: 'Soil report not found' });
        return;
      }

      res.status(200).json(report);
    } catch (error) {
      res.status(500).json({ 
        message: 'Error fetching soil report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create new soil report
   */
  public async createSoilReport(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    try {
      const soilReportData: CreateSoilReportDTO = req.body;
      
      const newReport = await this.soilReportService.createSoilReport(soilReportData);
      
      res.status(201).json(newReport);
    } catch (error) {
      res.status(500).json({ 
        message: 'Error creating soil report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update existing soil report
   */
  public async updateSoilReport(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    try {
      const { id } = req.query;
      const updateData: UpdateSoilReportDTO = req.body;

      if (!id || typeof id !== 'string') {
        res.status(400).json({ message: 'Invalid ID provided' });
        return;
      }

      const updatedReport = await this.soilReportService.updateSoilReport(
        id,
        updateData
      );

      if (!updatedReport) {
        res.status(404).json({ message: 'Soil report not found' });
        return;
      }

      res.status(200).json(updatedReport);
    } catch (error) {
      res.status(500).json({ 
        message: 'Error updating soil report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete soil report
   */
  public async deleteSoilReport(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    try {
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        res.status(400).json({ message: 'Invalid ID provided' });
        return;
      }

      const deleted = await this.soilReportService.deleteSoilReport(id);

      if (!deleted) {
        res.status(404).json({ message: 'Soil report not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ 
        message: 'Error deleting soil report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

// Export singleton instance
export const soilReportController = new SoilReportController();