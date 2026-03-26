<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\ContentBlock;
use App\Models\Topic;
use App\Support\Scripture\Admin\TopicAdminRouteContext;
use App\Support\Scripture\PublicScriptureData;
use Inertia\Inertia;
use Inertia\Response;

class TopicFullEditController extends Controller
{
    /**
     * Render the deeper protected topic editor surface.
     */
    public function show(
        Topic $topic,
        PublicScriptureData $publicScriptureData,
    ): Response {
        $contentBlocks = $topic->contentBlocks()
            ->get();
        $adminRouteContext = new TopicAdminRouteContext($topic);
        $editableNoteBlocks = $contentBlocks
            ->filter(fn (ContentBlock $block) => $adminRouteContext->isEditableNoteBlock($block))
            ->values();
        $nextContentBlockSortOrder = $contentBlocks->isEmpty()
            ? 1
            : ((int) $contentBlocks->max('sort_order')) + 1;

        return Inertia::render('scripture/topics/full-edit', [
            'topic' => [
                ...$publicScriptureData->topic($topic),
                'admin_full_edit_href' => $adminRouteContext->fullEditHref(),
            ],
            'admin_details_update_href' => $adminRouteContext->detailsUpdateHref(),
            'admin_content_block_store_href' => $adminRouteContext->contentBlockStoreHref(),
            'next_content_block_sort_order' => $nextContentBlockSortOrder,
            'admin_content_blocks' => $editableNoteBlocks
                ->map(fn (ContentBlock $block) => [
                    'id' => $block->id,
                    'region' => $block->region,
                    'block_type' => $block->block_type,
                    'title' => $block->title,
                    'body' => $block->body,
                    'data_json' => $block->data_json,
                    'sort_order' => $block->sort_order,
                    'status' => $block->status,
                    'update_href' => $adminRouteContext->contentBlockUpdateHref($block),
                ])
                ->all(),
        ]);
    }
}
