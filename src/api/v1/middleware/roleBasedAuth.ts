import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// import prisma from '../../../../prisma/client/prismaClient';
require("dotenv").config();

interface JwtPayload {
  cms_user_id?: string;
  user_id?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

// Utility function to verify a JWT token
const verifyToken = (token: string, secret: string): JwtPayload => {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (err) {
    throw new Error('Invalid token.');
  }
};

// Middleware to verify JWT token
export const verifyTokenMiddleware = (userType: 'normal' | 'cms') => {
  return (req: any, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
      const secret = process.env.ACCESS_TOKEN_SECRET || "key";
      const decoded = verifyToken(token, secret);

      // Attach user details to the request based on user type
      req.user = userType === 'cms'
        ? { cms_user_id: decoded.cms_user_id || decoded.user_id, role: decoded.role }
        : decoded;

      next();
    } catch (err) {
      res.status(400).json({ message: 'Invalid token.' });
    }
  };
};

// Middleware to check user roles
export const checkUserRole = (roles: string[], userType: 'normal' | 'cms') => {
  return async (req: any, res: Response, next: NextFunction) => {
    const userId = userType === 'cms' ? req.user.cms_user_id : req.user.user_id;

    if (!userId) {
      return res.status(400).json({ message: 'Invalid user.' });
    }

    // Replace the following block with a database query to fetch the user's role
    // const user = userType === 'cms'
    //   ? await prisma.cmsUser.findUnique({ where: { cms_user_id: userId } })
    //   : await prisma.user.findUnique({ where: { user_id: userId } });

    // if (!user || !roles.includes(user.role)) {
    //   return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    // }

    next();
  };
};

// Usage Examples:
// For normal user token verification
export const verifyNormalToken = verifyTokenMiddleware('normal');

// For CMS user token verification
export const verifyCMSToken = verifyTokenMiddleware('cms');

// For normal user role checking
export const checkNormalRole = (roles: string[]) => checkUserRole(roles, 'normal');

// For CMS user role checking
export const checkCMSRole = (roles: string[]) => checkUserRole(roles, 'cms');
