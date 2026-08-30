<?php

declare(strict_types=1);

function adminDashboard(PDO $db): void
{
    requireAdmin($db);

    // Keep dashboard metrics aligned with the current schema. Obsolete
    // programs, sermons and gallery modules were removed from the project.
    $tables = [
        'ministries' => 'ministries',
        'events' => 'events',
        'testimonials' => 'testimonials',
        'prayer-requests' => 'prayer_requests',
        'help-requests' => 'help_requests',
        'donations' => 'donations',
    ];

    $counts = [];
    foreach ($tables as $key => $table) {
        $counts[$key] = (int) $db->query("SELECT COUNT(*) FROM {$table}")->fetchColumn();
    }

    $donationsSum = (float) $db->query("SELECT COALESCE(SUM(amount), 0) FROM donations WHERE status = 'success'")->fetchColumn();

    jsonResponse(['data' => [
        'counts' => $counts,
        'donations_sum' => $donationsSum
    ]]);
}
