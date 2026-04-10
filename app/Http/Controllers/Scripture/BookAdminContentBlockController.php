<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scripture\BookAdminContentBlockStoreRequest;
use App\Http\Requests\Scripture\BookAdminContentBlockUpdateRequest;
use App\Http\Requests\Scripture\ContentBlockReorderRequest;
use App\Models\Book;
use App\Models\ContentBlock;
use App\Support\Scripture\Admin\BookAdminRouteContext;
use App\Support\Scripture\Admin\BookContentBlockOrdering;
use App\Support\Scripture\Admin\ContentBlockDuplicate;
use App\Support\Scripture\Admin\RegisteredContentBlock;
use App\Support\Scripture\Admin\VisibleContentBlockSequence;
use Illuminate\Http\RedirectResponse;

/**
 * Transitional fallback controller for canonical full-edit registered blocks.
 *
 * This controller intentionally remains outside the active public live editing
 * path. Keep it available for protected full-edit maintenance of already-saved
 * editorial block data until that fallback is formally retired.
 */
class BookAdminContentBlockController extends Controller
{
    /**
     * Create a registered book-owned editorial content block.
     */
    public function store(
        BookAdminContentBlockStoreRequest $request,
        Book $book,
        BookContentBlockOrdering $ordering,
    ): RedirectResponse {
        $validated = $request->validated();
        $adminRouteContext = new BookAdminRouteContext($book);
        $relativeBlockId = $validated['relative_block_id'] ?? null;
        $relativeBlock = is_numeric($relativeBlockId)
            ? ContentBlock::query()->find((int) $relativeBlockId)
            : null;

        if ($relativeBlock instanceof ContentBlock) {
            $adminRouteContext->abortUnlessContextualInsertionAnchor($relativeBlock);
        }

        $ordering->create(
            $book,
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
     * Update a registered book-owned editorial content block.
     */
    public function update(
        BookAdminContentBlockUpdateRequest $request,
        Book $book,
        ContentBlock $contentBlock,
    ): RedirectResponse {
        $adminRouteContext = new BookAdminRouteContext($book);

        $adminRouteContext->abortUnlessEditableContentBlock($contentBlock);

        $contentBlock->update(
            RegisteredContentBlock::updateAttributes(
                $request->validated(),
                includeDataJson: true,
            ),
        );

        return redirect()->back(status: 303);
    }

    public function moveUp(
        Book $book,
        ContentBlock $contentBlock,
        BookContentBlockOrdering $ordering,
    ): RedirectResponse {
        $adminRouteContext = new BookAdminRouteContext($book);

        $adminRouteContext->abortUnlessEditableContentBlock($contentBlock);

        $visibleSequence = $this->visibleSequence($book, $adminRouteContext);

        abort_unless($visibleSequence->contains($contentBlock), 404);

        $anchorBlock = $visibleSequence->previousInSameRegion($contentBlock);

        abort_unless($anchorBlock instanceof ContentBlock, 404);

        $ordering->moveBefore($book, $contentBlock, $anchorBlock);

        return redirect()->back(status: 303);
    }

    public function moveDown(
        Book $book,
        ContentBlock $contentBlock,
        BookContentBlockOrdering $ordering,
    ): RedirectResponse {
        $adminRouteContext = new BookAdminRouteContext($book);

        $adminRouteContext->abortUnlessEditableContentBlock($contentBlock);

        $visibleSequence = $this->visibleSequence($book, $adminRouteContext);

        abort_unless($visibleSequence->contains($contentBlock), 404);

        $anchorBlock = $visibleSequence->nextInSameRegion($contentBlock);

        abort_unless($anchorBlock instanceof ContentBlock, 404);

        $ordering->moveAfter($book, $contentBlock, $anchorBlock);

        return redirect()->back(status: 303);
    }

    public function move(
        ContentBlockReorderRequest $request,
        Book $book,
        ContentBlock $contentBlock,
        BookContentBlockOrdering $ordering,
    ): RedirectResponse {
        $adminRouteContext = new BookAdminRouteContext($book);

        $adminRouteContext->abortUnlessEditableContentBlock($contentBlock);

        $visibleSequence = $this->visibleSequence($book, $adminRouteContext);

        abort_unless($visibleSequence->contains($contentBlock), 404);

        $relativeBlock = ContentBlock::query()->findOrFail(
            (int) $request->validated('relative_block_id'),
        );

        abort_unless($visibleSequence->contains($relativeBlock), 404);
        abort_unless((int) $relativeBlock->getKey() !== (int) $contentBlock->getKey(), 404);
        abort_unless($relativeBlock->region === $contentBlock->region, 404);

        if ($request->validated('position') === 'before') {
            $ordering->moveBefore($book, $contentBlock, $relativeBlock);
        } else {
            $ordering->moveAfter($book, $contentBlock, $relativeBlock);
        }

        return redirect()->back(status: 303);
    }

    public function duplicate(
        Book $book,
        ContentBlock $contentBlock,
        BookContentBlockOrdering $ordering,
    ): RedirectResponse {
        $adminRouteContext = new BookAdminRouteContext($book);

        $adminRouteContext->abortUnlessDuplicableContentBlock($contentBlock);

        $visibleSequence = $this->visibleSequence($book, $adminRouteContext);

        abort_unless($visibleSequence->contains($contentBlock), 404);

        $ordering->create(
            $book,
            ContentBlockDuplicate::attributes($contentBlock),
            insertionMode: 'after',
            relativeBlock: $contentBlock,
        );

        return redirect()->back(status: 303);
    }

    public function destroy(
        Book $book,
        ContentBlock $contentBlock,
        BookContentBlockOrdering $ordering,
    ): RedirectResponse {
        $adminRouteContext = new BookAdminRouteContext($book);

        $adminRouteContext->abortUnlessEditableContentBlock($contentBlock);

        $visibleSequence = $this->visibleSequence($book, $adminRouteContext);

        abort_unless($visibleSequence->contains($contentBlock), 404);

        $ordering->remove($book, $contentBlock);

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
        Book $book,
        BookAdminRouteContext $adminRouteContext,
    ): VisibleContentBlockSequence {
        return new VisibleContentBlockSequence(
            $book->contentBlocks()
                ->published()
                ->whereIn('block_type', $adminRouteContext->editableContentBlockTypes())
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get(),
        );
    }
}
