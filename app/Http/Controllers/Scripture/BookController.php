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
     * Display the public scripture library.
     */
    public function index(): Response
    {
        $books = Book::query()
            ->inCanonicalOrder()
            ->get();

        return Inertia::render('scripture/books/index', [
            'books' => $books
                ->map(fn (Book $book) => [
                    'id' => $book->id,
                    'slug' => $book->slug,
                    'title' => $book->title,
                    'description' => $book->description,
                    'href' => route('scripture.books.show', $book),
                ])
                ->values()
                ->all(),
        ]);
    }

    /**
     * Display a read-only scripture book page.
     */
    public function show(Book $book): Response
    {
        $bookHref = route('scripture.books.show', $book);

        $book->load([
            'bookSections' => fn ($query) => $query
                ->inCanonicalOrder()
                ->with([
                    'chapters' => fn ($chapterQuery) => $chapterQuery->inCanonicalOrder(),
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
                'href' => $bookHref,
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
                    'href' => $bookHref.'#section-'.$section->slug,
                    'chapters' => $section->chapters
                        ->map(fn (Chapter $chapter) => [
                            'id' => $chapter->id,
                            'slug' => $chapter->slug,
                            'number' => $chapter->number,
                            'title' => $chapter->title,
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
