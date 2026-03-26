<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\ContentBlock;
use App\Support\AdminContext\AdminContext;
use App\Support\Scripture\Admin\BookAdminRouteContext;
use App\Support\Scripture\PublicScriptureData;
use Illuminate\Database\Eloquent\Collection;
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
            ->with($this->publicBookMediaRelations())
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
        $this->loadPublicBookMediaRelations($book);
        $contentBlocks = $this->publicBookContentBlocks($book);
        $adminVisibilityEnabled = AdminContext::isVisible($request);

        return Inertia::render('scripture/books/overview', [
            'book' => $publicScriptureData->book($book),
            'content_blocks' => $publicScriptureData->contentBlocks($contentBlocks),
            'admin' => $this->bookAdminPayload(
                $book,
                $contentBlocks,
                $adminVisibilityEnabled,
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
    ): Response {
        $book->load([
            'bookSections' => fn ($query) => $query
                ->inCanonicalOrder()
                ->with([
                    'chapters' => fn ($chapterQuery) => $chapterQuery->inCanonicalOrder(),
                ]),
        ]);
        $this->loadPublicBookMediaRelations($book);

        $contentBlocks = $this->publicBookContentBlocks($book);
        $adminVisibilityEnabled = AdminContext::isVisible($request);

        return Inertia::render('scripture/books/show', [
            'book' => $publicScriptureData->book($book),
            'content_blocks' => $publicScriptureData->contentBlocks($contentBlocks),
            'admin' => $this->bookAdminPayload(
                $book,
                $contentBlocks,
                $adminVisibilityEnabled,
            ),
            'book_sections' => $publicScriptureData->bookSectionsWithChapters(
                $book,
                $book->bookSections,
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
            'contentBlocks' => fn ($query) => $query
                ->published()
                ->where('block_type', 'video')
                ->orderBy('sort_order'),
        ];
    }

    /**
     * @return Collection<int, ContentBlock>
     */
    private function publicBookContentBlocks(Book $book)
    {
        return $book->contentBlocks()
            ->published()
            ->where('block_type', '!=', 'video')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    /**
     * @param  Collection<int, ContentBlock>  $contentBlocks
     * @return array<string, mixed>|null
     */
    private function bookAdminPayload(
        Book $book,
        Collection $contentBlocks,
        bool $adminVisibilityEnabled,
    ): ?array {
        if (! $adminVisibilityEnabled) {
            return null;
        }

        $adminRouteContext = new BookAdminRouteContext($book);

        return [
            'details_update_href' => $adminRouteContext->detailsUpdateHref(),
            'full_edit_href' => $adminRouteContext->fullEditHref(),
            'canonical_edit_href' => $adminRouteContext->canonicalEditHref(),
            'content_block_store_href' => $adminRouteContext->contentBlockStoreHref(),
            'content_block_types' => $adminRouteContext->editableContentBlockTypes(),
            'content_block_regions' => $adminRouteContext->creatableContentBlockRegions(),
            'content_block_update_hrefs' => $contentBlocks
                ->filter(fn (ContentBlock $block) => $adminRouteContext->isEditableContentBlock($block))
                ->mapWithKeys(fn (ContentBlock $block) => [
                    (string) $block->id => $adminRouteContext->contentBlockUpdateHref($block),
                ])
                ->all(),
        ];
    }
}
