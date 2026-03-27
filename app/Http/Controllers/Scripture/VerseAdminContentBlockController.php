<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scripture\ContentBlockReorderRequest;
use App\Http\Requests\Scripture\VerseContentBlockStoreRequest;
use App\Http\Requests\Scripture\VerseContentBlockUpdateRequest;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\ContentBlock;
use App\Models\Verse;
use App\Support\Scripture\Admin\ContentBlockDuplicate;
use App\Support\Scripture\Admin\RegisteredContentBlock;
use App\Support\Scripture\Admin\RegisteredContentBlockOrdering;
use App\Support\Scripture\Admin\VisibleContentBlockSequence;
use App\Support\Scripture\Admin\VerseAdminRouteContext;
use Illuminate\Http\RedirectResponse;

class VerseAdminContentBlockController extends Controller
{
    /**
     * Create a new verse-owned editorial note block.
     */
    public function store(
        VerseContentBlockStoreRequest $request,
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        Verse $verse,
        RegisteredContentBlockOrdering $contentBlockOrdering,
    ): RedirectResponse {
        $adminRouteContext = new VerseAdminRouteContext(
            $book,
            $bookSection,
            $chapter,
            $chapterSection,
            $verse,
        );
        $validated = $request->validated();
        $relativeBlockId = $validated['relative_block_id'] ?? null;
        $relativeBlock = is_numeric($relativeBlockId)
            ? ContentBlock::query()->find((int) $relativeBlockId)
            : null;

        if ($relativeBlock instanceof ContentBlock) {
            $adminRouteContext->abortUnlessContextualInsertionAnchor($relativeBlock);
        }

        $contentBlockOrdering->create(
            $verse,
            RegisteredContentBlock::createAttributes(
                $validated,
                includeDataJson: true,
            ),
            insertionMode: $this->nullableString(
                $validated['insertion_mode'] ?? null,
            ),
            relativeBlock: $relativeBlock,
        );

        return redirect()->back(status: 303);
    }

    /**
     * Update a verse-owned registered textual note block.
     */
    public function update(
        VerseContentBlockUpdateRequest $request,
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        Verse $verse,
        ContentBlock $contentBlock,
    ): RedirectResponse {
        $adminRouteContext = new VerseAdminRouteContext(
            $book,
            $bookSection,
            $chapter,
            $chapterSection,
            $verse,
        );

        $adminRouteContext->abortUnlessEditableNoteBlock($contentBlock);

        $contentBlock->update(
            RegisteredContentBlock::updateAttributes($request->validated()),
        );

        return redirect()->back(status: 303);
    }

    public function moveUp(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        Verse $verse,
        ContentBlock $contentBlock,
        RegisteredContentBlockOrdering $contentBlockOrdering,
    ): RedirectResponse {
        $adminRouteContext = new VerseAdminRouteContext(
            $book,
            $bookSection,
            $chapter,
            $chapterSection,
            $verse,
        );

        $adminRouteContext->abortUnlessEditableNoteBlock($contentBlock);

        $visibleSequence = $this->visibleSequence($verse, $adminRouteContext);

        abort_unless($visibleSequence->contains($contentBlock), 404);

        $anchorBlock = $visibleSequence->previousInSameRegion($contentBlock);

        abort_unless($anchorBlock instanceof ContentBlock, 404);

        $contentBlockOrdering->moveBefore($verse, $contentBlock, $anchorBlock);

        return redirect()->back(status: 303);
    }

    public function moveDown(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        Verse $verse,
        ContentBlock $contentBlock,
        RegisteredContentBlockOrdering $contentBlockOrdering,
    ): RedirectResponse {
        $adminRouteContext = new VerseAdminRouteContext(
            $book,
            $bookSection,
            $chapter,
            $chapterSection,
            $verse,
        );

        $adminRouteContext->abortUnlessEditableNoteBlock($contentBlock);

        $visibleSequence = $this->visibleSequence($verse, $adminRouteContext);

        abort_unless($visibleSequence->contains($contentBlock), 404);

        $anchorBlock = $visibleSequence->nextInSameRegion($contentBlock);

        abort_unless($anchorBlock instanceof ContentBlock, 404);

        $contentBlockOrdering->moveAfter($verse, $contentBlock, $anchorBlock);

        return redirect()->back(status: 303);
    }

    public function move(
        ContentBlockReorderRequest $request,
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        Verse $verse,
        ContentBlock $contentBlock,
        RegisteredContentBlockOrdering $contentBlockOrdering,
    ): RedirectResponse {
        $adminRouteContext = new VerseAdminRouteContext(
            $book,
            $bookSection,
            $chapter,
            $chapterSection,
            $verse,
        );

        $adminRouteContext->abortUnlessEditableNoteBlock($contentBlock);

        $visibleSequence = $this->visibleSequence($verse, $adminRouteContext);

        abort_unless($visibleSequence->contains($contentBlock), 404);

        $relativeBlock = ContentBlock::query()->findOrFail(
            (int) $request->validated('relative_block_id'),
        );

        abort_unless($visibleSequence->contains($relativeBlock), 404);
        abort_unless((int) $relativeBlock->getKey() !== (int) $contentBlock->getKey(), 404);
        abort_unless($relativeBlock->region === $contentBlock->region, 404);

        if ($request->validated('position') === 'before') {
            $contentBlockOrdering->moveBefore($verse, $contentBlock, $relativeBlock);
        } else {
            $contentBlockOrdering->moveAfter($verse, $contentBlock, $relativeBlock);
        }

        return redirect()->back(status: 303);
    }

    public function duplicate(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        Verse $verse,
        ContentBlock $contentBlock,
        RegisteredContentBlockOrdering $contentBlockOrdering,
    ): RedirectResponse {
        $adminRouteContext = new VerseAdminRouteContext(
            $book,
            $bookSection,
            $chapter,
            $chapterSection,
            $verse,
        );

        $adminRouteContext->abortUnlessDuplicableNoteBlock($contentBlock);

        $visibleSequence = $this->visibleSequence($verse, $adminRouteContext);

        abort_unless($visibleSequence->contains($contentBlock), 404);

        $contentBlockOrdering->create(
            $verse,
            ContentBlockDuplicate::attributes($contentBlock),
            insertionMode: 'after',
            relativeBlock: $contentBlock,
        );

        return redirect()->back(status: 303);
    }

    public function destroy(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        Verse $verse,
        ContentBlock $contentBlock,
        RegisteredContentBlockOrdering $contentBlockOrdering,
    ): RedirectResponse {
        $adminRouteContext = new VerseAdminRouteContext(
            $book,
            $bookSection,
            $chapter,
            $chapterSection,
            $verse,
        );

        $adminRouteContext->abortUnlessEditableNoteBlock($contentBlock);

        $visibleSequence = $this->visibleSequence($verse, $adminRouteContext);

        abort_unless($visibleSequence->contains($contentBlock), 404);

        $contentBlockOrdering->remove($verse, $contentBlock);

        return redirect()->back(status: 303);
    }

    private function nullableString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }

    private function visibleSequence(
        Verse $verse,
        ?VerseAdminRouteContext $adminRouteContext = null,
    ): VisibleContentBlockSequence
    {
        $adminRouteContext ??= new VerseAdminRouteContext(
            $verse->chapterSection->chapter->bookSection->book,
            $verse->chapterSection->chapter->bookSection,
            $verse->chapterSection->chapter,
            $verse->chapterSection,
            $verse,
        );

        return new VisibleContentBlockSequence(
            $verse->contentBlocks()
                ->published()
                ->whereIn('block_type', $adminRouteContext->contentBlockTypes())
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get(),
        );
    }
}
