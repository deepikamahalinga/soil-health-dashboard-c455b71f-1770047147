import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

type ValidationConfig = {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
};

type ValidationError = {
  type: 'body' | 'query' | 'params';
  errors: z.ZodError;
};

type NextApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void> | void;

export const validateRequest = (schema: ValidationConfig) => {
  return (handler: NextApiHandler) =>
    async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        // Validate request body if schema provided
        if (schema.body) {
          const parsed = await schema.body.parseAsync(req.body);
          req.body = parsed;
        }

        // Validate query parameters if schema provided
        if (schema.query) {
          const parsed = await schema.query.parseAsync(req.query);
          req.query = parsed;
        }

        // Validate route parameters if schema provided
        if (schema.params) {
          const parsed = await schema.params.parseAsync(req.query);
          req.query = parsed;
        }

        // If all validations pass, continue to handler
        return handler(req, res);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: error.errors.map((e) => ({
              path: e.path.join('.'),
              message: e.message,
            })),
          });
        }

        // Pass other errors to error handler
        throw error;
      }
    };
};

// Usage example:
const userSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
  query: z.object({
    id: z.string().optional(),
  }),
});

// Example API route
export default validateRequest(userSchema)(async (req, res) => {
  // Your handler code here
  // Types are now properly inferred
  const { email, password } = req.body;
  const { id } = req.query;
  
  res.status(200).json({ success: true });
});