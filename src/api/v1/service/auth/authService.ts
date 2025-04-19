import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "../../../../../prisma/client/prismaClient";

// Type definitions
interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface LoginResponse {
  success: boolean;
  status: number;
  message: string;
  data?: {
    user: {
      id: string;
      name: string | null;
      email: string;
      role: string;
    };
    tokens: AuthTokens;
  };
}

// Function to hash password
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Function to verify password
const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// Function to generate auth tokens
const generateTokens = (userId: string, role: string): AuthTokens => {
  const accessToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || "secret-key",
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET || "refresh-key",
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

// Function to register user
export const registerUser = async (userData: RegisterUserInput): Promise<any> => {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userData.email },
          userData.phone ? { phone: userData.phone } : undefined,
        ].filter(Boolean) as any,
      },
    });

    if (existingUser) {
      return { 
        success: false, 
        status: 400, 
        message: "User already exists with this email or phone" 
      };
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        phone: userData.phone,
      },
    });

    // Generate tokens
    const tokens = generateTokens(newUser.id, newUser.role);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        userId: newUser.id,
      },
    });

    return {
      success: true,
      status: 201,
      message: "User registered successfully",
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        tokens,
      },
    };
  } catch (error) {
    console.error("Registration error:", error);
    throw new Error("Failed to register user");
  }
};

// Function to login user
export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { 
        success: false, 
        status: 404, 
        message: "User not found" 
      };
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return { 
        success: false, 
        status: 401, 
        message: "Invalid credentials" 
      };
    }

    // Generate tokens
    const tokens = generateTokens(user.id, user.role);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        userId: user.id,
      },
    });

    return {
      success: true,
      status: 200,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        tokens,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    throw new Error("Failed to login");
  }
};

// Function to refresh access token
export const refreshAccessToken = async (refreshToken: string): Promise<any> => {
  try {
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || "refresh-key"
    ) as { id: string };

    // Check if token exists in database
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId: decoded.id,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: true,
      },
    });

    if (!storedToken) {
      return {
        success: false,
        status: 401,
        message: "Invalid or expired refresh token",
      };
    }

    // Generate new tokens
    const tokens = generateTokens(storedToken.user.id, storedToken.user.role);

    // Delete old refresh token
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    // Store new refresh token
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        userId: storedToken.user.id,
      },
    });

    return {
      success: true,
      status: 200,
      message: "Token refreshed successfully",
      data: { tokens },
    };
  } catch (error) {
    console.error("Token refresh error:", error);
    return {
      success: false,
      status: 401,
      message: "Invalid refresh token",
    };
  }
};

// Function to request password reset
export const requestPasswordReset = async (email: string): Promise<any> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        status: 404,
        message: "User not found",
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // In a real application, you would send an email with reset link
    const resetLink = `http://yourdomain.com/reset-password?token=${resetToken}`;

    return {
      success: true,
      status: 200,
      message: "Password reset link sent",
      data: {
        resetLink, // This would normally not be returned in production
      },
    };
  } catch (error) {
    console.error("Password reset request error:", error);
    throw new Error("Failed to process password reset request");
  }
};

// Function to reset password
export const resetPassword = async (token: string, newPassword: string): Promise<any> => {
  try {
    // Find user with the token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return {
        success: false,
        status: 400,
        message: "Invalid or expired reset token",
      };
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return {
      success: true,
      status: 200,
      message: "Password reset successfully",
    };
  } catch (error) {
    console.error("Password reset error:", error);
    throw new Error("Failed to reset password");
  }
};

// Function to logout
export const logoutUser = async (refreshToken: string): Promise<any> => {
  try {
    // Delete refresh token from database
    await prisma.refreshToken.deleteMany({
      where: {
        token: refreshToken,
      },
    });

    return {
      success: true,
      status: 200,
      message: "Logged out successfully",
    };
  } catch (error) {
    console.error("Logout error:", error);
    throw new Error("Failed to logout");
  }
}; 