<?php

declare(strict_types=1);

function adminDashboard(PDO $db): void
{
    requireAuth();
    $tables = [
        'ministries' => 'ministries',
        'programs' => 'programs',
        'events' => 'events',
        'sermons' => 'sermons',
        'gallery' => 'gallery_items',
        'testimonials' => 'testimonials',
        'prayer-requests' => 'prayer_requests',
        'help-requests' => 'help_requests',
    ];
    $counts = [];
    foreach ($tables as $key => $table) {
        $counts[$key] = (int) $db->query("SELECT COUNT(*) FROM {$table}")->fetchColumn();
    }
    jsonResponse(['data' => ['counts' => $counts]]);
}
