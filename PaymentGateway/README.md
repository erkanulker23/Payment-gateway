# Çoklu Ödeme Entegrasyonu

Modern ve güvenilir ödeme entegrasyon platformu. Farklı ödeme sağlayıcılarını (iyzico, PayTR, Paynkolay, Paybull) tek bir arayüzden yönetmenize ve entegre etmenize olanak sağlar.

## Özellikler

- 🏢 Çoklu ödeme sağlayıcı desteği
- 🔄 Kolay entegrasyon
- 🔒 Güvenli ödeme işlemleri
- 🧪 Test modu desteği
- 📊 Basit yönetim paneli

## Desteklenen Ödeme Sağlayıcıları

- iyzico
- PayTR
- Paynkolay
- Paybull

## Kurulum

1. Projeyi klonlayın:
```bash
git clone https://github.com/yourusername/payment-integration.git
cd payment-integration
```

2. Gerekli paketleri yükleyin:
```bash
npm install
```

3. Uygulamayı başlatın:
```bash
npm run dev
```

## Test Kartları

Her ödeme sağlayıcısı için test kartları:

### iyzico
- Başarılı işlem: 5528790000000008
- Başarısız işlem: 4111111111111129

### PayTR
- Başarılı işlem: 4355084355084358
- Başarısız işlem: 4355084355084359

### Paynkolay
- Başarılı işlem: 4159560047417732
- Başarısız işlem: 4159560047417733

### Paybull
- Başarılı işlem: 4355084355084358
- Başarısız işlem: 4355084355084359

## Laravel Entegrasyonu

Laravel projenize entegre etmek için:

1. Composer ile paketi yükleyin:
```bash
composer require yourusername/payment-integration
```

2. Service Provider'ı kaydedin (`config/app.php`):
```php
'providers' => [
    // ...
    YourNamespace\PaymentIntegration\PaymentServiceProvider::class,
];
```

3. Konfigürasyon dosyasını yayınlayın:
```bash
php artisan vendor:publish --provider="YourNamespace\PaymentIntegration\PaymentServiceProvider"
```

4. `.env` dosyanızda ödeme sağlayıcı bilgilerinizi ayarlayın:
```env
PAYMENT_PROVIDER=iyzico
PAYMENT_TEST_MODE=true
PAYMENT_API_KEY=your-api-key
PAYMENT_SECRET_KEY=your-secret-key
```

5. Ödeme işlemi başlatma örneği:
```php
use YourNamespace\PaymentIntegration\Facades\Payment;

$result = Payment::process([
    'amount' => 100.00,
    'currency' => 'TRY',
    'cardDetails' => [
        'number' => '5528790000000008',
        'expiryMonth' => '12',
        'expiryYear' => '24',
        'cvv' => '123',
        'holderName' => 'John Doe'
    ]
]);
```

## Lisans

MIT License

## Katkıda Bulunma

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: amazing new feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun
