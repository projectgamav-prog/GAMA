<?php

namespace App\Support\Scripture\Admin;

use App\Models\ContentBlock;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class RegisteredContentBlockOrdering
{
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

    /**
     * @return Collection<int, ContentBlock>
     */
    private function normalize(Model $owner): Collection
    {
        $orderedBlocks = $owner->contentBlocks()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        foreach ($orderedBlocks as $index => $block) {
            $normalizedSortOrder = $index + 1;

            if ((int) $block->sort_order !== $normalizedSortOrder) {
                $block->sort_order = $normalizedSortOrder;
                $block->saveQuietly();
            }

            $block->sort_order = $normalizedSortOrder;
        }

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
}
