require("dotenv").config();
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../../config/prismaClient";

// Define user types for request
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

// Middleware function for verifying access token
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Access token is missing" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret-key"
    ) as { id: string; role: string };

    // Set user info in request
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();
  } catch (error) {
    return res
      .status(403)
      .json({ success: false, message: "Invalid token" });
  }
};

// Middleware to check user roles
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: "Insufficient permissions" 
      });
    }

    next();
  };
};

// Admin role middleware
export const requireAdmin = requireRole(["ADMIN"]);

// User role middleware
export const requireUser = requireRole(["USER", "ADMIN"]);
