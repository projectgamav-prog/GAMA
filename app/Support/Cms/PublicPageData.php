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
            'workspace_href' => route('cms.pages.show', $page),
            'public_href' => route('pages.show', $page),
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
            'container_store_href' => route('cms.pages.containers.store', $page),
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
        return collect(
            $page->relationLoaded('pageContainers') ? $page->pageContainers : [],
        )
            ->map(fn (PageContainer $pageContainer) => $this->adminContainer($page, $pageContainer))
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
    private function adminContainer(Page $page, PageContainer $pageContainer): array
    {
        return [
            'id' => $pageContainer->id,
            'label' => $pageContainer->label,
            'container_type' => $pageContainer->container_type,
            'sort_order' => $pageContainer->sort_order,
            'update_href' => route('cms.pages.containers.update', [
                'page' => $page,
                'pageContainer' => $pageContainer,
            ]),
            'destroy_href' => route('cms.pages.containers.destroy', [
                'page' => $page,
                'pageContainer' => $pageContainer,
            ]),
            'block_store_href' => route('cms.pages.containers.blocks.store', [
                'page' => $page,
                'pageContainer' => $pageContainer,
            ]),
            'blocks' => collect(
                $pageContainer->relationLoaded('pageBlocks')
                    ? $pageContainer->pageBlocks
                    : [],
            )
                ->map(fn (PageBlock $pageBlock) => $this->adminBlock(
                    $page,
                    $pageContainer,
                    $pageBlock,
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
            ]),
            'destroy_href' => route('cms.pages.containers.blocks.destroy', [
                'page' => $page,
                'pageContainer' => $pageContainer,
                'pageBlock' => $pageBlock,
            ]),
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
