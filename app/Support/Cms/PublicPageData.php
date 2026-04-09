<?php

namespace App\Support\Cms;

use App\Models\Page;

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
            'content_block_count' => $this->contentBlockCount($page),
            'published_content_block_count' => $this->publishedContentBlockCount($page),
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

    private function contentBlockCount(Page $page): int
    {
        $count = $page->getAttribute('content_blocks_count');

        if (is_numeric($count)) {
            return (int) $count;
        }

        if ($page->relationLoaded('contentBlocks')) {
            return $page->contentBlocks->count();
        }

        return $page->contentBlocks()->count();
    }

    private function publishedContentBlockCount(Page $page): int
    {
        $count = $page->getAttribute('published_content_blocks_count');

        if (is_numeric($count)) {
            return (int) $count;
        }

        if ($page->relationLoaded('contentBlocks')) {
            return $page->contentBlocks
                ->where('status', 'published')
                ->count();
        }

        return $page->contentBlocks()
            ->published()
            ->count();
    }
}
