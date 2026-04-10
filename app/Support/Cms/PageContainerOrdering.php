<?php

namespace App\Support\Cms;

use App\Models\Page;
use App\Models\PageContainer;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class PageContainerOrdering
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
        Page $page,
        array $attributes,
        ?string $insertionMode = null,
        ?PageContainer $relativeContainer = null,
    ): PageContainer {
        return DB::transaction(function () use (
            $page,
            $attributes,
            $insertionMode,
            $relativeContainer,
        ): PageContainer {
            $orderedContainers = $this->normalize($page);
            $sortOrder = $this->resolvedSortOrder(
                $orderedContainers,
                $insertionMode,
                $relativeContainer,
            );

            $this->shiftFrom($page, $sortOrder);

            return $page->pageContainers()->create([
                ...$attributes,
                'sort_order' => $sortOrder,
            ]);
        });
    }

    public function remove(Page $page, PageContainer $pageContainer): void
    {
        DB::transaction(function () use ($page, $pageContainer): void {
            $orderedContainers = $this->normalize($page)
                ->reject(
                    fn (PageContainer $container): bool => (int) $container->getKey() === (int) $pageContainer->getKey(),
                )
                ->values();

            $pageContainer->delete();

            $this->persistOrder($orderedContainers);
        });
    }

    public function moveUp(Page $page, PageContainer $pageContainer): bool
    {
        return $this->move($page, $pageContainer, 'up');
    }

    public function moveDown(Page $page, PageContainer $pageContainer): bool
    {
        return $this->move($page, $pageContainer, 'down');
    }

    /**
     * @return Collection<int, PageContainer>
     */
    private function normalize(Page $page): Collection
    {
        $orderedContainers = $page->pageContainers()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $this->persistOrder($orderedContainers);

        return $orderedContainers;
    }

    /**
     * @param  Collection<int, PageContainer>  $orderedContainers
     */
    private function resolvedSortOrder(
        Collection $orderedContainers,
        ?string $insertionMode,
        ?PageContainer $relativeContainer,
    ): int {
        return match ($insertionMode) {
            'start' => 1,
            'before' => $this->anchorSortOrder($orderedContainers, $relativeContainer),
            'after' => $this->anchorSortOrder($orderedContainers, $relativeContainer) + 1,
            'end', null => $orderedContainers->count() + 1,
            default => $orderedContainers->count() + 1,
        };
    }

    /**
     * @param  Collection<int, PageContainer>  $orderedContainers
     */
    private function anchorSortOrder(
        Collection $orderedContainers,
        ?PageContainer $relativeContainer,
    ): int {
        if (! $relativeContainer instanceof PageContainer) {
            throw new \InvalidArgumentException(
                'A relative container is required for this insertion mode.',
            );
        }

        $resolvedContainer = $orderedContainers->firstWhere(
            'id',
            (int) $relativeContainer->getKey(),
        );

        if (! $resolvedContainer instanceof PageContainer) {
            throw new \InvalidArgumentException(
                'The relative container was not found during ordering.',
            );
        }

        return (int) $resolvedContainer->sort_order;
    }

    private function shiftFrom(Page $page, int $sortOrder): void
    {
        $page->pageContainers()
            ->where('sort_order', '>=', $sortOrder)
            ->increment('sort_order');
    }

    private function move(
        Page $page,
        PageContainer $pageContainer,
        string $direction,
    ): bool {
        return DB::transaction(function () use ($page, $pageContainer, $direction): bool {
            $orderedContainers = $this->normalize($page)
                ->values();
            $currentIndex = $orderedContainers->search(
                fn (PageContainer $container): bool => (int) $container->getKey() === (int) $pageContainer->getKey(),
            );

            if (! is_int($currentIndex)) {
                return false;
            }

            $targetIndex = $direction === 'up'
                ? $currentIndex - 1
                : $currentIndex + 1;

            if (! $orderedContainers->has($targetIndex)) {
                return false;
            }

            $currentContainer = $orderedContainers->get($currentIndex);
            $targetContainer = $orderedContainers->get($targetIndex);

            if (! $currentContainer instanceof PageContainer
                || ! $targetContainer instanceof PageContainer) {
                return false;
            }

            $orderedContainers->put($currentIndex, $targetContainer);
            $orderedContainers->put($targetIndex, $currentContainer);

            $this->persistOrder($orderedContainers);

            return true;
        });
    }

    /**
     * @param  Collection<int, PageContainer>  $orderedContainers
     */
    private function persistOrder(Collection $orderedContainers): void
    {
        foreach ($orderedContainers->values() as $index => $container) {
            $normalizedSortOrder = $index + 1;

            if ((int) $container->sort_order !== $normalizedSortOrder) {
                $container->sort_order = $normalizedSortOrder;
                $container->saveQuietly();
            }

            $container->sort_order = $normalizedSortOrder;
        }
    }
}
