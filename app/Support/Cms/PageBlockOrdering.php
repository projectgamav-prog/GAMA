<?php

namespace App\Support\Cms;

use App\Models\PageBlock;
use App\Models\PageContainer;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class PageBlockOrdering
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
        PageContainer $pageContainer,
        array $attributes,
        ?string $insertionMode = null,
        ?PageBlock $relativeBlock = null,
    ): PageBlock {
        return DB::transaction(function () use (
            $pageContainer,
            $attributes,
            $insertionMode,
            $relativeBlock,
        ): PageBlock {
            $orderedBlocks = $this->normalize($pageContainer);
            $sortOrder = $this->resolvedSortOrder(
                $orderedBlocks,
                $insertionMode,
                $relativeBlock,
            );

            $this->shiftFrom($pageContainer, $sortOrder);

            return $pageContainer->pageBlocks()->create([
                ...$attributes,
                'sort_order' => $sortOrder,
            ]);
        });
    }

    public function remove(PageContainer $pageContainer, PageBlock $pageBlock): void
    {
        DB::transaction(function () use ($pageContainer, $pageBlock): void {
            $orderedBlocks = $this->normalize($pageContainer)
                ->reject(
                    fn (PageBlock $block): bool => (int) $block->getKey() === (int) $pageBlock->getKey(),
                )
                ->values();

            $pageBlock->delete();

            $this->persistOrder($orderedBlocks);
        });
    }

    /**
     * @return Collection<int, PageBlock>
     */
    private function normalize(PageContainer $pageContainer): Collection
    {
        $orderedBlocks = $pageContainer->pageBlocks()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $this->persistOrder($orderedBlocks);

        return $orderedBlocks;
    }

    /**
     * @param  Collection<int, PageBlock>  $orderedBlocks
     */
    private function resolvedSortOrder(
        Collection $orderedBlocks,
        ?string $insertionMode,
        ?PageBlock $relativeBlock,
    ): int {
        return match ($insertionMode) {
            'start' => 1,
            'before' => $this->anchorSortOrder($orderedBlocks, $relativeBlock),
            'after' => $this->anchorSortOrder($orderedBlocks, $relativeBlock) + 1,
            'end', null => $orderedBlocks->count() + 1,
            default => $orderedBlocks->count() + 1,
        };
    }

    /**
     * @param  Collection<int, PageBlock>  $orderedBlocks
     */
    private function anchorSortOrder(
        Collection $orderedBlocks,
        ?PageBlock $relativeBlock,
    ): int {
        if (! $relativeBlock instanceof PageBlock) {
            throw new \InvalidArgumentException(
                'A relative block is required for this insertion mode.',
            );
        }

        $resolvedBlock = $orderedBlocks->firstWhere(
            'id',
            (int) $relativeBlock->getKey(),
        );

        if (! $resolvedBlock instanceof PageBlock) {
            throw new \InvalidArgumentException(
                'The relative block was not found during ordering.',
            );
        }

        return (int) $resolvedBlock->sort_order;
    }

    private function shiftFrom(PageContainer $pageContainer, int $sortOrder): void
    {
        $pageContainer->pageBlocks()
            ->where('sort_order', '>=', $sortOrder)
            ->increment('sort_order');
    }

    /**
     * @param  Collection<int, PageBlock>  $orderedBlocks
     */
    private function persistOrder(Collection $orderedBlocks): void
    {
        foreach ($orderedBlocks->values() as $index => $block) {
            $normalizedSortOrder = $index + 1;

            if ((int) $block->sort_order !== $normalizedSortOrder) {
                $block->sort_order = $normalizedSortOrder;
                $block->saveQuietly();
            }

            $block->sort_order = $normalizedSortOrder;
        }
    }
}
