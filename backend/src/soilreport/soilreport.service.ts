// services/SoilReportService.ts

import { PrismaClient, SoilReport, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

// Custom error classes
export class NotFoundException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundException';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SoilReportFilters {
  state?: string;
}

export class SoilReportService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findAll(filters?: SoilReportFilters, pagination?: PaginationParams) {
    const { page = 1, limit = 10 } = pagination || {};
    const skip = (page - 1) * limit;

    const where: Prisma.SoilReportWhereInput = {
      ...(filters?.state && { state: filters.state }),
    };

    const [data, total] = await Promise.all([
      this.prisma.soilReport.findMany({
        where,
        skip,
        take: limit,
        include: {
          recommendations: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.soilReport.count({ where }),
    ]);

    return {
      data,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<SoilReport> {
    const soilReport = await this.prisma.soilReport.findUnique({
      where: { id },
      include: {
        recommendations: true,
      },
    });

    if (!soilReport) {
      throw new NotFoundException(`Soil report with ID ${id} not found`);
    }

    return soilReport;
  }

  async create(data: Prisma.SoilReportCreateInput): Promise<SoilReport> {
    // Basic validation
    this.validateSoilData(data);

    return this.prisma.soilReport.create({
      data: {
        ...data,
        id: uuidv4(), // Generate UUID
      },
      include: {
        recommendations: true,
      },
    });
  }

  async update(id: string, data: Prisma.SoilReportUpdateInput): Promise<SoilReport> {
    // Check if exists
    await this.findById(id);

    // Basic validation
    this.validateSoilData(data);

    return this.prisma.soilReport.update({
      where: { id },
      data,
      include: {
        recommendations: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.soilReport.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Soil report with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  private validateSoilData(data: any) {
    // Validate pH if provided
    if (data.pH !== undefined) {
      const pH = Number(data.pH);
      if (isNaN(pH) || pH < 0 || pH > 14) {
        throw new ValidationError('pH must be between 0 and 14');
      }
    }

    // Validate NPK values if provided
    ['nitrogen', 'phosphorus', 'potassium'].forEach(nutrient => {
      if (data[nutrient] !== undefined) {
        const value = Number(data[nutrient]);
        if (isNaN(value) || value < 0) {
          throw new ValidationError(`${nutrient} value must be a positive number`);
        }
      }
    });
  }
}