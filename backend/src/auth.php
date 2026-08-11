<?php

declare(strict_types=1);

function startSession(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }
}

function currentUser(PDO $db): ?array
{
    startSession();

    if (empty($_SESSION['user_id'])) {
        return null;
    }

    $stmt = $db->prepare('SELECT id, name, email, role, is_active FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([(int) $_SESSION['user_id']]);
    $user = $stmt->fetch();

    if (!$user || !(bool) $user['is_active']) {
        $_SESSION = [];
        session_destroy();
        return null;
    }

    return $user;
}

function requireAuth(PDO $db): int
{
    $user = currentUser($db);

    if (!$user) {
        jsonResponse(['message' => 'Authentication required.'], 401);
    }

    return (int) $user['id'];
}

function requireRole(PDO $db, array $roles): array
{
    $user = currentUser($db);

    if (!$user) {
        jsonResponse(['message' => 'Authentication required.'], 401);
    }

    if (!in_array($user['role'], $roles, true)) {
        jsonResponse(['message' => 'You do not have permission to perform this action.'], 403);
    }

    return $user;
}

function requireAdmin(PDO $db): array
{
    return requireRole($db, ['admin']);
}

function requireDeveloper(PDO $db): array
{
    return requireRole($db, ['developer']);
}
