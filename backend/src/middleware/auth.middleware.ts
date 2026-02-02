// middleware/auth.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { verify } from 'jsonwebtoken'

// Custom type definitions
export interface DecodedToken {
  userId: string
  email: string
  iat: number
  exp: number
}

export interface AuthenticatedRequest extends NextApiRequest {
  user?: DecodedToken
}

type NextApiHandler = (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => Promise<void> | void

// JWT secret should be stored in environment variables
const JWT_SECRET = process.env.JWT_SECRET!

export function withAuth(handler: NextApiHandler) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ 
          error: 'Missing or invalid authorization header' 
        })
      }

      // Get token from header
      const token = authHeader.split(' ')[1]
      if (!token) {
        return res.status(401).json({ 
          error: 'No token provided' 
        })
      }

      try {
        // Verify token
        const decoded = verify(token, JWT_SECRET) as DecodedToken
        
        // Attach user to request object
        req.user = decoded

        // Continue to API route handler
        return handler(req, res)

      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          return res.status(401).json({ 
            error: 'Token expired' 
          })
        }
        
        return res.status(401).json({ 
          error: 'Invalid token' 
        })
      }

    } catch (error) {
      console.error('Auth middleware error:', error)
      return res.status(500).json({ 
        error: 'Internal server error' 
      })
    }
  }
}

// Usage example in API route:
/*
import { withAuth, AuthenticatedRequest } from '../middleware/auth'
import { NextApiResponse } from 'next'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Access authenticated user
  const user = req.user
  
  // Your API logic here
}

export default withAuth(handler)
*/