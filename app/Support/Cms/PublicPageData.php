<?php

namespace App\Support\Cms;

use App\Models\Page;
use App\Models\PageBlock;
use App\Models\PageContainer;

class PublicPageData
{
    /**
     * @param  iterable<int, Page>  $pages
     * @return list<array<string, mixed>>
     */
    public function adminIndexEntries(iterable $pages): array
    {
        return collect($pages)
            ->map(fn (Page $page) => $this->adminIndexEntry($page))
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public function adminIndexEntry(Page $page): array
    {
        return [
            'id' => $page->id,
            'title' => $page->title,
            'slug' => $page->slug,
            'status' => $page->status,
            'layout_key' => $page->layout_key,
            'workspace_href' => route('cms.pages.show', $page, false),
            'public_href' => route('pages.show', $page, false),
            'container_count' => $this->containerCount($page),
            'block_count' => $this->blockCount($page),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function adminPage(Page $page): array
    {
        return [
            ...$this->adminIndexEntry($page),
            'created_at' => $page->created_at?->toAtomString(),
            'updated_at' => $page->updated_at?->toAtomString(),
            'destroy_href' => route('cms.pages.destroy', $page, false),
            'container_store_href' => route('cms.pages.containers.store', $page, false),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function publicPage(Page $page): array
    {
        return [
            'id' => $page->id,
            'title' => $page->title,
            'slug' => $page->slug,
            'layout_key' => $page->layout_key,
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function adminContainers(Page $page): array
    {
        $orderedContainers = collect(
            $page->relationLoaded('pageContainers') ? $page->pageContainers : [],
        )->values();
        $containerCount = $orderedContainers->count();

        return $orderedContainers
            ->map(fn (PageContainer $pageContainer, int $index) => $this->adminContainer(
                $page,
                $pageContainer,
                $index,
                $containerCount,
            ))
            ->values()
            ->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function publicContainers(Page $page): array
    {
        return collect(
            $page->relationLoaded('pageContainers') ? $page->pageContainers : [],
        )
            ->map(fn (PageContainer $pageContainer) => $this->publicContainer($pageContainer))
            ->values()
            ->all();
    }

    private function containerCount(Page $page): int
    {
        $count = $page->getAttribute('page_containers_count');

        if (is_numeric($count)) {
            return (int) $count;
        }

        if ($page->relationLoaded('pageContainers')) {
            return $page->pageContainers->count();
        }

        return $page->pageContainers()->count();
    }

    private function blockCount(Page $page): int
    {
        $count = $page->getAttribute('page_blocks_count');

        if (is_numeric($count)) {
            return (int) $count;
        }

        if ($page->relationLoaded('pageContainers')) {
            return $page->pageContainers
                ->sum(fn (PageContainer $pageContainer) => $pageContainer->relationLoaded('pageBlocks')
                    ? $pageContainer->pageBlocks->count()
                    : $pageContainer->pageBlocks()->count());
        }

        return $page->pageBlocks()->count();
    }

    /**
     * @return array<string, mixed>
     */
    private function adminContainer(
        Page $page,
        PageContainer $pageContainer,
        int $index,
        int $containerCount,
    ): array {
        $orderedBlocks = collect(
            $pageContainer->relationLoaded('pageBlocks')
                ? $pageContainer->pageBlocks
                : [],
        )->values();
        $blockCount = $orderedBlocks->count();

        return [
            'id' => $pageContainer->id,
            'label' => $pageContainer->label,
            'container_type' => $pageContainer->container_type,
            'sort_order' => $pageContainer->sort_order,
            'update_href' => route('cms.pages.containers.update', [
                'page' => $page,
                'pageContainer' => $pageContainer,
            ], false),
            'destroy_href' => route('cms.pages.containers.destroy', [
                'page' => $page,
                'pageContainer' => $pageContainer,
            ], false),
            'move_up_href' => $index > 0
                ? route('cms.pages.containers.move-up', [
                    'page' => $page,
                    'pageContainer' => $pageContainer,
                ], false)
                : null,
            'move_down_href' => $index < ($containerCount - 1)
                ? route('cms.pages.containers.move-down', [
                    'page' => $page,
                    'pageContainer' => $pageContainer,
                ], false)
                : null,
            'block_store_href' => route('cms.pages.containers.blocks.store', [
                'page' => $page,
                'pageContainer' => $pageContainer,
            ], false),
            'blocks' => $orderedBlocks
                ->map(fn (PageBlock $pageBlock, int $blockIndex) => $this->adminBlock(
                    $page,
                    $pageContainer,
                    $pageBlock,
                    $blockIndex,
                    $blockCount,
                ))
                ->values()
                ->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function publicContainer(PageContainer $pageContainer): array
    {
        return [
            'id' => $pageContainer->id,
            'label' => $pageContainer->label,
            'container_type' => $pageContainer->container_type,
            'sort_order' => $pageContainer->sort_order,
            'blocks' => collect(
                $pageContainer->relationLoaded('pageBlocks')
                    ? $pageContainer->pageBlocks
                    : [],
            )
                ->map(fn (PageBlock $pageBlock) => $this->publicBlock($pageBlock))
                ->values()
                ->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function adminBlock(
        Page $page,
        PageContainer $pageContainer,
        PageBlock $pageBlock,
        int $index,
        int $blockCount,
    ): array {
        return [
            'id' => $pageBlock->id,
            'module_key' => $pageBlock->module_key,
            'data_json' => $pageBlock->data_json,
            'config_json' => $pageBlock->config_json,
            'sort_order' => $pageBlock->sort_order,
            'update_href' => route('cms.pages.containers.blocks.update', [
                'page' => $page,
                'pageContainer' => $pageContainer,
                'pageBlock' => $pageBlock,
            ], false),
            'destroy_href' => route('cms.pages.containers.blocks.destroy', [
                'page' => $page,
                'pageContainer' => $pageContainer,
                'pageBlock' => $pageBlock,
            ], false),
            'move_up_href' => $index > 0
                ? route('cms.pages.containers.blocks.move-up', [
                    'page' => $page,
                    'pageContainer' => $pageContainer,
                    'pageBlock' => $pageBlock,
                ], false)
                : null,
            'move_down_href' => $index < ($blockCount - 1)
                ? route('cms.pages.containers.blocks.move-down', [
                    'page' => $page,
                    'pageContainer' => $pageContainer,
                    'pageBlock' => $pageBlock,
                ], false)
                : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function publicBlock(PageBlock $pageBlock): array
    {
        return [
            'id' => $pageBlock->id,
            'module_key' => $pageBlock->module_key,
            'data_json' => $pageBlock->data_json,
            'config_json' => $pageBlock->config_json,
            'sort_order' => $pageBlock->sort_order,
        ];
    }
}
