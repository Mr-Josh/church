<?php

declare(strict_types=1);

function requireDeveloperAccess(PDO $db): void
{
    requireDeveloper($db);
}

function devTableExists(PDO $db, string $table): bool
{
    $stmt = $db->prepare('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?');
    $stmt->execute([$table]);
    return (int) $stmt->fetchColumn() > 0;
}

function devCount(PDO $db, string $table, string $where = ''): int
{
    if (!devTableExists($db, $table)) return 0;
    return (int) $db->query("SELECT COUNT(*) FROM `{$table}`" . ($where ? " WHERE {$where}" : ''))->fetchColumn();
}

function devOverview(PDO $db): void
{
    requireDeveloperAccess($db);

    $tables = ['users', 'ministries', 'programs', 'events', 'sermons', 'gallery_items', 'testimonials', 'prayer_requests', 'help_requests'];
    $tableStats = [];
    foreach ($tables as $table) {
        $tableStats[$table] = [
            'exists' => devTableExists($db, $table),
            'rows' => devCount($db, $table),
        ];
    }

    $version = $db->query('SELECT VERSION()')->fetchColumn();
    $primary = false;
    if (devTableExists($db, 'church_account_settings')) {
        $primary = (bool) $db->query('SELECT EXISTS(SELECT 1 FROM church_account_settings WHERE id = 1 AND primary_admin_user_id IS NOT NULL)')->fetchColumn();
    }

    jsonResponse(['data' => [
        'application' => ['name' => 'Gospel Break Chain Ministry', 'environment' => $GLOBALS['config']['app_env'] ?? 'local'],
        'system' => ['php' => PHP_VERSION, 'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'PHP built-in server'],
        'database' => ['engine' => 'MySQL', 'version' => $version, 'connected' => true],
        'accounts' => [
            'active_users' => devCount($db, 'users', 'is_active = 1'),
            'active_admins' => devCount($db, 'users', "role = 'admin' AND is_active = 1"),
            'active_developers' => devCount($db, "users", "role = 'developer' AND is_active = 1"),
            'primary_account_configured' => $primary,
        ],
        'content' => [
            'ministries' => devCount($db, 'ministries'),
            'programs' => devCount($db, 'programs'),
            'events' => devCount($db, 'events'),
            'sermons' => devCount($db, 'sermons'),
            'gallery' => devCount($db, 'gallery_items'),
            'testimonials' => devCount($db, 'testimonials'),
            'prayer_requests' => devCount($db, 'prayer_requests'),
            'help_requests' => devCount($db, 'help_requests'),
        ],
        'tables' => $tableStats,
    ]]);
}

function devDatabase(PDO $db): void
{
    requireDeveloperAccess($db);
    $stmt = $db->query('SELECT table_name, table_rows, engine, table_collation FROM information_schema.tables WHERE table_schema = DATABASE() ORDER BY table_name');
    $tables = [];
    foreach ($stmt->fetchAll() as $row) {
        $tables[] = [
            'name' => $row['table_name'],
            'rows' => (int) $row['table_rows'],
            'engine' => $row['engine'] ?: '—',
            'collation' => $row['table_collation'] ?: '—',
        ];
    }
    jsonResponse(['data' => ['database' => 'MySQL', 'tables' => $tables]]);
}

function devSecurity(PDO $db): void
{
    requireDeveloperAccess($db);
    $auditExists = devTableExists($db, 'user_admin_audit');
    $audits = $auditExists ? devCount($db, 'user_admin_audit') : 0;
    jsonResponse(['data' => [
        'session' => ['strategy' => 'PHP session cookie', 'credentials' => 'httpOnly server session'],
        'roles' => ['admin' => devCount($db, 'users', "role = 'admin'"), 'developer' => devCount($db, 'users', "role = 'developer'")],
        'active_accounts' => devCount($db, 'users', 'is_active = 1'),
        'inactive_accounts' => devCount($db, 'users', 'is_active = 0'),
        'audit_log' => ['available' => $auditExists, 'entries' => $audits],
        'church_data_write_access' => false,
    ]]);
}

function devAudit(PDO $db): void
{
    requireDeveloperAccess($db);
    if (!devTableExists($db, 'user_admin_audit')) {
        jsonResponse(['data' => ['entries' => []]]);
    }
    $stmt = $db->query('SELECT a.id, a.actor_user_id, a.target_user_id, a.action, a.created_at, actor.email AS actor_email, target.email AS target_email FROM user_admin_audit a LEFT JOIN users actor ON actor.id = a.actor_user_id LEFT JOIN users target ON target.id = a.target_user_id ORDER BY a.created_at DESC, a.id DESC LIMIT 100');
    jsonResponse(['data' => ['entries' => $stmt->fetchAll()]]);
}
