<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Character;
use App\Models\ContentBlock;
use App\Support\Scripture\Admin\CharacterAdminRouteContext;
use App\Support\Scripture\PublicScriptureData;
use Inertia\Inertia;
use Inertia\Response;

class CharacterFullEditController extends Controller
{
    /**
     * Render the deeper protected character editor surface.
     */
    public function show(
        Character $character,
        PublicScriptureData $publicScriptureData,
    ): Response {
        $contentBlocks = $character->contentBlocks()
            ->get();
        $adminRouteContext = new CharacterAdminRouteContext($character);
        $editableNoteBlocks = $contentBlocks
            ->filter(fn (ContentBlock $block) => $adminRouteContext->isEditableNoteBlock($block))
            ->values();
        $nextContentBlockSortOrder = $contentBlocks->isEmpty()
            ? 1
            : ((int) $contentBlocks->max('sort_order')) + 1;

        return Inertia::render('scripture/characters/full-edit', [
            'character' => [
                ...$publicScriptureData->character($character),
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
