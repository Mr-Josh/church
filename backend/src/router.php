<?php

declare(strict_types=1);

function publicRoute(PDO $db, string $path, string $method): void
{
    if ($method !== 'GET') return;

    $routes = [
        '/api/church' => 'church_settings',
        '/api/ministries' => 'ministries',
        '/api/programs' => 'programs',
        '/api/events' => 'events',
        '/api/testimonials' => 'testimonials',
    ];

    if (!isset($routes[$path])) return;

    $table = $routes[$path];
    $where = $table === 'church_settings'
        ? 'id = 1'
        : ($table === 'testimonials' ? "status = 'published'" : "status = 'published'");
    $order = $table === 'testimonials' ? 'created_at DESC, id DESC' : 'id DESC';
    $stmt = $db->query("SELECT * FROM {$table} WHERE {$where} ORDER BY {$order}");
    jsonResponse(['data' => $stmt->fetchAll()]);
}
