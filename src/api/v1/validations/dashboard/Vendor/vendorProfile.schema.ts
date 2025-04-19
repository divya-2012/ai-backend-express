import { z } from "zod";

export const UpdateVendorProfileSchema = z.object({
  gstin: z.string().optional().nullable(),
  pan: z.string().optional().nullable(),
  commission_rate: z.number().min(0, "Commission must be non-negative").optional(),
  phone: z.string().min(10).max(15, "Phone number must be between 10 and 15 digits"),
});

export const UploadVendorDocumentsSchema = z.object({
  documents: z.array(
    z.object({
      name: z.string().min(1, "Document name is required"),
      url: z.string().url("Valid URL is required"),
    })
  )
});