<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ContentBlock;
use App\Models\Media;
use App\Models\MediaAssignment;
use App\Support\AdminContext\AdminContext;
use App\Support\Scripture\Admin\BookAdminRouteContext;
use App\Support\Scripture\Admin\BookSectionAdminRouteContext;
use App\Support\Scripture\Admin\ContentBlockCapabilityPayload;
use App\Support\Scripture\Admin\PrimaryPublishedEditableContentBlock;
use App\Support\Scripture\Admin\VisibleContentBlockSequence;
use App\Support\Scripture\PublicScriptureData;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
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
    ): Response
    {
        $books = Book::query()
            ->with($this->publicBookMediaRelations())
            ->inCanonicalOrder()
            ->get();
        $isAdmin = AdminContext::canAccess($request->user());

        return Inertia::render('scripture/books/index', [
            'isAdmin' => $isAdmin,
            'admin' => $isAdmin ? $this->booksIndexAdminPayload() : null,
            'books' => $books
                ->map(fn (Book $book) => [
                    ...$publicScriptureData->book($book),
                    'admin' => $this->bookCardAdminPayload($book, $isAdmin),
                ])
                ->values()
                ->all(),
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
        $isAdmin = AdminContext::canAccess($request->user());

        return Inertia::render('scripture/books/overview', [
            'book' => $publicScriptureData->book($book),
            'content_blocks' => $publicScriptureData->contentBlocks($contentBlocks),
            'isAdmin' => $isAdmin,
            'admin' => $isAdmin
                ? $this->bookAdminPayload(
                    $book,
                    $contentBlocks,
                    includeMediaManagement: true,
                )
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
                    'contentBlocks' => fn ($contentBlockQuery) => $contentBlockQuery
                        ->published()
                        ->orderBy('sort_order')
                        ->orderBy('id'),
                ]),
        ]);
        $this->loadPublicBookMediaRelations($book);

        $contentBlocks = $this->publicBookContentBlocks($book);
        $isAdmin = AdminContext::canAccess($request->user());

        return Inertia::render('scripture/books/show', [
            'book' => $publicScriptureData->book($book),
            'content_blocks' => $publicScriptureData->contentBlocks($contentBlocks),
            'isAdmin' => $isAdmin,
            'admin' => $isAdmin
                ? $this->bookAdminPayload(
                    $book,
                    $contentBlocks,
                    includeMediaManagement: true,
                )
                : null,
            'book_sections' => $this->bookSectionsPayload(
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
     * @return array<string, mixed>
     */
    private function bookAdminPayload(
        Book $book,
        Collection $contentBlocks,
        bool $includeMediaManagement = false,
    ): array {
        $adminRouteContext = new BookAdminRouteContext($book);
        $visibleSequence = new VisibleContentBlockSequence($contentBlocks);
        $payload = [
            'identity_update_href' => $adminRouteContext->identityUpdateHref(),
            'details_update_href' => $adminRouteContext->detailsUpdateHref(),
            'full_edit_href' => $adminRouteContext->fullEditHref(),
            'canonical_edit_href' => $adminRouteContext->canonicalEditHref(),
            'destroy_href' => $adminRouteContext->destroyHref(),
            'book_section_store_href' => route(
                'scripture.book-sections.admin.store',
                ['book' => $book],
            ),
            'content_block_store_href' => $adminRouteContext->contentBlockStoreHref(),
            'content_block_types' => $adminRouteContext->editableContentBlockTypes(),
            'content_block_default_region' => $adminRouteContext->creatableContentBlockRegions()[0],
            'content_block_regions' => $adminRouteContext->creatableContentBlockRegions(),
            ...ContentBlockCapabilityPayload::build(
                $contentBlocks,
                $visibleSequence,
                fn (ContentBlock $block): bool => $adminRouteContext->isEditableContentBlock($block),
                fn (ContentBlock $block): bool => $adminRouteContext->isDuplicableContentBlock($block),
                fn (ContentBlock $block): string => $adminRouteContext->contentBlockUpdateHref($block),
                fn (ContentBlock $block): string => $adminRouteContext->contentBlockMoveUpHref($block),
                fn (ContentBlock $block): string => $adminRouteContext->contentBlockMoveDownHref($block),
                fn (ContentBlock $block): string => $adminRouteContext->contentBlockReorderHref($block),
                fn (ContentBlock $block): string => $adminRouteContext->contentBlockDuplicateHref($block),
                fn (ContentBlock $block): string => $adminRouteContext->contentBlockDestroyHref($block),
            ),
        ];

        if (! $includeMediaManagement) {
            return $payload;
        }

        $mediaAssignments = $book->mediaAssignments()
            ->with('media')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
        $availableMedia = Media::query()
            ->orderBy('sort_order')
            ->orderBy('title')
            ->orderBy('id')
            ->get();

        return [
            ...$payload,
            'media_assignment_store_href' => $adminRouteContext->mediaAssignmentStoreHref(),
            'media_assignments' => $mediaAssignments
                ->map(fn (MediaAssignment $mediaAssignment) => [
                    'id' => $mediaAssignment->id,
                    'media_id' => $mediaAssignment->media_id,
                    'role' => $mediaAssignment->role,
                    'title_override' => $mediaAssignment->title_override,
                    'caption_override' => $mediaAssignment->caption_override,
                    'sort_order' => $mediaAssignment->sort_order,
                    'status' => $mediaAssignment->status,
                    'update_href' => $adminRouteContext->mediaAssignmentUpdateHref($mediaAssignment),
                    'destroy_href' => $adminRouteContext->mediaAssignmentDestroyHref($mediaAssignment),
                    'media' => $mediaAssignment->media
                        ? [
                            'id' => $mediaAssignment->media->id,
                            'media_type' => $mediaAssignment->media->media_type,
                            'title' => $mediaAssignment->media->title,
                            'alt_text' => $mediaAssignment->media->alt_text,
                            'caption' => $mediaAssignment->media->caption,
                            'url' => $mediaAssignment->media->url,
                            'path' => $mediaAssignment->media->path,
                        ]
                        : null,
                ])
                ->values()
                ->all(),
            'available_media' => $availableMedia
                ->map(fn (Media $media) => [
                    'id' => $media->id,
                    'media_type' => $media->media_type,
                    'title' => $media->title,
                    'alt_text' => $media->alt_text,
                    'caption' => $media->caption,
                    'url' => $media->url,
                    'path' => $media->path,
                ])
                ->values()
                ->all(),
            'next_media_assignment_sort_order' => $mediaAssignments->isEmpty()
                ? 1
                : ((int) $mediaAssignments->max('sort_order')) + 1,
        ];
    }

    /**
     * @return array<string, string>|null
     */
    private function bookCardAdminPayload(
        Book $book,
        bool $isAdmin,
    ): ?array {
        if (! $isAdmin) {
            return null;
        }

        $adminRouteContext = new BookAdminRouteContext($book);

        return [
            'details_update_href' => $adminRouteContext->detailsUpdateHref(),
            'full_edit_href' => $adminRouteContext->fullEditHref(),
            'canonical_edit_href' => $adminRouteContext->canonicalEditHref(),
        ];
    }

    /**
     * @return array<string, string>
     */
    private function booksIndexAdminPayload(): array
    {
        return [
            'store_href' => route('scripture.books.admin.store'),
        ];
    }

    /**
     * @param  \Illuminate\Support\Collection<int, BookSection>  $sections
     * @return list<array<string, mixed>>
     */
    private function bookSectionsPayload(
        Book $book,
        \Illuminate\Support\Collection $sections,
        PublicScriptureData $publicScriptureData,
        bool $isAdmin,
    ): array {
        return $sections
            ->map(function (BookSection $section) use (
                $book,
                $publicScriptureData,
                $isAdmin,
            ): array {
                $adminRouteContext = new BookSectionAdminRouteContext(
                    $book,
                    $section,
                );
                $contentBlocks = $section->relationLoaded('contentBlocks')
                    ? collect($section->contentBlocks)
                    : $section->contentBlocks()
                        ->published()
                        ->orderBy('sort_order')
                        ->orderBy('id')
                        ->get();
                $primaryIntroBlock = PrimaryPublishedEditableContentBlock::resolve(
                    $contentBlocks,
                    fn (ContentBlock $block): bool => $adminRouteContext->isEditableIntroBlock($block),
                );

                return [
                    ...$publicScriptureData->bookSection($book, $section),
                    'intro_block' => $primaryIntroBlock
                        ? $publicScriptureData->contentBlock($primaryIntroBlock)
                        : null,
                    'admin' => $isAdmin
                        ? $this->bookSectionAdminPayload(
                            $book,
                            $section,
                            $publicScriptureData,
                            $contentBlocks,
                            $primaryIntroBlock,
                        )
                        : null,
                    'chapters' => collect($section->chapters)
                        ->map(fn (Chapter $chapter) => $publicScriptureData->chapter(
                            $book,
                            $section,
                            $chapter,
                        ))
                        ->values()
                        ->all(),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @param  Collection<int, ContentBlock>  $contentBlocks
     * @return array<string, mixed>
     */
    private function bookSectionAdminPayload(
        Book $book,
        BookSection $bookSection,
        PublicScriptureData $publicScriptureData,
        Collection $contentBlocks,
        ?ContentBlock $primaryIntroBlock,
    ): array {
        $adminRouteContext = new BookSectionAdminRouteContext($book, $bookSection);

        return [
            'details_update_href' => route(
                'scripture.book-sections.admin.details.update',
                [
                    'book' => $book,
                    'bookSection' => $bookSection,
                ],
            ),
            'destroy_href' => $adminRouteContext->destroyHref(),
            'intro_store_href' => $adminRouteContext->contentBlockStoreHref(),
            'primary_intro_block' => $primaryIntroBlock
                ? ($publicScriptureData->contentBlocks([$primaryIntroBlock])[0] ?? null)
                : null,
            'primary_intro_update_href' => $primaryIntroBlock
                ? $adminRouteContext->contentBlockUpdateHref($primaryIntroBlock)
                : null,
            'primary_intro_destroy_href' => $primaryIntroBlock
                ? $adminRouteContext->contentBlockDestroyHref($primaryIntroBlock)
                : null,
            'intro_block_types' => $adminRouteContext->contentBlockTypes(),
            'intro_default_region' => $adminRouteContext->defaultContentBlockRegion(),
            'child_store_href' => route(
                'scripture.chapters.admin.store',
                [
                    'book' => $book,
                    'bookSection' => $bookSection,
                ],
            ),
        ];
    }
}
