<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ContentBlock;
use App\Support\Scripture\Admin\ChapterAdminRouteContext;
use App\Support\Scripture\PublicScriptureData;
use Inertia\Inertia;
use Inertia\Response;

class ChapterFullEditController extends Controller
{
    /**
     * Render the deeper protected chapter editor surface.
     */
    public function show(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        PublicScriptureData $publicScriptureData,
    ): Response {
        $contentBlocks = $chapter->contentBlocks()
            ->get();
        $adminRouteContext = new ChapterAdminRouteContext($book, $bookSection, $chapter);
        $editableNoteBlocks = $contentBlocks
            ->filter(fn (ContentBlock $block) => $adminRouteContext->isEditableNoteBlock($block))
            ->values();
        $nextContentBlockSortOrder = $contentBlocks->isEmpty()
            ? 1
            : ((int) $contentBlocks->max('sort_order')) + 1;

        return Inertia::render('scripture/chapters/full-edit', [
            'book' => $publicScriptureData->book($book),
            'book_section' => $publicScriptureData->bookSection($book, $bookSection),
            'chapter' => [
                ...$publicScriptureData->chapter($book, $bookSection, $chapter),
                'admin_full_edit_href' => $adminRouteContext->fullEditHref(),
            ],
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
