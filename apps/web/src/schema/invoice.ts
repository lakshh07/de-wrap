import { z } from "zod";

export const invoiceSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  preferredChain: z.number().min(1, { message: "Preferred chain is required" }),
  preferredToken: z.string().min(1, { message: "Preferred token is required" }),
  amount: z.string().min(1, { message: "Amount is required" }),
  details: z.string().min(1, { message: "Details are required" }),
});

export type Invoice = z.infer<typeof invoiceSchema>;
