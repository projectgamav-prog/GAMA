<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\ContentBlock;
use App\Support\AdminContext\AdminContext;
use App\Support\Scripture\Admin\BookAdminRouteContext;
use App\Support\Scripture\PublicScriptureData;
use Illuminate\Http\Request;
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
            ->with([
                'contentBlocks' => fn ($query) => $query
                    ->published()
                    ->where('block_type', 'video')
                    ->orderBy('sort_order'),
            ])
            ->inCanonicalOrder()
            ->get();

        return Inertia::render('scripture/books/index', [
            'books' => $publicScriptureData->books($books),
        ]);
    }

    /**
     * Display a dedicated public overview page for the book.
     */
    public function overview(
        Request $request,
        Book $book,
        PublicScriptureData $publicScriptureData,
    ): Response {
        $contentBlocks = $book->contentBlocks()
            ->published()
            ->get();
        $adminVisibilityEnabled = AdminContext::isVisible($request);
        $adminRouteContext = new BookAdminRouteContext($book);

        return Inertia::render('scripture/books/overview', [
            'book' => $publicScriptureData->book($book),
            'content_blocks' => $publicScriptureData->contentBlocks($contentBlocks),
            'admin' => $adminVisibilityEnabled
                ? [
                    'details_update_href' => $adminRouteContext->detailsUpdateHref(),
                    'full_edit_href' => $adminRouteContext->fullEditHref(),
                    'canonical_edit_href' => $adminRouteContext->canonicalEditHref(),
                    'content_block_update_hrefs' => $contentBlocks
                        ->filter(fn (ContentBlock $block) => $adminRouteContext->isEditableContentBlock($block))
                        ->mapWithKeys(fn (ContentBlock $block) => [
                            (string) $block->id => $adminRouteContext->contentBlockUpdateHref($block),
                        ])
                        ->all(),
                ]
                : null,
        ]);
    }

    /**
     * Display a read-only scripture book page.
     */
    public function show(
        Request $request,
        Book $book,
        PublicScriptureData $publicScriptureData,
    ): Response {
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
        $adminVisibilityEnabled = AdminContext::isVisible($request);
        $adminRouteContext = new BookAdminRouteContext($book);

        return Inertia::render('scripture/books/show', [
            'book' => $publicScriptureData->book($book),
            'content_blocks' => $publicScriptureData->contentBlocks($contentBlocks),
            'admin' => $adminVisibilityEnabled
                ? [
                    'details_update_href' => $adminRouteContext->detailsUpdateHref(),
                    'full_edit_href' => $adminRouteContext->fullEditHref(),
                    'canonical_edit_href' => $adminRouteContext->canonicalEditHref(),
                    'content_block_update_hrefs' => $contentBlocks
                        ->filter(fn (ContentBlock $block) => $adminRouteContext->isEditableContentBlock($block))
                        ->mapWithKeys(fn (ContentBlock $block) => [
                            (string) $block->id => $adminRouteContext->contentBlockUpdateHref($block),
                        ])
                        ->all(),
                ]
                : null,
            'book_sections' => $publicScriptureData->bookSectionsWithChapters(
                $book,
                $book->bookSections,
            ),
        ]);
    }
}
