<?php

namespace App\Support\Cms\Modules;

use App\Support\Navigation\LinkTarget;

class CmsLinkTargetNormalizer
{
    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>|null
     */
    public static function normalize(array $payload): ?array
    {
        $target = $payload['target'] ?? null;

        if (is_array($target)) {
            return LinkTarget::normalize($target);
        }

        $legacyHref = trim((string) ($payload['href'] ?? $payload['url'] ?? ''));

        if ($legacyHref === '') {
            return null;
        }

        return LinkTarget::normalize([
            'type' => 'url',
            'value' => [
                'url' => $legacyHref,
            ],
            'behavior' => [
                'new_tab' => (bool) ($payload['open_in_new_tab'] ?? false),
            ],
        ]);
    }
}
