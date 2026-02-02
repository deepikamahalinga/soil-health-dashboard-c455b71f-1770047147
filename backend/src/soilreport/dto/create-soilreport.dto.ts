import { z } from 'zod';

/**
 * DTO Schema for creating a new soil report
 * Validates input data for soil report creation
 */
export const CreateSoilReportSchema = z.object({
  /**
   * Indian state name
   * Must be a non-empty string
   */
  state: z.string()
    .min(1, 'State name cannot be empty')
    .max(100, 'State name is too long')
    .regex(/^[a-zA-Z\s&]+$/, 'State name can only contain letters, spaces and &')
    .transform(val => val.trim())
});

/**
 * TypeScript type for soil report creation payload
 * Generated from Zod schema
 */
export type CreateSoilReportDTO = z.infer<typeof CreateSoilReportSchema>;

/**
 * Validates soil report creation payload
 * @param data Raw input data to validate
 * @returns Validated and transformed CreateSoilReportDTO
 * @throws ZodError if validation fails
 */
export const validateCreateSoilReport = (data: unknown): CreateSoilReportDTO => {
  return CreateSoilReportSchema.parse(data);
};