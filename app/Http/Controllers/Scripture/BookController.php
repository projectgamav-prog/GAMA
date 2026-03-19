<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ContentBlock;
use Inertia\Inertia;
use Inertia\Response;

class BookController extends Controller
{
    /**
     * Display a read-only scripture book page.
     */
    public function show(Book $book): Response
    {
        $book->load([
            'bookSections' => fn ($query) => $query
                ->orderBy('sort_order')
                ->with([
                    'chapters' => fn ($chapterQuery) => $chapterQuery->orderBy('sort_order'),
                ]),
        ]);

        $contentBlocks = $book->contentBlocks()
            ->where('status', 'published')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('scripture/books/show', [
            'book' => [
                'id' => $book->id,
                'slug' => $book->slug,
                'title' => $book->title,
                'description' => $book->description,
                'sort_order' => $book->sort_order,
                'href' => route('scripture.books.show', $book),
            ],
            'content_blocks' => $contentBlocks
                ->map(fn (ContentBlock $block) => $this->contentBlockData($block))
                ->values()
                ->all(),
            'book_sections' => $book->bookSections
                ->map(fn (BookSection $section) => [
                    'id' => $section->id,
                    'slug' => $section->slug,
                    'number' => $section->number,
                    'title' => $section->title,
                    'sort_order' => $section->sort_order,
                    'chapters' => $section->chapters
                        ->map(fn (Chapter $chapter) => [
                            'id' => $chapter->id,
                            'slug' => $chapter->slug,
                            'number' => $chapter->number,
                            'title' => $chapter->title,
                            'sort_order' => $chapter->sort_order,
                            'href' => route('scripture.chapters.show', [
                                'book' => $book,
                                'bookSection' => $section,
                                'chapter' => $chapter,
                            ]),
                        ])
                        ->values()
                        ->all(),
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
