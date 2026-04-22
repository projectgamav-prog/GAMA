<?php

namespace App\Support\Scripture\PageData;

use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ContentBlock;
use App\Models\Media;
use App\Models\MediaAssignment;
use App\Support\Scripture\Admin\BookAdminRouteContext;
use App\Support\Scripture\Admin\BookSectionAdminRouteContext;
use App\Support\Scripture\Admin\ChapterAdminRouteContext;
use App\Support\Scripture\Admin\PrimaryPublishedEditableContentBlock;
use App\Support\Scripture\PublicScriptureData;
use Illuminate\Support\Collection;

class BookShowPageDataBuilder
{
    /**
     * @return array<string, mixed>
     */
    public function adminPayload(
        Book $book,
        bool $includeMediaManagement = false,
    ): array {
        $adminRouteContext = new BookAdminRouteContext($book);
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
            'media_assignment_attach_href' => $adminRouteContext->mediaAssignmentAttachHref(),
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
                    'replace_media_href' => $adminRouteContext->mediaAssignmentReplaceMediaHref($mediaAssignment),
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
     * @param  Collection<int, BookSection>  $sections
     * @return list<array<string, mixed>>
     */
    public function bookSections(
        Book $book,
        Collection $sections,
        PublicScriptureData $publicScriptureData,
        bool $isAdmin,
    ): array {
        return $sections
            ->map(function (BookSection $section) use (
                $book,
                $publicScriptureData,
                $isAdmin,
            ): array {
                $adminRouteContext = new BookSectionAdminRouteContext($book, $section);
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
                            $primaryIntroBlock,
                        )
                        : null,
                    'chapters' => $this->chapters(
                        $book,
                        $section,
                        $publicScriptureData,
                        $isAdmin,
                    ),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function chapters(
        Book $book,
        BookSection $section,
        PublicScriptureData $publicScriptureData,
        bool $isAdmin,
    ): array {
        return collect($section->chapters)
            ->map(function (Chapter $chapter) use (
                $book,
                $section,
                $publicScriptureData,
                $isAdmin,
            ): array {
                $chapterContentBlocks = $chapter->relationLoaded('contentBlocks')
                    ? collect($chapter->contentBlocks)
                    : $chapter->contentBlocks()
                        ->published()
                        ->orderBy('sort_order')
                        ->orderBy('id')
                        ->get();
                $chapterAdminRouteContext = new ChapterAdminRouteContext(
                    $book,
                    $section,
                    $chapter,
                );
                $primaryIntroBlock = PrimaryPublishedEditableContentBlock::resolve(
                    $chapterContentBlocks,
                    fn (ContentBlock $block): bool => $chapterAdminRouteContext->isEditableIntroBlock($block),
                );
                $chapterPayload = [
                    ...$publicScriptureData->chapter($book, $section, $chapter),
                    'intro_block' => $primaryIntroBlock
                        ? $publicScriptureData->contentBlock($primaryIntroBlock)
                        : null,
                ];

                if (! $isAdmin) {
                    return $chapterPayload;
                }

                return [
                    ...$chapterPayload,
                    'admin' => [
                        'full_edit_href' => $chapterAdminRouteContext->fullEditHref(),
                        'identity_update_href' => $chapterAdminRouteContext->identityUpdateHref(),
                        'destroy_href' => $chapterAdminRouteContext->destroyHref(),
                        'intro_store_href' => $chapterAdminRouteContext->contentBlockStoreHref(),
                        'primary_intro_block' => $primaryIntroBlock
                            ? $publicScriptureData->contentBlock($primaryIntroBlock)
                            : null,
                        'primary_intro_update_href' => $primaryIntroBlock
                            ? $chapterAdminRouteContext->contentBlockUpdateHref($primaryIntroBlock)
                            : null,
                        'primary_intro_destroy_href' => $primaryIntroBlock
                            ? $chapterAdminRouteContext->contentBlockDestroyHref($primaryIntroBlock)
                            : null,
                        'intro_block_types' => $chapterAdminRouteContext->contentBlockTypes(),
                        'intro_default_region' => $chapterAdminRouteContext->defaultIntroBlockRegion(),
                    ],
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function bookSectionAdminPayload(
        Book $book,
        BookSection $bookSection,
        PublicScriptureData $publicScriptureData,
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
