<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Topic;
use App\Support\AdminContext\AdminContext;
use App\Support\Scripture\Admin\TopicAdminRouteContext;
use App\Support\Scripture\PublicScriptureData;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TopicController extends Controller
{
    /**
     * Display the public topics browse page.
     */
    public function index(PublicScriptureData $publicScriptureData): Response
    {
        $topics = Topic::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->orderBy('id')
            ->get();

        return Inertia::render('scripture/topics/index', [
            'topics' => $publicScriptureData->topicEntries($topics),
        ]);
    }

    /**
     * Display a public topic page.
     */
    public function show(
        Request $request,
        Topic $topic,
        PublicScriptureData $publicScriptureData,
    ): Response {
        $topic->load([
            'verseAssignments' => fn ($query) => $query->with([
                'verse.chapterSection.chapter.bookSection.book',
            ]),
        ]);

        $contentBlocks = $topic->contentBlocks()
            ->published()
            ->get();
        $adminVisibilityEnabled = AdminContext::isVisible($request);
        $adminRouteContext = new TopicAdminRouteContext($topic);

        return Inertia::render('scripture/topics/show', [
            'topic' => $publicScriptureData->topic($topic),
            'related_verses' => $publicScriptureData->topicRelatedVerses(
                $topic->verseAssignments,
            ),
            'content_blocks' => $publicScriptureData->contentBlocks($contentBlocks),
            'admin' => $adminVisibilityEnabled
                ? [
                    'details_update_href' => $adminRouteContext->detailsUpdateHref(),
                    'full_edit_href' => $adminRouteContext->fullEditHref(),
                    'content_block_update_hrefs' => $contentBlocks
                        ->filter(fn ($block) => $adminRouteContext->isEditableNoteBlock($block))
                        ->mapWithKeys(fn ($block) => [
                            (string) $block->id => $adminRouteContext->contentBlockUpdateHref($block),
                        ])
                        ->all(),
                ]
                : null,
        ]);
    }
}
