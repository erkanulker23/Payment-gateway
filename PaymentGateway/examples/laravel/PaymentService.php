<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Exception;

class PaymentService
{
    private $apiKey;
    private $secretKey;
    private $endpoint;
    private $isTestMode;

    public function __construct()
    {
        $this->apiKey = config('payment.api_key');
        $this->secretKey = config('payment.secret_key');
        $this->isTestMode = config('payment.test_mode', true);
        $this->endpoint = $this->getEndpoint();
    }

    public function processPayment(array $paymentData)
    {
        try {
            // API isteği için gerekli parametreleri hazırla
            $params = [
                'amount' => $paymentData['amount'],
                'currency' => $paymentData['currency'] ?? 'TRY',
                'cardDetails' => [
                    'number' => $paymentData['card_number'],
                    'expiryMonth' => $paymentData['expiry_month'],
                    'expiryYear' => $paymentData['expiry_year'],
                    'cvv' => $paymentData['cvv'],
                    'holderName' => $paymentData['card_holder_name']
                ]
            ];

            // Ödeme API'sine istek gönder
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'X-Secret-Key' => $this->secretKey,
            ])->post($this->endpoint . '/api/payment/process', $params);

            if ($response->successful()) {
                return $response->json();
            }

            throw new Exception($response->json()['message'] ?? 'Ödeme işlemi başarısız');
        } catch (Exception $e) {
            throw new Exception('Ödeme işlemi sırasında bir hata oluştu: ' . $e->getMessage());
        }
    }

    private function getEndpoint()
    {
        $provider = config('payment.provider', 'iyzico');
        $endpoints = [
            'iyzico' => [
                'test' => 'https://sandbox-api.iyzipay.com',
                'prod' => 'https://api.iyzipay.com'
            ],
            'paytr' => [
                'test' => 'https://test-api.paytr.com',
                'prod' => 'https://api.paytr.com'
            ],
            'paynkolay' => [
                'test' => 'https://test.paynkolay.com/api',
                'prod' => 'https://api.paynkolay.com'
            ],
            'paybull' => [
                'test' => 'https://test-api.paybull.com',
                'prod' => 'https://api.paybull.com'
            ]
        ];

        return $this->isTestMode 
            ? $endpoints[$provider]['test'] 
            : $endpoints[$provider]['prod'];
    }
}
