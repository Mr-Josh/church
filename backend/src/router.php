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
        '/api/sermons' => 'sermons',
        '/api/gallery' => 'gallery_items',
        '/api/testimonials' => 'testimonials',
    ];
    if (!isset($routes[$path])) return;
    $table = $routes[$path];
    $where = $table === 'church_settings' ? 'id = 1' : ($table === 'testimonials' ? "status = 'published'" : ($table === 'gallery_items' ? '1 = 1' : "status = 'published'"));
    $stmt = $db->query("SELECT * FROM {$table} WHERE {$where} ORDER BY id DESC");
    jsonResponse(['data' => $stmt->fetchAll()]);
}
