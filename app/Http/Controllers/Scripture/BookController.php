<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Support\Scripture\PublicScriptureData;
use Inertia\Inertia;
use Inertia\Response;

class BookController extends Controller
{
    /**
     * Display the public scripture library.
     */
    public function index(PublicScriptureData $publicScriptureData): Response
    {
        $books = Book::query()
            ->inCanonicalOrder()
            ->get();

        return Inertia::render('scripture/books/index', [
            'books' => $publicScriptureData->books($books),
        ]);
    }

    /**
     * Display a read-only scripture book page.
     */
    public function show(Book $book, PublicScriptureData $publicScriptureData): Response
    {
        $book->load([
            'bookSections' => fn ($query) => $query
                ->inCanonicalOrder()
                ->with([
                    'chapters' => fn ($chapterQuery) => $chapterQuery->inCanonicalOrder(),
                ]),
        ]);

        $contentBlocks = $book->contentBlocks()
            ->published()
            ->get();

        return Inertia::render('scripture/books/show', [
            'book' => $publicScriptureData->book($book),
            'content_blocks' => $publicScriptureData->contentBlocks($contentBlocks),
            'book_sections' => $publicScriptureData->bookSectionsWithChapters(
                $book,
                $book->bookSections,
            ),
        ]);
    }
}
