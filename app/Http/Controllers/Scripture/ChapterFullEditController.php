<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ContentBlock;
use App\Support\Scripture\Admin\RegisteredContentBlockData;
use App\Support\Scripture\Admin\Registry\AdminEntityRegistry;
use App\Support\Scripture\Admin\ChapterAdminRouteContext;
use App\Support\Scripture\PublicScriptureData;
use Inertia\Inertia;
use Inertia\Response;

class ChapterFullEditController extends Controller
{
    /**
     * Render the deeper protected chapter editor surface.
     */
    public function show(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        PublicScriptureData $publicScriptureData,
        AdminEntityRegistry $adminEntityRegistry,
    ): Response {
        $contentBlocks = $chapter->contentBlocks()
            ->get();
        $adminRouteContext = new ChapterAdminRouteContext($book, $bookSection, $chapter);
        $editableNoteBlocks = $contentBlocks
            ->filter(fn (ContentBlock $block) => $adminRouteContext->isEditableNoteBlock($block))
            ->values();
        $protectedContentBlocks = $contentBlocks
            ->reject(fn (ContentBlock $block) => $adminRouteContext->isEditableNoteBlock($block))
            ->values();

        return Inertia::render('scripture/chapters/full-edit', [
            'book' => $publicScriptureData->book($book),
            'book_section' => $publicScriptureData->bookSection($book, $bookSection),
            'chapter' => [
                ...$publicScriptureData->chapter($book, $bookSection, $chapter),
                'admin_full_edit_href' => $adminRouteContext->fullEditHref(),
            ],
            'admin_entity' => $adminEntityRegistry->definition('chapter')->toArray(),
            'admin_content_block_store_href' => $adminRouteContext->contentBlockStoreHref(),
            'next_content_block_sort_order' => RegisteredContentBlockData::nextSortOrder(
                $contentBlocks,
            ),
            'admin_content_blocks' => $editableNoteBlocks
                ->map(fn (ContentBlock $block) => RegisteredContentBlockData::editor(
                    $block,
                    $adminRouteContext->contentBlockUpdateHref($block),
                ))
                ->values()
                ->all(),
            'protected_content_blocks' => $protectedContentBlocks
                ->map(fn (ContentBlock $block) => RegisteredContentBlockData::protected(
                    $block,
                    'Only chapter-owned text note blocks remain editable in the current chapter workflow.',
                ))
                ->all(),
        ]);
    }
}
