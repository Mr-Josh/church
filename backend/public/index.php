<?php

declare(strict_types=1);

$config = require __DIR__ . '/../config/config.php';
$db = require __DIR__ . '/../config/database.php';
require __DIR__ . '/../src/response.php';
require __DIR__ . '/../src/auth.php';
require __DIR__ . '/../src/router.php';

header('Access-Control-Allow-Origin: ' . $config['cors_origin']);
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($path === '/api/health' && $method === 'GET') {
    jsonResponse(['status' => 'ok', 'service' => 'church-api']);
}

if ($path === '/api/auth/login' && $method === 'POST') {
    $data = requestBody();
    if (empty($data['email']) || empty($data['password'])) jsonResponse(['message' => 'Email and password are required.'], 422);
    $stmt = $db->prepare('SELECT id, name, email, password, role FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$data['email']]);
    $user = $stmt->fetch();
    if (!$user || !password_verify($data['password'], $user['password'])) jsonResponse(['message' => 'Invalid credentials.'], 401);
    startSession();
    $_SESSION['user_id'] = (int) $user['id'];
    unset($user['password']);
    jsonResponse(['user' => $user]);
}

if ($path === '/api/auth/logout' && $method === 'POST') {
    startSession();
    $_SESSION = [];
    session_destroy();
    jsonResponse(['message' => 'Logged out.']);
}

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
    $stmt->execute([$data['name'] ?? null, $data['phone'], $data['message']]);
    jsonResponse(['message' => 'Help request received.'], 201);
}

if ($path === '/api/testimonials' && $method === 'POST') {
    $data = requestBody();
    if (empty($data['name']) || empty($data['content'])) jsonResponse(['message' => 'Name and content are required.'], 422);
    $stmt = $db->prepare('INSERT INTO testimonials (name, content, photo) VALUES (?, ?, ?)');
    $stmt->execute([$data['name'], $data['content'], $data['photo'] ?? null]);
    jsonResponse(['message' => 'Testimonial submitted for review.'], 201);
}

jsonResponse(['message' => 'Route not found.'], 404);
