<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\ContentBlock;
use Inertia\Inertia;
use Inertia\Response;

class ChapterController extends Controller
{
    /**
     * Display a read-only chapter overview page.
     */
    public function show(Book $book, BookSection $bookSection, Chapter $chapter): Response
    {
        $bookHref = route('scripture.books.show', $book);
        $bookSectionHref = $bookHref.'#section-'.$bookSection->slug;

        $contentBlocks = $chapter->contentBlocks()
            ->where('status', 'published')
            ->orderBy('sort_order')
            ->get();

        $chapterSections = $chapter->chapterSections()
            ->withCount('verses')
            ->inCanonicalOrder()
            ->get();

        $versesHref = route('scripture.chapters.verses.index', [
            'book' => $book,
            'bookSection' => $bookSection,
            'chapter' => $chapter,
        ]);

        return Inertia::render('scripture/chapters/show', [
            'book' => [
                'id' => $book->id,
                'slug' => $book->slug,
                'title' => $book->title,
                'href' => $bookHref,
            ],
            'book_section' => [
                'id' => $bookSection->id,
                'slug' => $bookSection->slug,
                'number' => $bookSection->number,
                'title' => $bookSection->title,
                'href' => $bookSectionHref,
            ],
            'chapter' => [
                'id' => $chapter->id,
                'slug' => $chapter->slug,
                'number' => $chapter->number,
                'title' => $chapter->title,
                'href' => route('scripture.chapters.show', [
                    'book' => $book,
                    'bookSection' => $bookSection,
                    'chapter' => $chapter,
                ]),
                'verses_href' => $versesHref,
            ],
            'content_blocks' => $contentBlocks
                ->map(fn (ContentBlock $block) => $this->contentBlockData($block))
                ->values()
                ->all(),
            'chapter_sections' => $chapterSections
                ->map(fn (ChapterSection $section) => [
                    'id' => $section->id,
                    'slug' => $section->slug,
                    'number' => $section->number,
                    'title' => $section->title,
                    'verses_count' => $section->verses_count,
                    'href' => $versesHref.'#'.$section->slug,
                ])
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
