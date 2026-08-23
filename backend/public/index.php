<?php

declare(strict_types=1);

$config = require __DIR__ . '/../config/config.php';
$db = require __DIR__ . '/../config/database.php';
require __DIR__ . '/../src/response.php';
require __DIR__ . '/../src/auth.php';
require __DIR__ . '/../src/router.php';
require __DIR__ . '/../src/admin.php';
require __DIR__ . '/../src/admin_crud.php';
require __DIR__ . '/../src/dev.php';

$origin = $_SERVER['HTTP_ORIGIN'] ?? ($config['cors_origin'] ?? 'http://localhost:5174');
header('Access-Control-Allow-Origin: ' . $origin);
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($path === '/api/health' && $method === 'GET') jsonResponse(['status' => 'ok', 'service' => 'church-api']);

if ($path === '/api/auth/login' && $method === 'POST') {
    $data = requestBody();
    if (empty($data['email']) || empty($data['password'])) jsonResponse(['message' => 'Email and password are required.'], 422);
    $stmt = $db->prepare('SELECT id, name, email, password, role, is_active FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$data['email']]); $user = $stmt->fetch();
    if (!$user || !(bool) $user['is_active'] || !password_verify($data['password'], $user['password'])) jsonResponse(['message' => 'Invalid credentials.'], 401);
    if (!in_array($user['role'], ['admin', 'developer'], true)) jsonResponse(['message' => 'This account is not authorized for administration.'], 403);
    startSession(); session_regenerate_id(true); $_SESSION['user_id'] = (int) $user['id'];
    unset($user['password'], $user['is_active']);
    jsonResponse(['user' => $user, 'redirect' => $user['role'] === 'developer' ? '/dev' : '/admin']);
}

if ($path === '/api/auth/logout' && $method === 'POST') { startSession(); $_SESSION = []; session_destroy(); jsonResponse(['message' => 'Logged out.']); }

if ($path === '/api/dev/summary' && $method === 'GET') devOverview($db);
if ($path === '/api/dev/database' && $method === 'GET') devDatabase($db);
if ($path === '/api/dev/security' && $method === 'GET') devSecurity($db);
if ($path === '/api/dev/audit' && $method === 'GET') devAudit($db);
if ($path === '/api/dev/system' && $method === 'GET') devSystem($db);
if ($path === '/api/dev/session' && $method === 'GET') devSession($db);
if ($path === '/api/dev/diagnostics' && $method === 'GET') devDiagnostics($db);

if ($path === '/api/admin/dashboard' && $method === 'GET') { requireAdmin($db); adminDashboard($db); }

// Church profile is administered as one resource. Keep this route before the
// generic CRUD router so the public profile and the admin form share the same
// complete field contract, including pastoral information.
if ($path === '/api/admin/church-settings') {
    requireAdmin($db);
    if ($method === 'GET') {
        $stmt = $db->query('SELECT * FROM church_settings WHERE id = 1 LIMIT 1');
        jsonResponse(['data' => $stmt->fetch()]);
    }
    if ($method === 'PATCH') {
        $data = requestBody();
        $allowed = ['church_name','slogan','mission','vision','address','phone','whatsapp','email','pastor_name','pastor_title','pastor_bio','pastor_photo'];
        $sets = [];
        $values = [];
        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $sets[] = "{$field} = ?";
                $values[] = $data[$field];
            }
        }
        if (!$sets) jsonResponse(['message' => 'No fields to update.'], 422);
        $values[] = 1;
        $stmt = $db->prepare('UPDATE church_settings SET ' . implode(', ', $sets) . ' WHERE id = ?');
        $stmt->execute($values);
        jsonResponse(['message' => 'Church settings updated.']);
    }
    jsonResponse(['message' => 'Method not allowed.'], 405);
}

if (strpos($path, '/api/admin/') === 0) adminCrudRoute($db, $path, $method);

publicRoute($db, $path, $method);

if ($path === '/api/prayer-requests' && $method === 'POST') {
    $data = requestBody();
    if (empty($data['phone']) || empty($data['subject']) || empty($data['message'])) jsonResponse(['message' => 'Phone, subject and message are required.'], 422);
    $stmt = $db->prepare('INSERT INTO prayer_requests (name, phone, email, subject, message, is_confidential, is_urgent) VALUES (?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([$data['name'] ?? null, $data['phone'], $data['email'] ?? null, $data['subject'], $data['message'], !empty($data['is_confidential']), !empty($data['is_urgent'])]);
    jsonResponse(['message' => 'Prayer request received.'], 201);
}
if ($path === '/api/help-requests' && $method === 'POST') {
    $data = requestBody();
    if (empty($data['phone']) || empty($data['message'])) jsonResponse(['message' => 'Phone and message are required.'], 422);
    $stmt = $db->prepare('INSERT INTO help_requests (name, phone, message) VALUES (?, ?, ?)');
    $stmt->execute([$data['name'] ?? null, $data['phone'], $data['message']]); jsonResponse(['message' => 'Help request received.'], 201);
}
if ($path === '/api/testimonials' && $method === 'POST') {
    $data = requestBody();
    if (empty($data['name']) || empty($data['content'])) jsonResponse(['message' => 'Name and content are required.'], 422);
    $stmt = $db->prepare('INSERT INTO testimonials (name, content, photo) VALUES (?, ?, ?)');
    $stmt->execute([$data['name'], $data['content'], $data['photo'] ?? null]); jsonResponse(['message' => 'Testimonial submitted for review.'], 201);
}

if ($path === '/api/donations' && $method === 'POST') {
    $data = requestBody();
    if (empty($data['phone']) || empty($data['amount']) || empty($data['type']) || empty($data['payment_method'])) {
        jsonResponse(['message' => 'Téléphone, montant, type et moyen de paiement sont requis.'], 422);
    }
    $reference = 'DON-' . strtoupper(bin2hex(random_bytes(6)));
    $stmt = $db->prepare('INSERT INTO donations (reference, name, phone, amount, type, payment_method, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $reference,
        !empty($data['name']) ? $data['name'] : null,
        $data['phone'],
        $data['amount'],
        $data['type'],
        $data['payment_method'],
        'pending'
    ]);
    jsonResponse([
        'message' => 'Donation initiated.',
        'data' => [
            'id' => (int)$db->lastInsertId(),
            'reference' => $reference,
            'status' => 'pending'
        ]
    ], 201);
}

if (preg_match('#^/api/donations/confirm/(\d+)$#', $path, $match) && $method === 'POST') {
    $id = (int)$match[1];
    $data = requestBody();
    $transactionId = !empty($data['transaction_id']) ? $data['transaction_id'] : 'TXN-' . strtoupper(bin2hex(random_bytes(8)));
    $status = !empty($data['status']) ? $data['status'] : 'success';
    
    $stmt = $db->prepare('UPDATE donations SET status = ?, transaction_id = ? WHERE id = ?');
    $stmt->execute([$status, $transactionId, $id]);
    jsonResponse([
        'message' => 'Donation status updated.',
        'status' => $status,
        'transaction_id' => $transactionId
    ]);
}

if ($path === '/api/donations/initiate' && $method === 'POST') {
    $pay = require __DIR__ . '/../config/payment.php';
    $data = requestBody();

    // Validate required fields
    if (empty($data['phone']) || empty($data['amount'])) {
        jsonResponse(['message' => 'Le numéro de téléphone et le montant sont requis.'], 422);
    }
    $amount  = (float) $data['amount'];
    $phone   = (string) $data['phone'];
    $name    = !empty($data['name']) ? (string) $data['name'] : 'Donateur anonyme';

    if ($amount <= 0) {
        jsonResponse(['message' => 'Le montant doit être supérieur à 0.'], 422);
    }

    // 1. Record the pending donation in our database first
    $reference = 'DON-' . strtoupper(bin2hex(random_bytes(6)));
    $stmt = $db->prepare(
        'INSERT INTO donations (reference, name, phone, amount, type, payment_method, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $reference,
        $name,
        $phone,
        $amount,
        'Don',
        'Genius Pay',
        'pending'
    ]);
    $donationId = (int) $db->lastInsertId();

    // 2. Call Genius Pay API to create a checkout session
    $appUrl     = $config['app_url'] ?? 'http://localhost:8000';
    $frontUrl   = getenv('FRONTEND_URL') ?: 'http://localhost:5174';
    $payload    = json_encode([
        'amount'        => (int) round($amount),
        'currency'      => $pay['currency'],
        'description'   => 'Donation – ' . $name,
        'customer_name' => $name,
        'customer_phone'=> $phone,
        'reference'     => $reference,
        'success_url'   => $frontUrl . '/donate?status=success&ref=' . urlencode($reference),
        'error_url'     => $frontUrl . '/donate?status=cancelled',
        'webhook_url'   => $appUrl  . '/api/donations/webhook',
    ]);

    $endpoint = $pay['base_url'];

    $ch = curl_init($endpoint);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'Accept: application/json',
            'Authorization: Bearer ' . $pay['api_key'],
        ],
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => 0,
    ]);
    $raw      = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr  = curl_error($ch);
    curl_close($ch);

    $result = $raw !== false ? json_decode($raw, true) : null;
    $checkoutUrl = $result['data']['checkout_url']
      ?? $result['data']['payment_url'] 
      ?? $result['data']['redirect_url'] 
      ?? $result['data']['url'] 
      ?? $result['checkout_url']
      ?? $result['payment_url'] 
      ?? $result['redirect_url'] 
      ?? $result['url'] 
      ?? null;

    // Local simulation fallback if using placeholder keys (pk_sandbox_xxxxxxxx)
    if (str_contains($pay['api_key'], 'xxxxxxxx')) {
        $stmt = $db->prepare('UPDATE donations SET status = ?, transaction_id = ? WHERE id = ?');
        $stmt->execute(['success', 'TXN-GENIUS-SIM-' . strtoupper(bin2hex(random_bytes(4))), $donationId]);

        jsonResponse([
            'donation_id'   => $donationId,
            'reference'     => $reference,
            'checkout_url'  => $frontUrl . '/donate?status=success&ref=' . urlencode($reference),
            'is_simulation' => true,
        ], 201);
    }

    if ($curlErr) {
        jsonResponse(['message' => 'Erreur de connexion cURL : ' . $curlErr], 502);
    }

    if (!$checkoutUrl || $httpCode >= 400) {
        $msg = $result['message'] ?? $result['error'] ?? $result['detail'] ?? (is_string($raw) ? $raw : null) ?? 'Erreur API Genius Pay (Code ' . $httpCode . ')';
        if (is_array($msg)) $msg = json_encode($msg);
        jsonResponse(['message' => 'Genius Pay : ' . $msg], 502);
    }

    // Save the Genius Pay transaction reference if provided
    if (!empty($result['transaction_id'])) {
        $stmt = $db->prepare('UPDATE donations SET transaction_id = ? WHERE id = ?');
        $stmt->execute([$result['transaction_id'], $donationId]);
    }

    jsonResponse([
        'donation_id'   => $donationId,
        'reference'     => $reference,
        'checkout_url'  => $checkoutUrl,
    ], 201);
}

if ($path === '/api/donations/webhook' && $method === 'POST') {
    $data = requestBody();
    
    // Extract transaction details sent back by Genius Pay
    $ref       = $data['reference'] ?? $data['external_reference'] ?? $data['data']['reference'] ?? null;
    $status    = $data['status'] ?? $data['data']['status'] ?? 'success';
    $txnId     = $data['transaction_id'] ?? $data['id'] ?? $data['data']['id'] ?? null;
    $payMethod = $data['gateway'] ?? $data['payment_method'] ?? $data['data']['gateway'] ?? 'Genius Pay';

    if ($ref) {
        $isSuccess = in_array(strtolower((string)$status), ['success', 'completed', 'paid', 'successful'], true);
        $dbStatus  = $isSuccess ? 'success' : 'failed';

        $stmt = $db->prepare('UPDATE donations SET status = ?, transaction_id = ?, payment_method = ? WHERE reference = ?');
        $stmt->execute([$dbStatus, $txnId, $payMethod, $ref]);
    }

    jsonResponse(['status' => 'ok', 'message' => 'Webhook reçu avec succès.']);
}

if ($path === '/api/donations/status' && $method === 'GET') {
    $ref = $_GET['ref'] ?? null;
    if (!$ref) jsonResponse(['message' => 'Référence requise.'], 422);

    $stmt = $db->prepare('SELECT reference, name, phone, amount, payment_method, status, created_at FROM donations WHERE reference = ? LIMIT 1');
    $stmt->execute([$ref]);
    $donation = $stmt->fetch();
    if (!$donation) jsonResponse(['message' => 'Don introuvable.'], 404);

    jsonResponse(['data' => $donation]);
}

jsonResponse(['message' => 'Route not found.'], 404);


