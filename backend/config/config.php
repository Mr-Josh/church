<?php

declare(strict_types=1);

return [
    'app_name' => 'Gospel Break Chain Ministry API',
    'app_env' => getenv('APP_ENV') ?: 'local',
    'app_url' => getenv('APP_URL') ?: 'http://localhost:8000',
    'cors_origin' => getenv('CORS_ORIGIN') ?: 'http://localhost:5173',
];
