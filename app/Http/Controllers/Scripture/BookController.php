<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Support\AdminContext\AdminContext;
use App\Support\Scripture\PageData\BookIndexPageDataBuilder;
use App\Support\Scripture\PageData\BookShowPageDataBuilder;
use App\Support\Scripture\PublicScriptureData;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookController extends Controller
{
    /**
     * Display the public scripture library.
     */
    public function index(
        Request $request,
        PublicScriptureData $publicScriptureData,
        BookIndexPageDataBuilder $bookIndexPageDataBuilder,
    ): Response
    {
        $books = Book::query()
            ->with($this->publicBookMediaRelations())
            ->inCanonicalOrder()
            ->get();
        $isAdmin = AdminContext::canAccess($request->user());

        return Inertia::render('scripture/books/index', [
            'isAdmin' => $isAdmin,
            'admin' => $isAdmin ? $bookIndexPageDataBuilder->adminPayload() : null,
            'books' => $bookIndexPageDataBuilder->books(
                $books,
                $publicScriptureData,
                $isAdmin,
            ),
        ]);
    }

    /**
     * Display a read-only scripture book page.
     */
    public function show(
        Request $request,
        Book $book,
        PublicScriptureData $publicScriptureData,
        BookShowPageDataBuilder $bookShowPageDataBuilder,
    ): Response {
        $isAdmin = AdminContext::canAccess($request->user());

        $book->load([
            'bookSections' => fn ($query) => $query
                ->inCanonicalOrder()
                ->with([
                    'chapters' => fn ($chapterQuery) => $chapterQuery
                        ->inCanonicalOrder()
                        ->with([
                            'contentBlocks' => fn ($contentBlockQuery) => $contentBlockQuery
                                ->published()
                                ->orderBy('sort_order')
                                ->orderBy('id'),
                        ]),
                    'contentBlocks' => fn ($contentBlockQuery) => $contentBlockQuery
                        ->published()
                        ->orderBy('sort_order')
                        ->orderBy('id'),
                ]),
        ]);
        $this->loadPublicBookMediaRelations($book);

        return Inertia::render('scripture/books/show', [
            'book' => $publicScriptureData->book($book),
            'isAdmin' => $isAdmin,
            'admin' => $isAdmin
                ? $bookShowPageDataBuilder->adminPayload(
                    $book,
                    includeMediaManagement: true,
                )
                : null,
            'book_sections' => $bookShowPageDataBuilder->bookSections(
                $book,
                $book->bookSections,
                $publicScriptureData,
                $isAdmin,
            ),
        ]);
    }

    private function loadPublicBookMediaRelations(Book $book): void
    {
        $book->load($this->publicBookMediaRelations());
    }

    /**
     * @return array<string, mixed>
     */
    private function publicBookMediaRelations(): array
    {
        return [
            'mediaAssignments' => fn ($query) => $query
                ->where('status', 'published')
                ->with('media')
                ->orderBy('sort_order'),
        ];
    }
}
