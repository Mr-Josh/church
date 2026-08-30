<?php

declare(strict_types=1);

function publicEventState(string $startAt, string $endAt): string
{
    $now = time(); $start = strtotime($startAt); $end = strtotime($endAt);
    if ($now < $start) return 'upcoming';
    if ($now <= $end) return 'ongoing';
    return 'past';
}

function publicRoute(PDO $db, string $path, string $method): void
{
    if ($method !== 'GET') return;
    $routes = ['/api/church' => 'church_settings', '/api/ministries' => 'ministries', '/api/events' => 'events', '/api/testimonials' => 'testimonials'];

    if ($path === '/api/events') {
        $stmt = $db->query("SELECT e.*, CASE WHEN e.archived_at IS NOT NULL THEN 'archived' WHEN NOW() < e.start_at THEN 'upcoming' WHEN NOW() <= e.end_at THEN 'ongoing' ELSE 'past' END AS event_state, (SELECT COUNT(*) FROM event_photos p WHERE p.event_id=e.id) AS photo_count FROM events e WHERE e.status='published' AND e.archived_at IS NULL ORDER BY e.is_featured DESC, e.display_order ASC, e.start_at DESC, e.id DESC");
        $events = $stmt->fetchAll();
        foreach ($events as &$event) $event = decorateEventMedia($event);
        unset($event);
        jsonResponse(['data' => $events]);
    }

    if (preg_match('#^/api/events/([^/]+)$#', $path, $match)) {
        $stmt = $db->prepare("SELECT e.*, CASE WHEN e.archived_at IS NOT NULL THEN 'archived' WHEN NOW() < e.start_at THEN 'upcoming' WHEN NOW() <= e.end_at THEN 'ongoing' ELSE 'past' END AS event_state, (SELECT COUNT(*) FROM event_photos p WHERE p.event_id=e.id) AS photo_count FROM events e WHERE e.slug=? AND e.status='published' AND e.archived_at IS NULL LIMIT 1");
        $stmt->execute([$match[1]]);
        $event = $stmt->fetch();
        if (!$event) return;
        $photos = $db->prepare('SELECT * FROM event_photos WHERE event_id=? ORDER BY sort_order ASC,id ASC');
        $photos->execute([(int) $event['id']]);
        $event['photos'] = $photos->fetchAll();
        $event = decorateEventMedia($event);
        jsonResponse(['data' => $event]);
    }

    if (!isset($routes[$path])) return;
    $table = $routes[$path];
    $where = $table === 'church_settings' ? 'id=1' : "status='published'";
    $order = $table === 'testimonials' ? 'created_at DESC,id DESC' : 'id DESC';
    $stmt = $db->query("SELECT * FROM {$table} WHERE {$where} ORDER BY {$order}");
    jsonResponse(['data' => $stmt->fetchAll()]);
}
