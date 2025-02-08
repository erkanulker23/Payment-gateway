import { pgTable, text, serial, boolean, json, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const paymentProviders = pgTable("payment_providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type", { enum: ["iyzico", "paytr", "paynkolay", "paybull"] }).notNull(),
  isActive: boolean("is_active").notNull().default(false),
  isTestMode: boolean("is_test_mode").notNull().default(true),
  config: json("config").notNull(),
  maxInstallments: integer("max_installments").notNull().default(1),
});

export const insertProviderSchema = createInsertSchema(paymentProviders).extend({
  config: z.object({
    apiKey: z.string().min(1),
    secretKey: z.string().min(1),
    merchantId: z.string().optional(),
    endpoint: z.string().optional(),
  }),
});

export type InsertProvider = z.infer<typeof insertProviderSchema>;
export type Provider = typeof paymentProviders.$inferSelect;

export const providerTypes = ["iyzico", "paytr", "paynkolay", "paybull"] as const;

// API endpoint'leri
export const API_ENDPOINTS = {
  iyzico: {
    test: "https://sandbox-api.iyzipay.com",
    production: "https://api.iyzipay.com"
  },
  paytr: {
    test: "https://test-api.paytr.com",
    production: "https://api.paytr.com"
  },
  paynkolay: {
    test: "https://test.paynkolay.com/api",
    production: "https://api.paynkolay.com"
  },
  paybull: {
    test: "https://test-api.paybull.com",
    production: "https://api.paybull.com"
  }
} as const;

// Taksit seçenekleri için yeni schema
export const paymentFormSchema = z.object({
  cardNumber: z.string().min(16, "Kart numarası 16 haneli olmalıdır").max(16),
  expiryMonth: z.string().min(2, "Ay 2 haneli olmalıdır").max(2),
  expiryYear: z.string().min(2, "Yıl 2 haneli olmalıdır").max(2),
  cvv: z.string().min(3, "CVV 3 haneli olmalıdır").max(3),
  cardHolderName: z.string().min(1, "Kart sahibinin adını giriniz"),
  installment: z.number().min(1, "Geçersiz taksit sayısı").default(1)
});

export type PaymentFormData = z.infer<typeof paymentFormSchema>;