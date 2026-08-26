<?php

declare(strict_types=1);

function adminCrudRoute(PDO $db, string $path, string $method): void
{
    if (strpos($path, '/api/admin/') !== 0) return;

    $actor = requireRole($db, ['admin', 'developer']);

    if ($path === '/api/admin/users' || preg_match('#^/api/admin/users/(\d+)$#', $path, $userMatch)) {
        handleUserCrud($db, $actor, $method, isset($userMatch[1]) ? (int) $userMatch[1] : null);
        return;
    }

    if ($actor['role'] !== 'admin') {
        jsonResponse(['message' => 'Developer accounts cannot access ministry administration resources.'], 403);
    }

    $resources = [
        'ministries' => 'ministries', 'programs' => 'programs', 'events' => 'events',
        'event-photos' => 'event_photos', 'testimonials' => 'testimonials',
        'prayer-requests' => 'prayer_requests', 'help-requests' => 'help_requests', 'donations' => 'donations',
    ];

    foreach ($resources as $resource => $table) {
        $base = "/api/admin/{$resource}";
        if ($path === $base && $method === 'GET') {
            $stmt = $db->query("SELECT * FROM {$table} ORDER BY id DESC");
            jsonResponse(['data' => $stmt->fetchAll()]);
        }
        if ($path === $base && $method === 'POST') createAdminResource($db, $resource, requestBody());
        if (preg_match('#^' . preg_quote($base, '#') . '/(\d+)$#', $path, $match)) {
            $id = (int) $match[1];
            if ($method === 'GET') {
                $stmt = $db->prepare("SELECT * FROM {$table} WHERE id = ? LIMIT 1");
                $stmt->execute([$id]);
                $row = $stmt->fetch();
                if (!$row) jsonResponse(['message' => 'Resource not found.'], 404);
                jsonResponse(['data' => $row]);
            }
            if ($method === 'PATCH') updateAdminResource($db, $resource, $id, requestBody());
            if ($method === 'DELETE') {
                $stmt = $db->prepare("DELETE FROM {$table} WHERE id = ?"); $stmt->execute([$id]);
                jsonResponse(['message' => 'Resource deleted.']);
            }
        }
    }
    jsonResponse(['message' => 'Admin route not found.'], 404);
}

function handleUserCrud(PDO $db, array $actor, string $method, ?int $targetId): never
{
    $role = $actor['role']; $tableRole = $role === 'developer' ? 'developer' : 'admin';
    if ($method === 'GET' && $targetId === null) {
        $stmt = $db->prepare('SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE role = ? ORDER BY id DESC');
        $stmt->execute([$role]); jsonResponse(['data' => $stmt->fetchAll()]);
    }
    if ($targetId !== null) {
        $target = getSameRoleUser($db, $targetId, $role);
        if (!$target) jsonResponse(['message' => 'User not found.'], 404);
        if ($method === 'GET') jsonResponse(['data' => $target]);
        if ($method === 'PATCH') {
            $data = requestBody(); $sets = []; $values = [];
            if (array_key_exists('name', $data)) { $name = trim((string) $data['name']); if ($name === '') jsonResponse(['message' => 'Name cannot be empty.'], 422); $sets[] = 'name = ?'; $values[] = $name; }
            if (array_key_exists('email', $data)) { $email = filter_var($data['email'], FILTER_VALIDATE_EMAIL); if (!$email) jsonResponse(['message' => 'A valid email is required.'], 422); $sets[] = 'email = ?'; $values[] = $email; }
            if (array_key_exists('is_active', $data)) { $active = (bool) $data['is_active']; if (!$active && (int) $target['id'] === (int) $actor['id']) jsonResponse(['message' => 'You cannot deactivate your own account.'], 422); if (!$active && isLastActiveRoleUser($db, $role, (int) $target['id'])) jsonResponse(['message' => "Cannot deactivate the last active {$tableRole} account."], 409); $sets[] = 'is_active = ?'; $values[] = $active ? 1 : 0; }
            if (!empty($data['password'])) { if (strlen((string) $data['password']) < 8) jsonResponse(['message' => 'Password must contain at least 8 characters.'], 422); $sets[] = 'password = ?'; $values[] = password_hash((string) $data['password'], PASSWORD_DEFAULT); }
            if (!$sets) jsonResponse(['message' => 'No fields to update.'], 422); $values[] = (int) $target['id'];
            try { $stmt = $db->prepare('UPDATE users SET ' . implode(', ', $sets) . ' WHERE id = ?'); $stmt->execute($values); } catch (PDOException $e) { if ((int) $e->errorInfo[1] === 1062) jsonResponse(['message' => 'This email is already in use.'], 409); throw $e; }
            recordUserAudit($db, (int) $actor['id'], (int) $target['id'], 'update'); jsonResponse(['message' => ucfirst($tableRole) . ' account updated.']);
        }
        if ($method === 'DELETE') { if ((int) $target['id'] === (int) $actor['id']) jsonResponse(['message' => 'You cannot delete your own account.'], 422); if (isLastActiveRoleUser($db, $role, (int) $target['id'])) jsonResponse(['message' => "Cannot delete the last active {$tableRole} account."], 409); $stmt = $db->prepare('DELETE FROM users WHERE id = ? AND role = ?'); $stmt->execute([(int) $target['id'], $role]); recordUserAudit($db, (int) $actor['id'], (int) $target['id'], 'delete'); jsonResponse(['message' => ucfirst($tableRole) . ' account deleted.']); }
    }
    if ($method === 'POST' && $targetId === null) {
        $data = requestBody(); $email = filter_var($data['email'] ?? '', FILTER_VALIDATE_EMAIL); $password = (string) ($data['password'] ?? ''); $name = trim((string) ($data['name'] ?? ''));
        if (!$email) jsonResponse(['message' => 'A valid email is required.'], 422); if (strlen($password) < 8) jsonResponse(['message' => 'Password must contain at least 8 characters.'], 422); if ($name === '') $name = $role === 'developer' ? 'Developer' : 'Administrateur';
        $stmt = $db->prepare('INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, ?, 1)'); try { $stmt->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT), $role]); } catch (PDOException $e) { if ((int) $e->errorInfo[1] === 1062) jsonResponse(['message' => 'This email is already in use.'], 409); throw $e; }
        $newId = (int) $db->lastInsertId(); recordUserAudit($db, (int) $actor['id'], $newId, 'create'); jsonResponse(['message' => ucfirst($tableRole) . ' account created.', 'id' => $newId], 201);
    }
    jsonResponse(['message' => 'Method not allowed.'], 405);
}

function getSameRoleUser(PDO $db, int $id, string $role): ?array { $stmt = $db->prepare('SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE id = ? AND role = ? LIMIT 1'); $stmt->execute([$id, $role]); return $stmt->fetch() ?: null; }
function isLastActiveRoleUser(PDO $db, string $role, int $excludingId): bool { $stmt = $db->prepare('SELECT COUNT(*) FROM users WHERE role = ? AND is_active = 1 AND id <> ?'); $stmt->execute([$role, $excludingId]); return (int) $stmt->fetchColumn() === 0; }
function recordUserAudit(PDO $db, int $actorId, int $targetId, string $action): void { $stmt = $db->prepare('INSERT INTO user_admin_audit (actor_user_id, target_user_id, action) VALUES (?, ?, ?)'); $stmt->execute([$actorId, $targetId, $action]); }

function createAdminResource(PDO $db, string $resource, array $data): never
{
    $definitions = [
        'ministries' => ['name','slug','description','image','status'],
        'programs' => ['title','description','day','start_time','end_time','status'],
        'events' => ['title','description','image','event_date','location','status'],
        'event-photos' => ['event_id','image','caption','position','sort_order'],
        'testimonials' => ['name','content','photo','status'],
    ];
    if (!isset($definitions[$resource])) jsonResponse(['message' => 'This resource cannot be created here.'], 405);
    $fields = $definitions[$resource]; $table = $resource === 'event-photos' ? 'event_photos' : $resource;
    $values = array_map(fn($field) => $data[$field] ?? null, $fields);
    if ($resource === 'event-photos' && empty($data['event_id'])) jsonResponse(['message' => 'event_id is required.'], 422);
    if ($resource === 'event-photos' && empty($data['image'])) jsonResponse(['message' => 'image is required.'], 422);
    $stmt = $db->prepare('INSERT INTO ' . $table . ' (' . implode(', ', $fields) . ') VALUES (' . implode(', ', array_fill(0, count($fields), '?')) . ')'); $stmt->execute($values);
    jsonResponse(['message' => 'Resource created.', 'id' => (int) $db->lastInsertId()], 201);
}

function updateAdminResource(PDO $db, string $resource, int $id, array $data): never
{
    $definitions = [
        'ministries' => ['name','slug','description','image','status'], 'programs' => ['title','description','day','start_time','end_time','status'],
        'events' => ['title','description','image','event_date','location','status'], 'event-photos' => ['event_id','image','caption','position','sort_order'],
        'testimonials' => ['name','content','photo','status'], 'prayer-requests' => ['name','phone','email','subject','message','is_confidential','is_urgent','status'],
        'help-requests' => ['name','phone','message','status'], 'donations' => ['name','phone','amount','type','payment_method','transaction_id','status'],
    ];
    $fields = $definitions[$resource] ?? []; if (!$fields) jsonResponse(['message' => 'This resource cannot be updated here.'], 405);
    $table = $resource === 'prayer-requests' ? 'prayer_requests' : ($resource === 'help-requests' ? 'help_requests' : ($resource === 'event-photos' ? 'event_photos' : $resource));
    $sets = []; $values = []; foreach ($fields as $field) if (array_key_exists($field, $data)) { $sets[] = "{$field} = ?"; $values[] = $data[$field]; }
    if (!$sets) jsonResponse(['message' => 'No fields to update.'], 422); $values[] = $id;
    $stmt = $db->prepare('UPDATE ' . $table . ' SET ' . implode(', ', $sets) . ' WHERE id = ?'); $stmt->execute($values); jsonResponse(['message' => 'Resource updated.']);
}
