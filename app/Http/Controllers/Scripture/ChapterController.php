<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ContentBlock;
use App\Support\AdminContext\AdminContext;
use App\Support\Scripture\Admin\ChapterAdminRouteContext;
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
            ->get();
        $adminVisibilityEnabled = AdminContext::isVisible($request);
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
            'admin' => $adminVisibilityEnabled
                ? [
                    'full_edit_href' => $adminRouteContext->fullEditHref(),
                    'primary_content_block_id' => $primaryEditableBlock?->id,
                    'primary_content_block_update_href' => $primaryEditableBlock
                        ? $adminRouteContext->contentBlockUpdateHref($primaryEditableBlock)
                        : null,
                    'content_block_update_hrefs' => $contentBlocks
                        ->filter(fn (ContentBlock $block) => $adminRouteContext->isEditableNoteBlock($block))
                        ->mapWithKeys(fn (ContentBlock $block) => [
                            (string) $block->id => $adminRouteContext->contentBlockUpdateHref($block),
                        ])
                        ->all(),
                ]
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
}
