<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Support\Cms\PublicPageData;
use App\Support\ContentBlocks\PublicContentBlockData;
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
        PublicContentBlockData $publicContentBlockData,
    ): Response {
        abort_unless($page->status === 'published', 404);

        $contentBlocks = $page->contentBlocks()
            ->published()
            ->get();

        return Inertia::render('cms/pages/public-show', [
            'page' => $publicPageData->publicPage($page),
            'content_blocks' => $publicContentBlockData->contentBlocks($contentBlocks),
        ]);
    }
}
