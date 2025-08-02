import { z } from "zod";

export const invoiceSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  preferredChain: z.number().min(1, { message: "Preferred chain is required" }),
  preferredToken: z.string().min(1, { message: "Preferred token is required" }),
  amount: z.string().min(1, { message: "Amount is required" }),
  amountInCents: z.string().min(1, { message: "Amount in cents is required" }),
  details: z.string().min(1, { message: "Details are required" }),
  status: z
    .enum(["PENDING", "ONGOING", "COMPLETED", "CANCELLED", "FAILED"])
    .optional(),
});

export type Invoice = z.infer<typeof invoiceSchema>;

export const payoutSchema = z.object({
  invoiceStatus: z.enum([
    "PENDING",
    "ONGOING",
    "COMPLETED",
    "CANCELLED",
    "FAILED",
  ]),
  payoutStatus: z.enum([
    "PENDING",
    "ONGOING",
    "COMPLETED",
    "CANCELLED",
    "FAILED",
  ]),
  amountPaid: z.string().min(1, { message: "Amount paid is required" }),
  amountPaidInCents: z
    .string()
    .min(1, { message: "Amount paid in cents is required" }),
  sourceToken: z.string().min(1, { message: "Source token is required" }),
  tokenPrice: z.string().min(1, { message: "Token price is required" }),
  sourceChain: z.number().min(1, { message: "Source chain is required" }),
  txHash: z.string().optional(),
});

export type Payout = z.infer<typeof payoutSchema>;
