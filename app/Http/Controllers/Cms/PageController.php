<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Support\Cms\PublicPageData;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    /**
     * Display the public CMS page shell.
     */
    public function show(
        Page $page,
        PublicPageData $publicPageData,
    ): Response {
        abort_unless($page->status === 'published', 404);

        $page->load([
            'pageContainers' => fn ($query) => $query
                ->orderBy('sort_order')
                ->with([
                    'pageBlocks' => fn ($blockQuery) => $blockQuery
                        ->orderBy('sort_order')
                        ->orderBy('id'),
                ]),
        ]);

        return Inertia::render('cms/pages/public-show', [
            'page' => $publicPageData->publicPage($page),
            'containers' => $publicPageData->publicContainers($page),
        ]);
    }
}
