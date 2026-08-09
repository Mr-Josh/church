<?php

declare(strict_types=1);

function adminDashboard(PDO $db): void
{
    requireAuth();
    $data = [];
    foreach (['prayer_requests','help_requests','testimonials','donations'] as $table) {
        $data[$table] = (int) $db->query("SELECT COUNT(*) FROM {$table}")->fetchColumn();
    }
    jsonResponse(['data' => $data]);
}
