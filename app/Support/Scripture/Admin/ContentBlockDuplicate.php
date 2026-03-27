<?php

namespace App\Support\Scripture\Admin;

use App\Models\ContentBlock;

/**
 * Shared duplication rules for live public-page block management.
 *
 * The current live scope duplicates only the simple text-style blocks that
 * already fit the safe inline-edit model. Region/body/status are preserved and
 * titles receive a friendly "Copy" suffix when present.
 */
class ContentBlockDuplicate
{
    /**
     * @return array<string, mixed>
     */
    public static function attributes(
        ContentBlock $contentBlock,
        ?string $forcedBlockType = null,
    ): array {
        return [
            'region' => $contentBlock->region,
            'block_type' => $forcedBlockType ?? $contentBlock->block_type,
            'title' => self::duplicateTitle($contentBlock->title),
            'body' => (string) ($contentBlock->body ?? ''),
            'data_json' => $contentBlock->data_json,
            'status' => $contentBlock->status,
        ];
    }

    private static function duplicateTitle(?string $title): ?string
    {
        if (! is_string($title)) {
            return null;
        }

        $trimmed = trim($title);

        if ($trimmed === '') {
            return null;
        }

        return str_ends_with($trimmed, ' Copy')
            ? $trimmed
            : "{$trimmed} Copy";
    }
}
