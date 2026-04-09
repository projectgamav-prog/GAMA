<?php

namespace App\Support\ContentBlocks;

use App\Models\ContentBlock;

class PublicContentBlockData
{
    /**
     * @param  iterable<int, ContentBlock>  $blocks
     * @return list<array<string, mixed>>
     */
    public function contentBlocks(iterable $blocks): array
    {
        return collect($blocks)
            ->map(fn (ContentBlock $block) => $this->contentBlock($block))
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public function contentBlock(ContentBlock $block): array
    {
        return [
            'id' => $block->id,
            'region' => $block->region,
            'block_type' => $block->block_type,
            'title' => $block->title,
            'body' => $block->body,
            'data_json' => $block->data_json,
            'sort_order' => $block->sort_order,
        ];
    }
}
