<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Support\Cms\PublicPageData;
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
                'pageContainers',
                'pageBlocks',
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
    ): Response {
        $page->load([
            'pageContainers' => fn ($query) => $query
                ->orderBy('sort_order')
                ->with([
                    'pageBlocks' => fn ($blockQuery) => $blockQuery
                        ->orderBy('sort_order')
                        ->orderBy('id'),
                ]),
        ]);

        return Inertia::render('cms/pages/show', [
            'page' => $publicPageData->adminPage($page),
            'containers' => $publicPageData->adminContainers($page),
        ]);
    }
}
