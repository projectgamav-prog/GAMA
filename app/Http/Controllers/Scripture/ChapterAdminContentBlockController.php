<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scripture\ChapterContentBlockStoreRequest;
use App\Http\Requests\Scripture\ChapterContentBlockUpdateRequest;
use App\Http\Requests\Scripture\ContentBlockReorderRequest;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ContentBlock;
use App\Support\Scripture\Admin\ChapterAdminRouteContext;
use App\Support\Scripture\Admin\ContentBlockDuplicate;
use App\Support\Scripture\Admin\RegisteredContentBlock;
use App\Support\Scripture\Admin\RegisteredContentBlockOrdering;
use App\Support\Scripture\Admin\VisibleContentBlockSequence;
use Illuminate\Http\RedirectResponse;

class ChapterAdminContentBlockController extends Controller
{
    /**
     * Create a new chapter-owned editorial note block.
     */
    public function store(
        ChapterContentBlockStoreRequest $request,
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        RegisteredContentBlockOrdering $contentBlockOrdering,
    ): RedirectResponse {
        $adminRouteContext = new ChapterAdminRouteContext($book, $bookSection, $chapter);
        $validated = $request->validated();
        $relativeBlockId = $validated['relative_block_id'] ?? null;
        $relativeBlock = is_numeric($relativeBlockId)
            ? ContentBlock::query()->find((int) $relativeBlockId)
            : null;

        if ($relativeBlock instanceof ContentBlock) {
            $adminRouteContext->abortUnlessContextualInsertionAnchor($relativeBlock);
        }

        $contentBlockOrdering->create(
            $chapter,
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
     * Update a chapter-owned registered textual note block.
     */
    public function update(
        ChapterContentBlockUpdateRequest $request,
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ContentBlock $contentBlock,
    ): RedirectResponse {
        $adminRouteContext = new ChapterAdminRouteContext($book, $bookSection, $chapter);

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
        ContentBlock $contentBlock,
        RegisteredContentBlockOrdering $contentBlockOrdering,
    ): RedirectResponse {
        $adminRouteContext = new ChapterAdminRouteContext($book, $bookSection, $chapter);

        $adminRouteContext->abortUnlessEditableNoteBlock($contentBlock);

        $visibleSequence = $this->visibleSequence($chapter, $adminRouteContext);

        abort_unless($visibleSequence->contains($contentBlock), 404);

        $anchorBlock = $visibleSequence->previousInSameRegion($contentBlock);

        abort_unless($anchorBlock instanceof ContentBlock, 404);

        $contentBlockOrdering->moveBefore($chapter, $contentBlock, $anchorBlock);

        return redirect()->back(status: 303);
    }

    public function moveDown(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ContentBlock $contentBlock,
        RegisteredContentBlockOrdering $contentBlockOrdering,
    ): RedirectResponse {
        $adminRouteContext = new ChapterAdminRouteContext($book, $bookSection, $chapter);

        $adminRouteContext->abortUnlessEditableNoteBlock($contentBlock);

        $visibleSequence = $this->visibleSequence($chapter, $adminRouteContext);

        abort_unless($visibleSequence->contains($contentBlock), 404);

        $anchorBlock = $visibleSequence->nextInSameRegion($contentBlock);

        abort_unless($anchorBlock instanceof ContentBlock, 404);

        $contentBlockOrdering->moveAfter($chapter, $contentBlock, $anchorBlock);

        return redirect()->back(status: 303);
    }

    public function move(
        ContentBlockReorderRequest $request,
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ContentBlock $contentBlock,
        RegisteredContentBlockOrdering $contentBlockOrdering,
    ): RedirectResponse {
        $adminRouteContext = new ChapterAdminRouteContext($book, $bookSection, $chapter);

        $adminRouteContext->abortUnlessEditableNoteBlock($contentBlock);

        $visibleSequence = $this->visibleSequence($chapter, $adminRouteContext);

        abort_unless($visibleSequence->contains($contentBlock), 404);

        $relativeBlock = ContentBlock::query()->findOrFail(
            (int) $request->validated('relative_block_id'),
        );

        abort_unless($visibleSequence->contains($relativeBlock), 404);
        abort_unless((int) $relativeBlock->getKey() !== (int) $contentBlock->getKey(), 404);
        abort_unless($relativeBlock->region === $contentBlock->region, 404);

        if ($request->validated('position') === 'before') {
            $contentBlockOrdering->moveBefore($chapter, $contentBlock, $relativeBlock);
        } else {
            $contentBlockOrdering->moveAfter($chapter, $contentBlock, $relativeBlock);
        }

        return redirect()->back(status: 303);
    }

    public function duplicate(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ContentBlock $contentBlock,
        RegisteredContentBlockOrdering $contentBlockOrdering,
    ): RedirectResponse {
        $adminRouteContext = new ChapterAdminRouteContext($book, $bookSection, $chapter);

        $adminRouteContext->abortUnlessDuplicableNoteBlock($contentBlock);

        $visibleSequence = $this->visibleSequence($chapter, $adminRouteContext);

        abort_unless($visibleSequence->contains($contentBlock), 404);

        $contentBlockOrdering->create(
            $chapter,
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
        ContentBlock $contentBlock,
        RegisteredContentBlockOrdering $contentBlockOrdering,
    ): RedirectResponse {
        $adminRouteContext = new ChapterAdminRouteContext($book, $bookSection, $chapter);

        $adminRouteContext->abortUnlessEditableNoteBlock($contentBlock);

        $visibleSequence = $this->visibleSequence($chapter, $adminRouteContext);

        abort_unless($visibleSequence->contains($contentBlock), 404);

        $contentBlockOrdering->remove($chapter, $contentBlock);

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
        Chapter $chapter,
        ?ChapterAdminRouteContext $adminRouteContext = null,
    ): VisibleContentBlockSequence
    {
        $adminRouteContext ??= new ChapterAdminRouteContext(
            $chapter->bookSection->book,
            $chapter->bookSection,
            $chapter,
        );

        return new VisibleContentBlockSequence(
            $chapter->contentBlocks()
                ->published()
                ->whereIn('block_type', $adminRouteContext->contentBlockTypes())
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get(),
        );
    }
}
