<?php

declare(strict_types=1);

function adminDashboard(PDO $db): void
{
    requireAdmin($db);

    $tables = [
        'ministries' => 'ministries',
        'programs' => 'programs',
        'events' => 'events',
        'sermons' => 'sermons',
        'gallery' => 'gallery_items',
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
