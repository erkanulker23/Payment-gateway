<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Ödeme Sağlayıcı Ayarları
    |--------------------------------------------------------------------------
    |
    | Bu dosya ödeme entegrasyonu için gerekli yapılandırma ayarlarını içerir.
    | API anahtarları ve diğer hassas bilgileri .env dosyasında saklayın.
    |
    */

    'provider' => env('PAYMENT_PROVIDER', 'iyzico'),

    'test_mode' => env('PAYMENT_TEST_MODE', true),

    'api_key' => env('PAYMENT_API_KEY'),

    'secret_key' => env('PAYMENT_SECRET_KEY'),

    'endpoints' => [
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
    ]
];
