<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Support\Cms\PublicPageData;
use App\Support\ContentBlocks\PublicContentBlockData;
use Inertia\Inertia;
use Inertia\Response;

class PageWorkspaceController extends Controller
{
    /**
     * Display the authenticated CMS page workspace.
     */
    public function index(PublicPageData $publicPageData): Response
    {
        $pages = Page::query()
            ->withCount([
                'contentBlocks',
                'contentBlocks as published_content_blocks_count' => fn ($query) => $query->published(),
            ])
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->get();

        return Inertia::render('cms/pages/index', [
            'pages' => $publicPageData->adminIndexEntries($pages),
            'page_count' => $pages->count(),
            'published_page_count' => $pages
                ->where('status', 'published')
                ->count(),
        ]);
    }

    /**
     * Display the authenticated workspace for a single CMS page.
     */
    public function show(
        Page $page,
        PublicPageData $publicPageData,
        PublicContentBlockData $publicContentBlockData,
    ): Response {
        $page->load([
            'contentBlocks' => fn ($query) => $query->orderBy('sort_order'),
        ]);

        return Inertia::render('cms/pages/show', [
            'page' => $publicPageData->adminPage($page),
            'content_blocks' => $publicContentBlockData->contentBlocks(
                $page->contentBlocks
                    ->where('status', 'published')
                    ->values(),
            ),
        ]);
    }
}
