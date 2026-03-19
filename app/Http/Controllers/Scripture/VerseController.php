<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\ContentBlock;
use App\Models\Verse;
use App\Models\VerseCommentary;
use App\Models\VerseTranslation;
use Inertia\Inertia;
use Inertia\Response;

class VerseController extends Controller
{
    /**
     * Display a read-only scripture verse detail page.
     */
    public function show(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        Verse $verse,
    ): Response {
        $verse->load([
            'translations' => fn ($query) => $query->orderBy('sort_order'),
            'commentaries' => fn ($query) => $query->orderBy('sort_order'),
        ]);

        $versesHref = route('scripture.chapters.verses.index', [
            'book' => $book,
            'bookSection' => $bookSection,
            'chapter' => $chapter,
        ]);

        $contentBlocks = $verse->contentBlocks()
            ->where('status', 'published')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('scripture/chapters/verses/show', [
            'book' => [
                'id' => $book->id,
                'slug' => $book->slug,
                'title' => $book->title,
                'sort_order' => $book->sort_order,
                'href' => route('scripture.books.show', $book),
            ],
            'book_section' => [
                'id' => $bookSection->id,
                'slug' => $bookSection->slug,
                'number' => $bookSection->number,
                'title' => $bookSection->title,
                'sort_order' => $bookSection->sort_order,
            ],
            'chapter' => [
                'id' => $chapter->id,
                'slug' => $chapter->slug,
                'number' => $chapter->number,
                'title' => $chapter->title,
                'sort_order' => $chapter->sort_order,
                'href' => route('scripture.chapters.show', [
                    'book' => $book,
                    'bookSection' => $bookSection,
                    'chapter' => $chapter,
                ]),
                'verses_href' => $versesHref,
            ],
            'chapter_section' => [
                'id' => $chapterSection->id,
                'slug' => $chapterSection->slug,
                'number' => $chapterSection->number,
                'title' => $chapterSection->title,
                'sort_order' => $chapterSection->sort_order,
                'href' => $versesHref.'#'.$chapterSection->slug,
            ],
            'verse' => [
                'id' => $verse->id,
                'slug' => $verse->slug,
                'number' => $verse->number,
                'text' => $verse->text,
                'sort_order' => $verse->sort_order,
            ],
            'translations' => $verse->translations
                ->map(fn (VerseTranslation $translation) => [
                    'id' => $translation->id,
                    'source_key' => $translation->source_key,
                    'source_name' => $translation->source_name,
                    'language_code' => $translation->language_code,
                    'text' => $translation->text,
                    'sort_order' => $translation->sort_order,
                ])
                ->values()
                ->all(),
            'commentaries' => $verse->commentaries
                ->map(fn (VerseCommentary $commentary) => [
                    'id' => $commentary->id,
                    'source_key' => $commentary->source_key,
                    'source_name' => $commentary->source_name,
                    'author_name' => $commentary->author_name,
                    'language_code' => $commentary->language_code,
                    'title' => $commentary->title,
                    'body' => $commentary->body,
                    'sort_order' => $commentary->sort_order,
                ])
                ->values()
                ->all(),
            'content_blocks' => $contentBlocks
                ->map(fn (ContentBlock $block) => $this->contentBlockData($block))
                ->values()
                ->all(),
        ]);
    }

    /**
     * Transform a content block for public scripture pages.
     *
     * @return array<string, mixed>
     */
    private function contentBlockData(ContentBlock $block): array
    {
        return [
            'id' => $block->id,
            'region' => $block->region,
            'block_type' => $block->block_type,
            'title' => $block->title,
            'body' => $block->body,
            'data_json' => $block->data_json,
            'sort_order' => $block->sort_order,
        ];
    }
}
