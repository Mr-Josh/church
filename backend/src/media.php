<?php

declare(strict_types=1);

/**
 * Media helpers shared by the upload and event API layers.
 * Files are always resolved below backend/public/uploads.
 */
function mediaPublicRoot(): string
{
    return __DIR__ . '/../public';
}

function mediaFilePath(string $publicPath): ?string
{
    $path = parse_url($publicPath, PHP_URL_PATH);
    if (!is_string($path) || !str_starts_with($path, '/uploads/')) return null;
    $relative = ltrim($path, '/');
    if (str_contains($relative, '..')) return null;
    return mediaPublicRoot() . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relative);
}

function eventCoverVariants(?string $image): ?array
{
    if (!$image) return null;
    if (preg_match('#^(.*?/cover)/desktop\.webp$#i', $image, $match)) {
        $base = $match[1];
        return [
            'desktop' => $base . '/desktop.webp',
            'standard' => $base . '/standard.webp',
            'mobile' => $base . '/mobile.webp',
            'thumbnail' => $base . '/thumb.webp',
        ];
    }
    return [
        'desktop' => $image,
        'standard' => $image,
        'mobile' => $image,
        'thumbnail' => $image,
    ];
}

function eventGalleryVariants(?string $image): ?array
{
    if (!$image) return null;
    if (preg_match('#^(.*?/gallery/)([^/]+)\.webp$#i', $image, $match) && !str_ends_with(strtolower($match[2]), '-thumb')) {
        return [
            'full' => $image,
            'thumbnail' => $match[1] . $match[2] . '-thumb.webp',
        ];
    }
    return ['full' => $image, 'thumbnail' => $image];
}

function decorateEventMedia(array $event): array
{
    $event['cover'] = eventCoverVariants($event['image'] ?? null);
    if (isset($event['photos']) && is_array($event['photos'])) {
        foreach ($event['photos'] as &$photo) {
            $photo['media'] = eventGalleryVariants($photo['image'] ?? null);
            if (!isset($photo['thumbnail']) && !empty($photo['media']['thumbnail'])) {
                $photo['thumbnail'] = $photo['media']['thumbnail'];
            }
        }
        unset($photo);
    }
    return $event;
}

function deleteMediaVariants(?string $publicPath): void
{
    if (!$publicPath) return;
    $path = parse_url($publicPath, PHP_URL_PATH);
    if (!is_string($path) || !str_starts_with($path, '/uploads/')) return;

    $files = [$path];
    if (preg_match('#^(.*?/cover)/(desktop|standard|mobile|thumb)\.webp$#i', $path, $match)) {
        foreach (['desktop', 'standard', 'mobile', 'thumb'] as $name) $files[] = $match[1] . '/' . $name . '.webp';
    }
    if (preg_match('#^(.*?/gallery/)([^/]+)\.webp$#i', $path, $match) && !str_ends_with(strtolower($match[2]), '-thumb')) {
        $files[] = $match[1] . $match[2] . '-thumb.webp';
    }

    foreach (array_unique($files) as $file) {
        $absolute = mediaFilePath($file);
        if ($absolute && is_file($absolute)) @unlink($absolute);
    }
}
