<?php

declare(strict_types=1);

function handleAdminUpload(PDO $db, array $config): never
{
    requireRole($db, ['admin']);

    if (empty($_FILES['file']) || !is_array($_FILES['file'])) {
        jsonResponse(['message' => 'Aucun fichier reçu. Utilisez le champ file.'], 422);
    }

    $file = $_FILES['file'];
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        jsonResponse(['message' => 'Échec du téléversement (code ' . (int) ($file['error'] ?? 0) . ').'], 422);
    }

    $maxBytes = (int) (getenv('UPLOAD_MAX_BYTES') ?: 8 * 1024 * 1024);
    if (($file['size'] ?? 0) <= 0 || ($file['size'] ?? 0) > $maxBytes) {
        jsonResponse(['message' => 'Fichier trop volumineux (max ' . round($maxBytes / 1024 / 1024, 1) . ' Mo).'], 422);
    }

    $tmp = (string) ($file['tmp_name'] ?? '');
    if ($tmp === '' || !is_uploaded_file($tmp)) {
        jsonResponse(['message' => 'Fichier temporaire invalide.'], 422);
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($tmp) ?: '';
    $allowed = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
    ];
    if (!isset($allowed[$mime])) {
        jsonResponse(['message' => 'Format non supporté. Utilisez JPG, PNG, WebP ou GIF.'], 422);
    }

    $folder = preg_replace('/[^a-z0-9_-]/i', '', (string) ($_POST['folder'] ?? 'events')) ?: 'events';
    $dir = __DIR__ . '/../public/uploads/' . $folder;
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        jsonResponse(['message' => 'Impossible de créer le dossier uploads.'], 500);
    }

    $filename = date('Ymd-His') . '-' . bin2hex(random_bytes(4)) . '.' . $allowed[$mime];
    $destination = $dir . DIRECTORY_SEPARATOR . $filename;
    if (!move_uploaded_file($tmp, $destination)) {
        jsonResponse(['message' => 'Impossible d’enregistrer le fichier.'], 500);
    }

    $relative = '/uploads/' . $folder . '/' . $filename;
    $appUrl = rtrim((string) ($config['app_url'] ?? 'http://localhost:8000'), '/');
    $url = $appUrl . $relative;

    jsonResponse([
        'message' => 'Fichier téléversé.',
        'data' => [
            'path' => $relative,
            'url' => $url,
            'mime' => $mime,
            'size' => (int) $file['size'],
        ],
    ], 201);
}
