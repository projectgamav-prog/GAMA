<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\ContentBlock;
use App\Models\Verse;
use App\Support\Scripture\Admin\VerseAdminRouteContext;
use App\Support\Scripture\PublicScriptureData;
use Inertia\Inertia;
use Inertia\Response;

class VerseFullEditController extends Controller
{
    /**
     * Render the deeper protected verse editor surface.
     */
    public function show(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        Verse $verse,
        PublicScriptureData $publicScriptureData,
    ): Response {
        $verse->load('verseMeta');

        $contentBlocks = $verse->contentBlocks()
            ->get();
        $adminRouteContext = new VerseAdminRouteContext(
            $book,
            $bookSection,
            $chapter,
            $chapterSection,
            $verse,
        );
        $editableNoteBlocks = $contentBlocks
            ->filter(fn (ContentBlock $block) => $adminRouteContext->isEditableNoteBlock($block))
            ->values();

        return Inertia::render('scripture/chapters/verses/full-edit', [
            'book' => $publicScriptureData->book($book),
            'book_section' => $publicScriptureData->bookSection($book, $bookSection),
            'chapter' => $publicScriptureData->chapter($book, $bookSection, $chapter),
            'chapter_section' => $publicScriptureData->chapterSection(
                $book,
                $bookSection,
                $chapter,
                $chapterSection,
            ),
            'verse' => [
                ...$publicScriptureData->verse(
                    $verse,
                    $adminRouteContext->verseHref(),
                ),
                'admin_full_edit_href' => $adminRouteContext->fullEditHref(),
            ],
            'verse_meta' => $publicScriptureData->verseMeta($verse->verseMeta),
            'admin_meta_update_href' => $adminRouteContext->metaUpdateHref(),
            'admin_content_block_store_href' => $adminRouteContext->contentBlockStoreHref(),
            'admin_content_blocks' => $editableNoteBlocks
                ->map(fn ($block) => [
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
                ->values()
                ->all(),
        ]);
    }
}
