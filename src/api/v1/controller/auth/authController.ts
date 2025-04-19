import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AuthService } from "../../service";

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

const resetRequestSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6),
});

// Helper function to handle responses
const sendResponse = (
  res: Response, 
  status: number, 
  success: boolean, 
  message: string, 
  data?: any
) => {
  return res.status(status).json({
    success,
    message,
    data,
  });
};

// Controller functions
export const register = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const userData = registerSchema.parse(req.body);
    const result = await AuthService.registerUser(userData);
    return sendResponse(
      res, 
      result.status, 
      result.success, 
      result.message, 
      result.data
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendResponse(res, 400, false, "Validation error", {
        errors: error.errors,
      });
    }
    next(error);
  }
};

export const login = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await AuthService.loginUser(email, password);
    return sendResponse(
      res, 
      result.status, 
      result.success, 
      result.message, 
      result.data
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendResponse(res, 400, false, "Validation error", {
        errors: error.errors,
      });
    }
    next(error);
  }
};

export const refreshToken = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    const result = await AuthService.refreshAccessToken(refreshToken);
    return sendResponse(
      res, 
      result.status, 
      result.success, 
      result.message, 
      result.data
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendResponse(res, 400, false, "Validation error", {
        errors: error.errors,
      });
    }
    next(error);
  }
};

export const requestReset = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { email } = resetRequestSchema.parse(req.body);
    const result = await AuthService.requestPasswordReset(email);
    return sendResponse(
      res, 
      result.status, 
      result.success, 
      result.message, 
      result.data
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendResponse(res, 400, false, "Validation error", {
        errors: error.errors,
      });
    }
    next(error);
  }
};

export const resetPassword = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);
    const result = await AuthService.resetPassword(token, newPassword);
    return sendResponse(
      res, 
      result.status, 
      result.success, 
      result.message, 
      result.data
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendResponse(res, 400, false, "Validation error", {
        errors: error.errors,
      });
    }
    next(error);
  }
};

export const logout = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    const result = await AuthService.logoutUser(refreshToken);
    return sendResponse(
      res, 
      result.status, 
      result.success, 
      result.message
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendResponse(res, 400, false, "Validation error", {
        errors: error.errors,
      });
    }
    next(error);
  }
};

// Get current user profile
export const me = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return sendResponse(res, 401, false, "Unauthorized");
    }
    
    return sendResponse(res, 200, true, "User profile", {
      id: req.user.id,
      role: req.user.role
    });
  } catch (error) {
    next(error);
  }
}; 