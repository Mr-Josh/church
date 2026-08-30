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

    $maxBytes = (int) (getenv('UPLOAD_MAX_BYTES') ?: 10 * 1024 * 1024);
    $fileSize = (int) ($file['size'] ?? 0);
    if ($fileSize <= 0 || $fileSize > $maxBytes) {
        jsonResponse(['message' => 'Fichier trop volumineux (max ' . round($maxBytes / 1024 / 1024, 1) . ' Mo).'], 422);
    }

    $tmp = (string) ($file['tmp_name'] ?? '');
    if ($tmp === '' || !is_uploaded_file($tmp)) {
        jsonResponse(['message' => 'Fichier temporaire invalide.'], 422);
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($tmp) ?: '';
    $allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!in_array($mime, $allowed, true)) {
        jsonResponse(['message' => 'Format non supporté. Utilisez JPG, PNG ou WebP.'], 422);
    }

    $extension = strtolower(pathinfo((string) ($file['name'] ?? ''), PATHINFO_EXTENSION));
    $allowedExtensions = ['jpeg', 'jpg', 'png', 'webp'];
    if (!in_array($extension, $allowedExtensions, true)) {
        jsonResponse(['message' => 'Extension de fichier non autorisée.'], 422);
    }

    $dimensions = @getimagesize($tmp);
    if (!$dimensions || empty($dimensions[0]) || empty($dimensions[1])) {
        jsonResponse(['message' => 'Le fichier ne contient pas une image valide.'], 422);
    }
    $sourceWidth = (int) $dimensions[0];
    $sourceHeight = (int) $dimensions[1];
    if ($sourceWidth < 1 || $sourceHeight < 1 || $sourceWidth > 12000 || $sourceHeight > 12000) {
        jsonResponse(['message' => 'Dimensions d’image non prises en charge.'], 422);
    }

    if (!function_exists('imagewebp')) {
        jsonResponse(['message' => 'Le serveur PHP doit disposer de GD avec le support WebP pour traiter les images.'], 503);
    }

    $kind = (string) ($_POST['kind'] ?? 'gallery');
    if (!in_array($kind, ['cover', 'gallery'], true)) {
        jsonResponse(['message' => 'Type de média invalide.'], 422);
    }

    $rawFolder = (string) ($_POST['folder'] ?? '');
    $parts = array_values(array_filter(explode('/', trim($rawFolder, '/')), static fn($part) => $part !== '' && $part !== '.' && $part !== '..'));
    $safeParts = [];
    foreach ($parts as $part) {
        $safe = preg_replace('/[^a-z0-9_-]/i', '-', $part) ?? '';
        $safe = trim(preg_replace('/-+/', '-', $safe), '-');
        if ($safe !== '') $safeParts[] = $safe;
    }
    if (count($safeParts) < 3 || $safeParts[0] !== 'events' || !preg_match('/^\d{4}$/', $safeParts[1])) {
        jsonResponse(['message' => 'Dossier média invalide.'], 422);
    }

    $folder = implode('/', $safeParts);
    $dir = __DIR__ . '/../public/uploads/' . str_replace('/', DIRECTORY_SEPARATOR, $folder);
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        jsonResponse(['message' => 'Impossible de créer le dossier uploads.'], 500);
    }

    $source = match ($mime) {
        'image/jpeg' => @imagecreatefromjpeg($tmp),
        'image/png' => @imagecreatefrompng($tmp),
        'image/webp' => @imagecreatefromwebp($tmp),
        default => false,
    };
    if (!$source) jsonResponse(['message' => 'Impossible de décoder cette image sur le serveur.'], 422);

    try {
        $source = normalizeImageOrientation($source, $tmp, $mime);
        $sourceWidth = imagesx($source);
        $sourceHeight = imagesy($source);

        if ($kind === 'cover') {
            $variants = generateCoverVariants($source, $dir);
            $relative = '/uploads/' . $folder . '/cover/desktop.webp';
            $result = [
                'path' => $relative,
                'url' => buildMediaUrl($config, $relative),
                'mime' => 'image/webp',
                'optimized' => true,
                'variants' => [
                    'desktop' => '/uploads/' . $folder . '/cover/desktop.webp',
                    'standard' => '/uploads/' . $folder . '/cover/standard.webp',
                    'mobile' => '/uploads/' . $folder . '/cover/mobile.webp',
                    'thumbnail' => '/uploads/' . $folder . '/cover/thumb.webp',
                ],
                'source' => ['mime' => $mime, 'size' => $fileSize, 'width' => $sourceWidth, 'height' => $sourceHeight],
            ];
        } else {
            $result = generateGalleryVariant($source, $dir, $config, $sourceWidth, $sourceHeight);
        }
    } catch (Throwable $e) {
        @imagedestroy($source);
        jsonResponse(['message' => 'Le traitement de l’image a échoué.'], 422);
    }

    @imagedestroy($source);
    jsonResponse(['message' => 'Image téléversée et optimisée.', 'data' => $result], 201);
}

function normalizeImageOrientation($image, string $tmp, string $mime)
{
    if ($mime !== 'image/jpeg' || !function_exists('exif_read_data')) return $image;
    $exif = @exif_read_data($tmp);
    $orientation = (int) ($exif['Orientation'] ?? 1);
    $angles = [3 => 180, 6 => -90, 8 => 90];
    if (isset($angles[$orientation])) {
        $rotated = @imagerotate($image, $angles[$orientation], 0);
        if ($rotated !== false) {
            imagedestroy($image);
            return $rotated;
        }
    }
    return $image;
}

function prepareWebpCanvas(int $width, int $height)
{
    $canvas = imagecreatetruecolor($width, $height);
    imagealphablending($canvas, false);
    imagesavealpha($canvas, true);
    $transparent = imagecolorallocatealpha($canvas, 255, 255, 255, 127);
    imagefilledrectangle($canvas, 0, 0, $width, $height, $transparent);
    return $canvas;
}

function cropToRatio($source, float $targetRatio = 16 / 9)
{
    $width = imagesx($source);
    $height = imagesy($source);
    $sourceRatio = $width / $height;

    if ($sourceRatio > $targetRatio) {
        $cropHeight = $height;
        $cropWidth = (int) floor($height * $targetRatio);
        $srcX = (int) floor(($width - $cropWidth) / 2);
        $srcY = 0;
    } else {
        $cropWidth = $width;
        $cropHeight = (int) floor($width / $targetRatio);
        $srcX = 0;
        $srcY = (int) floor(($height - $cropHeight) / 2);
    }

    $crop = prepareWebpCanvas($cropWidth, $cropHeight);
    imagecopy($crop, $source, 0, 0, $srcX, $srcY, $cropWidth, $cropHeight);
    return $crop;
}

function resizeWithoutUpscale($source, int $maxWidth, int $maxHeight)
{
    $width = imagesx($source);
    $height = imagesy($source);
    $scale = min(1, $maxWidth / $width, $maxHeight / $height);
    $newWidth = max(1, (int) floor($width * $scale));
    $newHeight = max(1, (int) floor($height * $scale));

    if ($newWidth === $width && $newHeight === $height) return $source;

    $resized = prepareWebpCanvas($newWidth, $newHeight);
    imagecopyresampled($resized, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
    return $resized;
}

function saveWebp($image, string $path, int $quality): void
{
    $tmp = $path . '.tmp-' . bin2hex(random_bytes(5));
    if (!@imagewebp($image, $tmp, $quality) || !is_file($tmp)) {
        @unlink($tmp);
        throw new RuntimeException('WebP generation failed.');
    }
    if (is_file($path) && !@unlink($path)) {
        @unlink($tmp);
        throw new RuntimeException('Unable to replace previous image.');
    }
    if (!@rename($tmp, $path)) {
        @unlink($tmp);
        throw new RuntimeException('Unable to finalize image.');
    }
}

function generateCoverVariants($source, string $eventDir): array
{
    $coverDir = $eventDir . DIRECTORY_SEPARATOR . 'cover';
    if (!is_dir($coverDir) && !mkdir($coverDir, 0755, true) && !is_dir($coverDir)) throw new RuntimeException('Unable to create cover directory.');

    $targets = [
        'desktop' => [1600, 900, 85],
        'standard' => [1280, 720, 82],
        'mobile' => [768, 432, 80],
        'thumb' => [400, 225, 78],
    ];

    $cropped = cropToRatio($source);
    try {
        foreach ($targets as $name => [$width, $height, $quality]) {
            $variant = resizeWithoutUpscale($cropped, $width, $height);
            try {
                saveWebp($variant, $coverDir . DIRECTORY_SEPARATOR . $name . '.webp', $quality);
            } finally {
                if ($variant !== $cropped) @imagedestroy($variant);
            }
        }
    } finally {
        @imagedestroy($cropped);
    }

    return ['directory' => $coverDir];
}

function generateGalleryVariant($source, string $eventDir, array $config, int $sourceWidth, int $sourceHeight): array
{
    $galleryDir = $eventDir . DIRECTORY_SEPARATOR . 'gallery';
    if (!is_dir($galleryDir) && !mkdir($galleryDir, 0755, true) && !is_dir($galleryDir)) throw new RuntimeException('Unable to create gallery directory.');

    $stem = date('Ymd-His') . '-' . bin2hex(random_bytes(5));
    $full = resizeWithoutUpscale($source, 1200, 800);
    $thumbnail = resizeWithoutUpscale($source, 400, 300);
    $fullPath = $galleryDir . DIRECTORY_SEPARATOR . $stem . '.webp';
    $thumbPath = $galleryDir . DIRECTORY_SEPARATOR . $stem . '-thumb.webp';
    try {
        saveWebp($full, $fullPath, 83);
        saveWebp($thumbnail, $thumbPath, 78);
    } catch (Throwable $e) {
        @unlink($fullPath);
        @unlink($thumbPath);
        throw $e;
    } finally {
        if ($full !== $source) @imagedestroy($full);
        if ($thumbnail !== $source && $thumbnail !== $full) @imagedestroy($thumbnail);
    }

    $path = '/uploads/' . str_replace(DIRECTORY_SEPARATOR, '/', substr($fullPath, strlen(__DIR__ . '/../public/')));
    $thumb = '/uploads/' . str_replace(DIRECTORY_SEPARATOR, '/', substr($thumbPath, strlen(__DIR__ . '/../public/')));
    return [
        'path' => $path,
        'url' => buildMediaUrl($config, $path),
        'thumbnail' => $thumb,
        'thumbnailUrl' => buildMediaUrl($config, $thumb),
        'mime' => 'image/webp',
        'optimized' => true,
        'source' => ['mime' => finfo_file(new finfo(FILEINFO_MIME_TYPE), $source) ?: 'image', 'size' => 0, 'width' => $sourceWidth, 'height' => $sourceHeight],
    ];
}

function buildMediaUrl(array $config, string $relative): string
{
    $appUrl = rtrim((string) ($config['app_url'] ?? 'http://localhost:8000'), '/');
    return $appUrl . $relative;
}
