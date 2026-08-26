<?php

declare(strict_types=1);

function publicRoute(PDO $db, string $path, string $method): void
{
    if ($method !== 'GET') return;

    $routes = [
        '/api/church' => 'church_settings',
        '/api/ministries' => 'ministries',
        '/api/events' => 'events',
        '/api/testimonials' => 'testimonials',
    ];

    if ($path === '/api/events') {
        $stmt = $db->query("SELECT * FROM events WHERE status = 'published' ORDER BY event_date DESC, id DESC");
        $events = $stmt->fetchAll();
        $photos = $db->query('SELECT * FROM event_photos ORDER BY event_id DESC, sort_order ASC, id ASC')->fetchAll();
        $byEvent = [];
        foreach ($photos as $photo) $byEvent[(int) $photo['event_id']][] = $photo;
        foreach ($events as &$event) $event['photos'] = $byEvent[(int) $event['id']] ?? [];
        unset($event);
        jsonResponse(['data' => $events]);
    }

    if (!isset($routes[$path])) return;

    $table = $routes[$path];
    $where = $table === 'church_settings' ? 'id = 1' : "status = 'published'";
    $order = $table === 'testimonials' ? 'created_at DESC, id DESC' : 'id DESC';
    $stmt = $db->query("SELECT * FROM {$table} WHERE {$where} ORDER BY {$order}");
    jsonResponse(['data' => $stmt->fetchAll()]);
}
