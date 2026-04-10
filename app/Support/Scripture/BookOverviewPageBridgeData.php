<?php

namespace App\Support\Scripture;

use App\Models\Page;

class BookOverviewPageBridgeData
{
    /**
     * @return array<string, mixed>|null
     */
    public function adminSelection(?Page $page): ?array
    {
        if (! $page instanceof Page) {
            return null;
        }

        return [
            'id' => $page->id,
            'title' => $page->title,
            'slug' => $page->slug,
            'status' => $page->status,
            'workspace_href' => route('cms.pages.show', $page, false),
            'public_href' => $page->status === 'published'
                ? route('pages.show', $page, false)
                : null,
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function adminOptions(): array
    {
        return Page::query()
            ->orderBy('title')
            ->orderBy('id')
            ->get()
            ->map(fn (Page $page) => $this->adminSelection($page))
            ->filter()
            ->values()
            ->all();
    }

    public function cmsPagesIndexHref(): string
    {
        return route('cms.pages.index', absolute: false);
    }

    public function publicHref(?Page $page): ?string
    {
        if (! $page instanceof Page || $page->status !== 'published') {
            return null;
        }

        return route('pages.show', $page);
    }
}
