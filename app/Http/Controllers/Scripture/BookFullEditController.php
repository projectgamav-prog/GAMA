<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\ContentBlock;
use App\Models\Media;
use App\Models\MediaAssignment;
use App\Support\Scripture\Admin\BookAdminRouteContext;
use App\Support\Scripture\Admin\Registry\AdminEntityRegistry;
use App\Support\Scripture\PublicScriptureData;
use Inertia\Inertia;
use Inertia\Response;

class BookFullEditController extends Controller
{
    /**
     * Render the schema-aware protected book editor surface.
     */
    public function show(
        Book $book,
        PublicScriptureData $publicScriptureData,
        AdminEntityRegistry $adminEntityRegistry,
    ): Response {
        $contentBlocks = $book->contentBlocks()
            ->get();
        $mediaAssignments = $book->mediaAssignments()
            ->with('media')
            ->get();
        $availableMedia = Media::query()
            ->orderBy('sort_order')
            ->orderBy('title')
            ->orderBy('id')
            ->get();
        $adminRouteContext = new BookAdminRouteContext($book);

        $editableContentBlocks = $contentBlocks
            ->filter(fn (ContentBlock $block) => $adminRouteContext->isEditableContentBlock($block))
            ->values();
        $protectedContentBlocks = $contentBlocks
            ->reject(fn (ContentBlock $block) => $adminRouteContext->isEditableContentBlock($block))
            ->values();
        $nextContentBlockSortOrder = $contentBlocks->isEmpty()
            ? 1
            : ((int) $contentBlocks->max('sort_order')) + 1;
        $nextMediaAssignmentSortOrder = $mediaAssignments->isEmpty()
            ? 1
            : ((int) $mediaAssignments->max('sort_order')) + 1;

        return Inertia::render('scripture/books/full-edit', [
            'book' => [
                ...$publicScriptureData->book($book),
                'admin_full_edit_href' => $adminRouteContext->fullEditHref(),
                'admin_canonical_edit_href' => $adminRouteContext->canonicalEditHref(),
            ],
            'admin_entity' => $adminEntityRegistry
                ->definition('book')
                ->toArray(),
            'admin_details_update_href' => $adminRouteContext->detailsUpdateHref(),
            'admin_content_block_store_href' => $adminRouteContext->contentBlockStoreHref(),
            'admin_media_assignment_store_href' => $adminRouteContext->mediaAssignmentStoreHref(),
            'next_content_block_sort_order' => $nextContentBlockSortOrder,
            'next_media_assignment_sort_order' => $nextMediaAssignmentSortOrder,
            'admin_content_blocks' => $editableContentBlocks
                ->map(fn (ContentBlock $block) => [
                    'id' => $block->id,
                    'region' => $block->region,
                    'block_type' => $block->block_type,
                    'title' => $block->title,
                    'body' => $block->body,
                    'data_json' => $block->data_json,
                    'sort_order' => $block->sort_order,
                    'status' => $block->status,
                    'update_href' => $adminRouteContext->contentBlockUpdateHref($block),
                ])
                ->all(),
            'protected_content_blocks' => $protectedContentBlocks
                ->map(fn (ContentBlock $block) => [
                    'id' => $block->id,
                    'region' => $block->region,
                    'block_type' => $block->block_type,
                    'title' => $block->title,
                    'body' => $block->body,
                    'data_json' => $block->data_json,
                    'sort_order' => $block->sort_order,
                    'status' => $block->status,
                    'protection_reason' => 'This block type is not registered for editorial editing in the Book admin framework.',
                ])
                ->values()
                ->all(),
            'admin_media_assignments' => $mediaAssignments
                ->map(fn (MediaAssignment $mediaAssignment) => [
                    'id' => $mediaAssignment->id,
                    'media_id' => $mediaAssignment->media_id,
                    'role' => $mediaAssignment->role,
                    'title_override' => $mediaAssignment->title_override,
                    'caption_override' => $mediaAssignment->caption_override,
                    'sort_order' => $mediaAssignment->sort_order,
                    'status' => $mediaAssignment->status,
                    'update_href' => $adminRouteContext->mediaAssignmentUpdateHref($mediaAssignment),
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
        ]);
    }
}
