import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProviderSchema } from "@shared/schema";
import { PaymentService } from "./services/payment-service";

export function registerRoutes(app: Express): Server {
  const paymentService = new PaymentService(storage);

  app.get("/api/providers", async (_req, res) => {
    const providers = await storage.getProviders();
    res.json(providers);
  });

  app.post("/api/providers", async (req, res) => {
    const result = insertProviderSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }
    const provider = await storage.createProvider(result.data);
    res.json(provider);
  });

  app.patch("/api/providers/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const result = insertProviderSchema.partial().safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }
    const provider = await storage.updateProvider(id, result.data);
    res.json(provider);
  });

  app.delete("/api/providers/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteProvider(id);
    res.status(204).end();
  });

  app.get("/api/payment/installments", async (req, res) => {
  try {
    const amount = parseFloat(req.query.amount as string);
    if (isNaN(amount)) {
      res.status(400).json({ error: "Geçersiz tutar" });
      return;
    }
    const installments = await paymentService.getInstallments(amount);
    res.json(installments);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.post("/api/payment/process", async (req, res) => {
    try {
      const result = await paymentService.processPayment(req.body);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
