<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Topic;
use App\Support\Scripture\PublicScriptureData;
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

        return Inertia::render('scripture/topics/show', [
            'topic' => $publicScriptureData->topic($topic),
            'related_verses' => $publicScriptureData->topicRelatedVerses(
                $topic->verseAssignments,
            ),
            'content_blocks' => $publicScriptureData->contentBlocks($contentBlocks),
            'admin' => null,
        ]);
    }
}
