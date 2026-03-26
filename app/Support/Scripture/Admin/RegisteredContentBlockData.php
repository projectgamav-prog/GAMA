<?php

namespace App\Support\Scripture\Admin;

use App\Models\ContentBlock;

class RegisteredContentBlockData
{
    /**
     * @return array<string, mixed>
     */
    public static function editor(ContentBlock $block, string $updateHref): array
    {
        return [
            'id' => $block->id,
            'region' => $block->region,
            'block_type' => $block->block_type,
            'title' => $block->title,
            'body' => $block->body,
            'data_json' => $block->data_json,
            'sort_order' => $block->sort_order,
            'status' => $block->status,
            'update_href' => $updateHref,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function protected(
        ContentBlock $block,
        string $protectionReason,
    ): array {
        return [
            'id' => $block->id,
            'region' => $block->region,
            'block_type' => $block->block_type,
            'title' => $block->title,
            'body' => $block->body,
            'data_json' => $block->data_json,
            'sort_order' => $block->sort_order,
            'status' => $block->status,
            'protection_reason' => $protectionReason,
        ];
    }

    /**
     * @param  iterable<int, ContentBlock>  $contentBlocks
     */
    public static function nextSortOrder(iterable $contentBlocks): int
    {
        $blocks = collect($contentBlocks);

        if ($blocks->isEmpty()) {
            return 1;
        }

        return ((int) $blocks->max('sort_order')) + 1;
    }
}
