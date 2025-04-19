
import { z } from "zod";


export const VendorRegisterSchema = z.object({
  business_name: z.string().min(1, 'Business name is required'),
  legal_name: z.string().min(1, 'Legal name is required'),
  gstin: z.string().optional(), // Optional but should be valid if present
  pan: z.string().optional(),
  commission_rate: z.number().default(0), // optional, defaulted to 0
  onboarding_completed: z.boolean().default(false), // optional
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone must be 10 digits').max(10, 'Phone must be 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['VENDOR_ADMIN', 'PRODUCT_ADMIN']).default('VENDOR_ADMIN'),
});

export const VerifyOtpSchema = z.object({
  otp_id: z.string(),
  otp: z.string().length(6, "OTP must be exactly 6 digits long").regex(/^[0-9]+$/, "OTP must only contain digits"),
});

export const ResetPasswordSchema = z.object({
  token: z.string(),
  new_password: z.string().min(6)
});

export const ChangePasswordSchema = z.object({
  current_password: z.string().min(6),
  new_password: z.string().min(6)
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const RefreshTokenSchema = z.object({
  refresh_token: z.string().min(1, "Refresh token is required"),
});

export const AuthenticatedUserSchema = z.object({
  vendor_id: z.string().min(1, "vendor_id is required"),
  role: z.string().optional(),
  cms_user_id: z.string().optional(),
});
export const EmailPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});