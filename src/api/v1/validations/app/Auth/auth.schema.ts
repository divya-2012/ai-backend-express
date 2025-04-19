import { z } from 'zod';

export const MobileNumberSchema = z.object({
  mobile_number: z.string().min(10, "Mobile number must be at least 10 digits long").max(15, "Mobile number cannot exceed 15 digits").regex(/^[0-9]+$/, "Mobile number must only contain digits"),
});

export const OtpSchema = z.object({
  otp_id: z.string(),
  otp: z.string().length(6, "OTP must be exactly 6 digits long").regex(/^[0-9]+$/, "OTP must only contain digits"),
});

export const ResendOtpSchema = z.object({
  otp_id: z.string(),
});

export const RegisterInputSchema = z.object({
  parent_id: z.string(),
  name: z.string(),
  age: z.string(),
  email: z.string().email(),
  mobile_number: z.string().min(10).max(10),
  role: z.enum(["CUSTOMER", "ZONAL", "FRANCHISE_PARTNER", "DISTRIBUTOR"])
});

export const RefreshTokenSchema = z.object({
  refresh_token: z.string().min(1,"Refresh token is required"),
});

export const VerifyUserIdSchema = z.object({
  user_id: z.string(),
});