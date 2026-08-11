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

$corsOrigin = $config['cors_origin'] ?? null;
if (!$corsOrigin) $corsOrigin = 'http://localhost:5173';
header('Access-Control-Allow-Origin: ' . $corsOrigin);
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
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

jsonResponse(['message' => 'Route not found.'], 404);
