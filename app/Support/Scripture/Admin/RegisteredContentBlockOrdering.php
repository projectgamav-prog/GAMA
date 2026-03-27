<?php

namespace App\Support\Scripture\Admin;

use App\Models\ContentBlock;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * Shared ordering service for live scripture content blocks.
 *
 * Current rules:
 * - normalize persisted order before every structural mutation
 * - allow create via explicit sort order or contextual insertion modes
 * - moveBefore/moveAfter assume the caller already chose a safe visible anchor
 * - remove closes ordering gaps immediately after deletion
 */
class RegisteredContentBlockOrdering
{
    /**
     * @return list<string>
     */
    public static function insertionModes(): array
    {
        return ['start', 'before', 'after', 'end'];
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(
        Model $owner,
        array $attributes,
        ?string $insertionMode = null,
        ?ContentBlock $relativeBlock = null,
    ): ContentBlock {
        return DB::transaction(function () use (
            $owner,
            $attributes,
            $insertionMode,
            $relativeBlock,
        ): ContentBlock {
            $orderedBlocks = $this->normalize($owner);
            $sortOrder = $this->resolvedSortOrder(
                $orderedBlocks,
                $attributes['sort_order'] ?? null,
                $insertionMode,
                $relativeBlock,
            );

            $this->shiftFrom($owner, $sortOrder);

            return $owner->contentBlocks()->create([
                ...$attributes,
                'sort_order' => $sortOrder,
            ]);
        });
    }

    public function moveBefore(
        Model $owner,
        ContentBlock $contentBlock,
        ContentBlock $anchorBlock,
    ): ContentBlock {
        return DB::transaction(function () use (
            $owner,
            $contentBlock,
            $anchorBlock,
        ): ContentBlock {
            $orderedBlocks = $this->normalize($owner)->values();
            $movingBlock = $this->extractBlock($orderedBlocks, $contentBlock);
            $anchorIndex = $this->blockIndex($orderedBlocks, $anchorBlock);
            $reorderedBlocks = $orderedBlocks->values()->all();

            array_splice($reorderedBlocks, $anchorIndex, 0, [$movingBlock]);

            $this->persistOrder(new Collection($reorderedBlocks));

            return $contentBlock->refresh();
        });
    }

    public function moveAfter(
        Model $owner,
        ContentBlock $contentBlock,
        ContentBlock $anchorBlock,
    ): ContentBlock {
        return DB::transaction(function () use (
            $owner,
            $contentBlock,
            $anchorBlock,
        ): ContentBlock {
            $orderedBlocks = $this->normalize($owner)->values();
            $movingBlock = $this->extractBlock($orderedBlocks, $contentBlock);
            $anchorIndex = $this->blockIndex($orderedBlocks, $anchorBlock);
            $reorderedBlocks = $orderedBlocks->values()->all();

            array_splice($reorderedBlocks, $anchorIndex + 1, 0, [$movingBlock]);

            $this->persistOrder(new Collection($reorderedBlocks));

            return $contentBlock->refresh();
        });
    }

    public function remove(
        Model $owner,
        ContentBlock $contentBlock,
    ): void {
        DB::transaction(function () use ($owner, $contentBlock): void {
            $orderedBlocks = $this->normalize($owner)
                ->reject(
                    fn (ContentBlock $block): bool => (int) $block->getKey() === (int) $contentBlock->getKey(),
                )
                ->values();

            $contentBlock->delete();

            $this->persistOrder($orderedBlocks);
        });
    }

    /**
     * @return Collection<int, ContentBlock>
     */
    private function normalize(Model $owner): Collection
    {
        $orderedBlocks = $owner->contentBlocks()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $this->persistOrder($orderedBlocks);

        return $orderedBlocks;
    }

    /**
     * @param  Collection<int, ContentBlock>  $orderedBlocks
     */
    private function resolvedSortOrder(
        Collection $orderedBlocks,
        mixed $requestedSortOrder,
        ?string $insertionMode,
        ?ContentBlock $relativeBlock,
    ): int {
        // Contextual insertion keeps public-page block creation aligned with
        // what the editor selected on the page.
        if ($insertionMode === null) {
            return $this->clampedSortOrder(
                $requestedSortOrder,
                $orderedBlocks->count(),
            );
        }

        return match ($insertionMode) {
            'start' => 1,
            'before' => $this->anchorSortOrder($orderedBlocks, $relativeBlock),
            'after' => $this->anchorSortOrder($orderedBlocks, $relativeBlock) + 1,
            'end' => $orderedBlocks->count() + 1,
            default => $orderedBlocks->count() + 1,
        };
    }

    /**
     * @param  Collection<int, ContentBlock>  $orderedBlocks
     */
    private function anchorSortOrder(
        Collection $orderedBlocks,
        ?ContentBlock $relativeBlock,
    ): int {
        if (! $relativeBlock instanceof ContentBlock) {
            throw new \InvalidArgumentException(
                'A relative content block is required for this insertion mode.',
            );
        }

        $resolvedBlock = $orderedBlocks->firstWhere(
            'id',
            (int) $relativeBlock->getKey(),
        );

        if (! $resolvedBlock instanceof ContentBlock) {
            throw new \InvalidArgumentException(
                'The relative content block was not found during ordering.',
            );
        }

        return (int) $resolvedBlock->sort_order;
    }

    private function clampedSortOrder(
        mixed $requestedSortOrder,
        int $currentCount,
    ): int {
        $sortOrder = filter_var(
            $requestedSortOrder,
            FILTER_VALIDATE_INT,
            [
                'options' => [
                    'default' => $currentCount + 1,
                ],
            ],
        );

        return max(1, min((int) $sortOrder, $currentCount + 1));
    }

    private function shiftFrom(Model $owner, int $sortOrder): void
    {
        $owner->contentBlocks()
            ->where('sort_order', '>=', $sortOrder)
            ->increment('sort_order');
    }

    /**
     * @param  Collection<int, ContentBlock>  $orderedBlocks
     */
    private function persistOrder(Collection $orderedBlocks): void
    {
        // Every structural operation rewrites the sequence to contiguous
        // 1-based sort_order values so later create/move operations stay
        // predictable for the live page and full-edit fallback alike.
        foreach ($orderedBlocks->values() as $index => $block) {
            $normalizedSortOrder = $index + 1;

            if ((int) $block->sort_order !== $normalizedSortOrder) {
                $block->sort_order = $normalizedSortOrder;
                $block->saveQuietly();
            }

            $block->sort_order = $normalizedSortOrder;
        }
    }

    /**
     * @param  Collection<int, ContentBlock>  $orderedBlocks
     */
    private function extractBlock(
        Collection &$orderedBlocks,
        ContentBlock $contentBlock,
    ): ContentBlock {
        $contentBlockIndex = $this->blockIndex($orderedBlocks, $contentBlock);
        $movingBlock = $orderedBlocks->pull($contentBlockIndex);

        if (! $movingBlock instanceof ContentBlock) {
            throw new \InvalidArgumentException(
                'The content block was not found during reordering.',
            );
        }

        return $movingBlock;
    }

    /**
     * @param  Collection<int, ContentBlock>  $orderedBlocks
     */
    private function blockIndex(
        Collection $orderedBlocks,
        ContentBlock $contentBlock,
    ): int {
        $index = $orderedBlocks
            ->values()
            ->search(
                fn (ContentBlock $candidate): bool => (int) $candidate->getKey() === (int) $contentBlock->getKey(),
            );

        if (! is_int($index)) {
            throw new \InvalidArgumentException(
                'The content block was not found during reordering.',
            );
        }

        return $index;
    }
}
