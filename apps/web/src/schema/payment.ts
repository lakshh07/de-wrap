import { z } from "zod";

export const paymentSchema = z.object({
  id: z.string().min(1, { message: "ID is required" }),
  status: z.enum(["PENDING", "ONGOING", "COMPLETED", "CANCELLED", "FAILED"]),
  amountPaid: z
    .number()
    .min(1, { message: "Amount paid is required" })
    .optional(),
  sourceToken: z
    .string()
    .min(1, { message: "Source token is required" })
    .optional(),
  tokenPrice: z
    .number()
    .min(1, { message: "Token price is required" })
    .optional(),
  sourceChain: z
    .number()
    .min(1, { message: "Source chain is required" })
    .optional(),
  txHash: z
    .string()
    .min(1, { message: "Transaction hash is required" })
    .optional(),
  txError: z
    .string()
    .min(1, { message: "Transaction error is required" })
    .optional(),
  details: z.string().min(1, { message: "Details are required" }).optional(),
});

export type Payment = z.infer<typeof paymentSchema>;
