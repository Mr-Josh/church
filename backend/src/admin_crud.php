<?php

declare(strict_types=1);

function adminCrudRoute(PDO $db, string $path, string $method): void
{
    if (strpos($path, '/api/admin/') !== 0) return;
    requireAuth();

    $resources = [
        'ministries' => 'ministries', 'programs' => 'programs', 'events' => 'events', 'sermons' => 'sermons',
        'gallery' => 'gallery_items', 'testimonials' => 'testimonials', 'prayer-requests' => 'prayer_requests', 'help-requests' => 'help_requests',
    ];

    foreach ($resources as $resource => $table) {
        $base = "/api/admin/{$resource}";
        if ($path === $base && $method === 'GET') {
            $order = in_array($resource, ['prayer-requests', 'help-requests'], true) ? 'ORDER BY is_urgent DESC, id DESC' : 'ORDER BY id DESC';
            $stmt = $db->query("SELECT * FROM {$table} {$order}");
            jsonResponse(['data' => $stmt->fetchAll()]);
        }
        if ($path === $base && $method === 'POST') createAdminResource($db, $resource, requestBody());
        if (preg_match('#^' . preg_quote($base, '#') . '/(\d+)$#', $path, $match)) {
            $id = (int) $match[1];
            if ($method === 'GET') {
                $stmt = $db->prepare("SELECT * FROM {$table} WHERE id = ? LIMIT 1"); $stmt->execute([$id]); $row = $stmt->fetch();
                if (!$row) jsonResponse(['message' => 'Resource not found.'], 404); jsonResponse(['data' => $row]);
            }
            if ($method === 'PATCH') updateAdminResource($db, $resource, $id, requestBody());
            if ($method === 'DELETE') { $stmt = $db->prepare("DELETE FROM {$table} WHERE id = ?"); $stmt->execute([$id]); jsonResponse(['message' => 'Resource deleted.']); }
        }
    }

    if ($path === '/api/admin/church-settings' && $method === 'GET') {
        $stmt = $db->query('SELECT * FROM church_settings WHERE id = 1 LIMIT 1'); jsonResponse(['data' => $stmt->fetch()]);
    }
    if ($path === '/api/admin/church-settings' && $method === 'PATCH') {
        $data = requestBody(); $allowed = ['church_name','slogan','mission','vision','address','phone','whatsapp','email']; $sets = []; $values = [];
        foreach ($allowed as $field) if (array_key_exists($field, $data)) { $sets[] = "{$field} = ?"; $values[] = $data[$field]; }
        if (!$sets) jsonResponse(['message' => 'No fields to update.'], 422);
        $values[] = 1; $stmt = $db->prepare('UPDATE church_settings SET ' . implode(', ', $sets) . ' WHERE id = ?'); $stmt->execute($values); jsonResponse(['message' => 'Church settings updated.']);
    }
    jsonResponse(['message' => 'Admin route not found.'], 404);
}

function createAdminResource(PDO $db, string $resource, array $data): never
{
    $definitions = [
        'ministries' => ['name','slug','description','image','status'], 'programs' => ['title','description','day','start_time','end_time','status'],
        'events' => ['title','description','image','event_date','location','status'], 'sermons' => ['title','description','preacher','video_url','audio_url','pdf_url','published_at','status'],
        'gallery' => ['title','type','file_url'], 'testimonials' => ['name','content','photo','status'],
    ];
    if (!isset($definitions[$resource])) jsonResponse(['message' => 'This resource cannot be created here.'], 405);
    $fields = $definitions[$resource]; $values = array_map(fn(string $field) => $data[$field] ?? null, $fields); $table = $resource === 'gallery' ? 'gallery_items' : $resource;
    $placeholders = implode(', ', array_fill(0, count($fields), '?')); $stmt = $db->prepare('INSERT INTO ' . $table . ' (' . implode(', ', $fields) . ') VALUES (' . $placeholders . ')'); $stmt->execute($values);
    jsonResponse(['message' => 'Resource created.', 'id' => (int) $db->lastInsertId()], 201);
}

function updateAdminResource(PDO $db, string $resource, int $id, array $data): never
{
    $definitions = [
        'ministries' => ['name','slug','description','image','status'], 'programs' => ['title','description','day','start_time','end_time','status'],
        'events' => ['title','description','image','event_date','location','status'], 'sermons' => ['title','description','preacher','video_url','audio_url','pdf_url','published_at','status'],
        'gallery' => ['title','type','file_url'], 'testimonials' => ['name','content','photo','status'],
        'prayer-requests' => ['name','phone','email','subject','message','is_confidential','is_urgent','status'], 'help-requests' => ['name','phone','message','status'],
    ];
    $fields = $definitions[$resource] ?? []; if (!$fields) jsonResponse(['message' => 'This resource cannot be updated here.'], 405);
    $sets = []; $values = [];
    foreach ($fields as $field) if (array_key_exists($field, $data)) { $sets[] = "{$field} = ?"; $values[] = $data[$field]; }
    if (!$sets) jsonResponse(['message' => 'No fields to update.'], 422);
    $table = $resource === 'gallery' ? 'gallery_items' : $resource; $values[] = $id; $stmt = $db->prepare('UPDATE ' . $table . ' SET ' . implode(', ', $sets) . ' WHERE id = ?'); $stmt->execute($values); jsonResponse(['message' => 'Resource updated.']);
}
