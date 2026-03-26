<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\Verse;
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
                    route('scripture.chapters.verses.show', [
                        'book' => $book,
                        'bookSection' => $bookSection,
                        'chapter' => $chapter,
                        'chapterSection' => $chapterSection,
                        'verse' => $verse,
                    ]),
                ),
                'admin_full_edit_href' => route('scripture.chapters.verses.admin.full-edit', [
                    'book' => $book,
                    'bookSection' => $bookSection,
                    'chapter' => $chapter,
                    'chapterSection' => $chapterSection,
                    'verse' => $verse,
                ]),
            ],
            'verse_meta' => $publicScriptureData->verseMeta($verse->verseMeta),
            'admin_meta_update_href' => route('scripture.chapters.verses.admin.meta.update', [
                'book' => $book,
                'bookSection' => $bookSection,
                'chapter' => $chapter,
                'chapterSection' => $chapterSection,
                'verse' => $verse,
            ]),
            'admin_content_block_store_href' => route('scripture.chapters.verses.admin.content-blocks.store', [
                'book' => $book,
                'bookSection' => $bookSection,
                'chapter' => $chapter,
                'chapterSection' => $chapterSection,
                'verse' => $verse,
            ]),
            'admin_content_blocks' => $contentBlocks
                ->map(fn ($block) => [
                    'id' => $block->id,
                    'region' => $block->region,
                    'block_type' => $block->block_type,
                    'title' => $block->title,
                    'body' => $block->body,
                    'data_json' => $block->data_json,
                    'sort_order' => $block->sort_order,
                    'status' => $block->status,
                    'update_href' => route('scripture.chapters.verses.admin.content-blocks.update', [
                        'book' => $book,
                        'bookSection' => $bookSection,
                        'chapter' => $chapter,
                        'chapterSection' => $chapterSection,
                        'verse' => $verse,
                        'contentBlock' => $block,
                    ]),
                ])
                ->values()
                ->all(),
        ]);
    }
}
