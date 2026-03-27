<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ContentBlock;
use App\Support\AdminContext\AdminContext;
use App\Support\Scripture\Admin\ChapterAdminRouteContext;
use App\Support\Scripture\Admin\ContentBlockCapabilityPayload;
use App\Support\Scripture\Admin\VisibleContentBlockSequence;
use App\Support\Scripture\PublicScriptureData;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class ChapterController extends Controller
{
    /**
     * Display a read-only chapter overview page.
     */
    public function show(
        Request $request,
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        PublicScriptureData $publicScriptureData,
    ): Response
    {
        $contentBlocks = $chapter->contentBlocks()
            ->published()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
        $isAdmin = AdminContext::canAccess($request->user());
        $adminRouteContext = new ChapterAdminRouteContext($book, $bookSection, $chapter);
        $primaryEditableBlock = $this->primaryPublishedEditableBlock(
            $contentBlocks,
            $adminRouteContext,
        );

        $chapterSections = $chapter->chapterSections()
            ->withCount('verses')
            ->inCanonicalOrder()
            ->get();

        return Inertia::render('scripture/chapters/show', [
            'book' => $publicScriptureData->book($book),
            'book_section' => $publicScriptureData->bookSection($book, $bookSection),
            'chapter' => $publicScriptureData->chapter($book, $bookSection, $chapter),
            'content_blocks' => $publicScriptureData->contentBlocks($contentBlocks),
            'isAdmin' => $isAdmin,
            'admin' => $isAdmin
                ? $this->chapterAdminPayload(
                    $adminRouteContext,
                    $contentBlocks,
                    $primaryEditableBlock,
                )
                : null,
            'chapter_sections' => $publicScriptureData->chapterSections(
                $book,
                $bookSection,
                $chapter,
                $chapterSections,
            ),
        ]);
    }

    /**
     * Resolve a single clear primary published note block for page-intro editing.
     *
     * @param  Collection<int, ContentBlock>  $contentBlocks
     */
    private function primaryPublishedEditableBlock(
        Collection $contentBlocks,
        ChapterAdminRouteContext $adminRouteContext,
    ): ?ContentBlock {
        $editableBlocks = $contentBlocks
            ->filter(fn (ContentBlock $block) => $adminRouteContext->isEditableNoteBlock($block))
            ->values();

        if ($editableBlocks->isEmpty()) {
            return null;
        }

        $overviewBlocks = $editableBlocks
            ->filter(fn (ContentBlock $block) => $block->region === 'overview')
            ->values();

        if ($overviewBlocks->count() === 1) {
            return $overviewBlocks->first();
        }

        return $editableBlocks->count() === 1
            ? $editableBlocks->first()
            : null;
    }

    /**
     * @param  Collection<int, ContentBlock>  $contentBlocks
     * @return array<string, mixed>
     */
    private function chapterAdminPayload(
        ChapterAdminRouteContext $adminRouteContext,
        Collection $contentBlocks,
        ?ContentBlock $primaryEditableBlock,
    ): array {
        $visibleSequence = new VisibleContentBlockSequence($contentBlocks);

        return [
            'full_edit_href' => $adminRouteContext->fullEditHref(),
            'content_block_store_href' => $adminRouteContext->contentBlockStoreHref(),
            'content_block_types' => $adminRouteContext->contentBlockTypes(),
            'content_block_default_region' => $adminRouteContext->defaultContentBlockRegion(),
            'primary_content_block_id' => $primaryEditableBlock?->id,
            'primary_content_block_update_href' => $primaryEditableBlock
                ? $adminRouteContext->contentBlockUpdateHref($primaryEditableBlock)
                : null,
            ...ContentBlockCapabilityPayload::build(
                $contentBlocks,
                $visibleSequence,
                fn (ContentBlock $block): bool => $adminRouteContext->isEditableNoteBlock($block),
                fn (ContentBlock $block): bool => $adminRouteContext->isDuplicableNoteBlock($block),
                fn (ContentBlock $block): string => $adminRouteContext->contentBlockUpdateHref($block),
                fn (ContentBlock $block): string => $adminRouteContext->contentBlockMoveUpHref($block),
                fn (ContentBlock $block): string => $adminRouteContext->contentBlockMoveDownHref($block),
                fn (ContentBlock $block): string => $adminRouteContext->contentBlockReorderHref($block),
                fn (ContentBlock $block): string => $adminRouteContext->contentBlockDuplicateHref($block),
                fn (ContentBlock $block): string => $adminRouteContext->contentBlockDestroyHref($block),
            ),
        ];
    }
}
