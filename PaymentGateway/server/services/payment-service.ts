import { IStorage } from "../storage";

type CardDetails = {
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  holderName: string;
};

// Test kartları
const TEST_CARDS = {
  iyzico: {
    success: "5528790000000008",
    failure: "4111111111111129"
  },
  paytr: {
    success: "4355084355084358",
    failure: "4355084355084359"
  },
  paynkolay: {
    success: "4159560047417732",
    failure: "4159560047417733"
  },
  paybull: {
    success: "4355084355084358",
    failure: "4355084355084359"
  }
};

export class PaymentService {
  constructor(private storage: IStorage) {}

  async processPayment(data: { cardDetails: CardDetails; amount: number; currency: string }) {
    const providers = await this.storage.getProviders();
    const activeProvider = providers.find(p => p.isActive);

    if (!activeProvider) {
      throw new Error("Aktif ödeme sağlayıcısı bulunamadı");
    }

    // API credentials check
    const config = activeProvider.config as { apiKey: string; secretKey: string; endpoint?: string };
    if (!config.apiKey || !config.secretKey) {
      throw new Error("Geçersiz API bilgileri");
    }

    try {
      // Test kartı doğrulaması
      const testCards = TEST_CARDS[activeProvider.type as keyof typeof TEST_CARDS];
      const isValidTestCard = data.cardDetails.number === testCards.success;

      if (activeProvider.isTestMode && !isValidTestCard) {
        throw new Error(`Geçersiz test kartı. Lütfen bu test kartını kullanın: ${testCards.success}`);
      }

      // Payment processing based on provider type
      switch (activeProvider.type) {
        case "iyzico":
          return await this.processIyzicoPayment(config, data);
        case "paytr":
          return await this.processPayTRPayment(config, data);
        case "paynkolay":
          return await this.processPaynkolayPayment(config, data);
        case "paybull":
          return await this.processPaybullPayment(config, data);
        default:
          throw new Error("Geçersiz ödeme sağlayıcısı");
      }
    } catch (error) {
      throw new Error(`Ödeme başarısız: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  }

  private async processIyzicoPayment(config: any, data: any) {
    // Test kartı kontrolü
    if (data.cardDetails.number === TEST_CARDS.iyzico.success) {
      return {
        status: "success",
        provider: "iyzico",
        transactionId: `TEST_${Math.random().toString(36).substr(2, 9)}`,
        amount: data.amount,
        currency: data.currency
      };
    }
    throw new Error("Ödeme reddedildi");
  }

  private async processPayTRPayment(config: any, data: any) {
    // Test kartı kontrolü
    if (data.cardDetails.number === TEST_CARDS.paytr.success) {
      return {
        status: "success",
        provider: "paytr",
        transactionId: `TEST_${Math.random().toString(36).substr(2, 9)}`,
        amount: data.amount,
        currency: data.currency
      };
    }
    throw new Error("Ödeme reddedildi");
  }

  private async processPaynkolayPayment(config: any, data: any) {
    // Test kartı kontrolü
    if (data.cardDetails.number === TEST_CARDS.paynkolay.success) {
      return {
        status: "success",
        provider: "paynkolay",
        transactionId: `TEST_${Math.random().toString(36).substr(2, 9)}`,
        amount: data.amount,
        currency: data.currency
      };
    }
    throw new Error("Ödeme reddedildi");
  }

  private async processPaybullPayment(config: any, data: any) {
    // Test kartı kontrolü
    if (data.cardDetails.number === TEST_CARDS.paybull.success) {
      return {
        status: "success",
        provider: "paybull",
        transactionId: `TEST_${Math.random().toString(36).substr(2, 9)}`,
        amount: data.amount,
        currency: data.currency
      };
    }
    throw new Error("Ödeme reddedildi");
  }
}