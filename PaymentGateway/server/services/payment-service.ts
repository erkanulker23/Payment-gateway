import { IStorage } from "../storage";

type CardDetails = {
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  holderName: string;
};

type PaymentRequest = {
  cardDetails: CardDetails;
  amount: number;
  currency: string;
  installment: number;
  returnUrl: string;
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

export interface InstallmentOption {
  count: number;
  monthlyAmount: number;
  totalAmount: number;
}

interface BankInstallments {
  bankName: string;
  bankLogo: string;
  installments: InstallmentOption[];
}

export class PaymentService {
  constructor(private storage: IStorage) {}

  async getInstallments(amount: number): Promise<BankInstallments[]> {
    const providers = await this.storage.getProviders();
    const activeProvider = providers.find(p => p.isActive);

    if (!activeProvider) {
      throw new Error("Aktif ödeme sağlayıcısı bulunamadı");
    }

    try {
      switch (activeProvider.type) {
        case "iyzico":
          return await this.getIyzicoInstallments(activeProvider.config, amount);
        case "paytr":
          return await this.getPayTRInstallments(activeProvider.config, amount);
        case "paynkolay":
          return await this.getPaynkolayInstallments(activeProvider.config, amount);
        case "paybull":
          return await this.getPaybullInstallments(activeProvider.config, amount);
        default:
          throw new Error("Geçersiz ödeme sağlayıcısı");
      }
    } catch (error) {
      throw new Error(`Taksit bilgileri alınamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  }

  private async getIyzicoInstallments(config: any, amount: number): Promise<BankInstallments[]> {
    if (config.isTestMode) {
      return [{
        bankName: "Test Bank",
        bankLogo: "https://example.com/test-bank-logo.png",
        installments: [
          { count: 1, monthlyAmount: amount, totalAmount: amount },
          { count: 3, monthlyAmount: amount / 3, totalAmount: amount * 1.05 },
          { count: 6, monthlyAmount: amount / 6, totalAmount: amount * 1.1 }
        ]
      }];
    }
    
    const response = await fetch(`${config.endpoint}/payment/iyzipos/installments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${config.apiKey}:${config.secretKey}`
      },
      body: JSON.stringify({
        locale: 'tr',
        conversationId: Date.now().toString(),
        binNumber: '',
        price: amount.toString()
      })
    });

    if (!response.ok) {
      throw new Error('İyzico API yanıt vermedi');
    }

    const data = await response.json();
    return data.installmentDetails.map((bank: any) => ({
      bankName: bank.bankName,
      bankLogo: bank.bankLogoUrl,
      installments: bank.installmentPrices.map((inst: any) => ({
        count: inst.installmentNumber,
        monthlyAmount: inst.installmentPrice,
        totalAmount: inst.totalPrice
      }))
    }));
  }

  private async getPayTRInstallments(config: any, amount: number): Promise<BankInstallments[]> {
    const response = await fetch(`${config.endpoint}/merchant/installment-rates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        merchant_id: config.merchantId,
        amount: amount,
        currency: 'TRY',
        hash: this.generatePayTRHash(config.merchantId, amount, config.secretKey)
      })
    });

    if (!response.ok) {
      throw new Error('PayTR API yanıt vermedi');
    }

    const data = await response.json();
    return data.banks.map((bank: any) => ({
      bankName: bank.bank_name,
      bankLogo: bank.bank_logo,
      installments: bank.installments.map((inst: any) => ({
        count: inst.count,
        monthlyAmount: inst.monthly_amount,
        totalAmount: inst.total_amount
      }))
    }));
  }

  private generatePayTRHash(merchantId: string, amount: number, secretKey: string): string {
    const data = `${merchantId}${amount}${secretKey}`;
    return require('crypto').createHash('sha256').update(data).digest('hex');
  }

  private async getPaynkolayInstallments(config: any, amount: number): Promise<BankInstallments[]> {
    const response = await fetch(`${config.endpoint}/pos/installments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'x-api-key': config.secretKey
      },
      body: JSON.stringify({
        amount: amount,
        currency: 'TRY',
        merchant_key: config.merchantId
      })
    });

    if (!response.ok) {
      throw new Error('Paynkolay API yanıt vermedi');
    }

    const data = await response.json();
    return data.banks.map((bank: any) => ({
      bankName: bank.name,
      bankLogo: bank.logo_url,
      installments: bank.rates.map((rate: any) => ({
        count: rate.installment,
        monthlyAmount: amount / rate.installment * (1 + rate.rate),
        totalAmount: amount * (1 + rate.rate)
      }))
    }));
  }

  private async getPaybullInstallments(config: any, amount: number): Promise<BankInstallments[]> {
    const response = await fetch(`${config.endpoint}/v1/pos/installments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'X-Merchant-Key': config.merchantId
      },
      body: JSON.stringify({
        amount: amount,
        currency: 'TRY',
        hash: this.generatePaybullHash(config.merchantId, amount, config.secretKey)
      })
    });

    if (!response.ok) {
      throw new Error('Paybull API yanıt vermedi');
    }

    const data = await response.json();
    return data.installmentOptions.map((bank: any) => ({
      bankName: bank.bankName,
      bankLogo: bank.bankLogoUrl,
      installments: bank.options.map((opt: any) => ({
        count: opt.installmentCount,
        monthlyAmount: opt.monthlyAmount,
        totalAmount: opt.totalAmount
      }))
    }));
  }

  private generatePaybullHash(merchantId: string, amount: number, secretKey: string): string {
    const data = `${merchantId}|${amount}|${secretKey}`;
    return require('crypto').createHash('sha256').update(data).digest('hex');
  }

  async processPayment(data: PaymentRequest) {
    const providers = await this.storage.getProviders();
    const activeProvider = providers.find(p => p.isActive);

    if (!activeProvider) {
      throw new Error("Aktif ödeme sağlayıcısı bulunamadı");
    }

    // API credentials check
    const config = activeProvider.config as { apiKey: string; secretKey: string; endpoint?: string; merchantId?: string };
    if (!config.apiKey || !config.secretKey) {
      throw new Error("Geçersiz API bilgileri");
    }

    // Taksit kontrolü
    if (data.installment > activeProvider.maxInstallments) {
      throw new Error(`Maksimum ${activeProvider.maxInstallments} taksit yapılabilir`);
    }

    try {
      // Test kartı doğrulaması
      if (activeProvider.isTestMode) {
        const testCards = TEST_CARDS[activeProvider.type as keyof typeof TEST_CARDS];
        const isValidTestCard = data.cardDetails.number === testCards.success;

        if (!isValidTestCard) {
          throw new Error(`Geçersiz test kartı. Lütfen bu test kartını kullanın: ${testCards.success}`);
        }
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

  private async processIyzicoPayment(config: any, data: PaymentRequest) {
    // iyzico ödeme sayfası başlatma
    const paymentPageUrl = `${config.endpoint}/payment/pay?token=${await this.createIyzicoToken(config, data)}`;
    return {
      status: "redirect",
      redirectUrl: paymentPageUrl,
      provider: "iyzico",
      installment: data.installment
    };
  }

  private async createIyzicoToken(config: any, data: PaymentRequest) {
    // iyzico için ödeme token'ı oluşturma (gerçek implementasyonda API çağrısı yapılacak)
    return `test_token_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async processPayTRPayment(config: any, data: PaymentRequest) {
    // PayTR ödeme sayfası başlatma
    const paymentPageUrl = `${config.endpoint}/payment?merchant=${config.merchantId}&amount=${data.amount}&installment=${data.installment}`;
    return {
      status: "redirect",
      redirectUrl: paymentPageUrl,
      provider: "paytr",
      installment: data.installment
    };
  }

  private async processPaynkolayPayment(config: any, data: PaymentRequest) {
    // Paynkolay ödeme sayfası başlatma
    const paymentPageUrl = `${config.endpoint}/redirect?key=${config.apiKey}&amount=${data.amount}&taksit=${data.installment}`;
    return {
      status: "redirect",
      redirectUrl: paymentPageUrl,
      provider: "paynkolay",
      installment: data.installment
    };
  }

  private async processPaybullPayment(config: any, data: PaymentRequest) {
    // Paybull ödeme sayfası başlatma
    const paymentPageUrl = `${config.endpoint}/payment/start?merchant=${config.merchantId}&amount=${data.amount}&installment=${data.installment}`;
    return {
      status: "redirect",
      redirectUrl: paymentPageUrl,
      provider: "paybull",
      installment: data.installment
    };
  }
}