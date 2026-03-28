<?php

namespace App\Support\Scripture\Admin;

use App\Models\ContentBlock;
use Illuminate\Support\Collection;

class PrimaryPublishedEditableContentBlock
{
    /**
     * Resolve a single clear primary published editable block for intro use.
     *
     * @param  Collection<int, ContentBlock>  $contentBlocks
     * @param  callable(ContentBlock): bool  $isEditableBlock
     */
    public static function resolve(
        Collection $contentBlocks,
        callable $isEditableBlock,
        string $preferredRegion = 'overview',
    ): ?ContentBlock {
        $editableBlocks = $contentBlocks
            ->filter(fn (ContentBlock $block) => $isEditableBlock($block))
            ->values();

        if ($editableBlocks->isEmpty()) {
            return null;
        }

        $preferredRegionBlocks = $editableBlocks
            ->filter(
                fn (ContentBlock $block) => $block->region === $preferredRegion,
            )
            ->values();

        if ($preferredRegionBlocks->count() === 1) {
            return $preferredRegionBlocks->first();
        }

        return $editableBlocks->count() === 1
            ? $editableBlocks->first()
            : null;
    }
}
