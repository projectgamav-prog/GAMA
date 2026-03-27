<?php

namespace App\Support\Scripture\Admin;

use App\Models\ContentBlock;
use Illuminate\Support\Collection;

/**
 * Builds the live public-page content-block capability maps from shared rules.
 *
 * Controllers stay responsible for deciding which owner/route context is in
 * scope, while this builder keeps the capability payload shape consistent
 * across books, chapters, and verses.
 */
class ContentBlockCapabilityPayload
{
    /**
     * @param  Collection<int, ContentBlock>  $contentBlocks
     * @param  callable(ContentBlock): bool  $isEditable
     * @param  callable(ContentBlock): bool  $isDuplicable
     * @param  callable(ContentBlock): string  $updateHref
     * @param  callable(ContentBlock): string  $moveUpHref
     * @param  callable(ContentBlock): string  $moveDownHref
     * @param  callable(ContentBlock): string  $reorderHref
     * @param  callable(ContentBlock): string  $duplicateHref
     * @param  callable(ContentBlock): string  $deleteHref
     * @return array<string, array<string, string>>
     */
    public static function build(
        Collection $contentBlocks,
        VisibleContentBlockSequence $visibleSequence,
        callable $isEditable,
        callable $isDuplicable,
        callable $updateHref,
        callable $moveUpHref,
        callable $moveDownHref,
        callable $reorderHref,
        callable $duplicateHref,
        callable $deleteHref,
    ): array {
        $editableBlocks = $contentBlocks
            ->filter(fn (ContentBlock $block): bool => $isEditable($block))
            ->values();

        return [
            'content_block_update_hrefs' => $editableBlocks
                ->mapWithKeys(fn (ContentBlock $block) => [
                    (string) $block->id => $updateHref($block),
                ])
                ->all(),
            'content_block_move_up_hrefs' => $editableBlocks
                ->filter(
                    fn (ContentBlock $block): bool => $visibleSequence->previousInSameRegion($block) instanceof ContentBlock,
                )
                ->mapWithKeys(fn (ContentBlock $block) => [
                    (string) $block->id => $moveUpHref($block),
                ])
                ->all(),
            'content_block_move_down_hrefs' => $editableBlocks
                ->filter(
                    fn (ContentBlock $block): bool => $visibleSequence->nextInSameRegion($block) instanceof ContentBlock,
                )
                ->mapWithKeys(fn (ContentBlock $block) => [
                    (string) $block->id => $moveDownHref($block),
                ])
                ->all(),
            'content_block_reorder_hrefs' => $editableBlocks
                ->mapWithKeys(fn (ContentBlock $block) => [
                    (string) $block->id => $reorderHref($block),
                ])
                ->all(),
            'content_block_duplicate_hrefs' => $editableBlocks
                ->filter(fn (ContentBlock $block): bool => $isDuplicable($block))
                ->mapWithKeys(fn (ContentBlock $block) => [
                    (string) $block->id => $duplicateHref($block),
                ])
                ->all(),
            'content_block_delete_hrefs' => $editableBlocks
                ->mapWithKeys(fn (ContentBlock $block) => [
                    (string) $block->id => $deleteHref($block),
                ])
                ->all(),
        ];
    }
}
