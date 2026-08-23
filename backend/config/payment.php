<?php

declare(strict_types=1);

/**
 * Genius Pay payment gateway configuration.
 * These credentials must NEVER be exposed to the frontend or committed in plain text.
 * In production, load these from environment variables.
 */
return [
    'base_url'   => getenv('GENIUS_PAY_BASE_URL') ?: 'https://geniuspay.ci/api/v1/merchant/payments',
    'api_key'    => getenv('GENIUS_PAY_API_KEY')  ?: 'sk_sandbox_ypzL78AdXWN84BGisvCnRAOhM5TpVUff',
    'secret_key' => getenv('GENIUS_PAY_SECRET')   ?: 'ss_sandbox_XFejDutqLESacuni78QtiWIgEtoCfcrgWzcTlZCeGH4NCRKE',
    'currency'   => 'XOF',
];
