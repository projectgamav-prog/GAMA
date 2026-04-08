<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scripture\ChapterSectionContentBlockStoreRequest;
use App\Http\Requests\Scripture\ChapterSectionContentBlockUpdateRequest;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\ContentBlock;
use App\Support\Scripture\Admin\ChapterSectionAdminRouteContext;
use App\Support\Scripture\Admin\RegisteredContentBlock;
use App\Support\Scripture\Admin\RegisteredContentBlockOrdering;
use Illuminate\Http\RedirectResponse;

class ChapterSectionAdminContentBlockController extends Controller
{
    /**
     * Create a new chapter-section-owned intro block.
     */
    public function store(
        ChapterSectionContentBlockStoreRequest $request,
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        RegisteredContentBlockOrdering $contentBlockOrdering,
    ): RedirectResponse {
        $adminRouteContext = new ChapterSectionAdminRouteContext(
            $book,
            $bookSection,
            $chapter,
            $chapterSection,
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
            $chapterSection,
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
     * Update a chapter-section-owned intro block.
     */
    public function update(
        ChapterSectionContentBlockUpdateRequest $request,
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        ContentBlock $contentBlock,
    ): RedirectResponse {
        $adminRouteContext = new ChapterSectionAdminRouteContext(
            $book,
            $bookSection,
            $chapter,
            $chapterSection,
        );

        $adminRouteContext->abortUnlessEditableIntroBlock($contentBlock);

        $contentBlock->update(
            RegisteredContentBlock::updateAttributes(
                $request->validated(),
                includeDataJson: true,
            ),
        );

        return redirect()->back(status: 303);
    }

    /**
     * Delete a chapter-section-owned intro block.
     */
    public function destroy(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        ContentBlock $contentBlock,
    ): RedirectResponse {
        $adminRouteContext = new ChapterSectionAdminRouteContext(
            $book,
            $bookSection,
            $chapter,
            $chapterSection,
        );

        $adminRouteContext->abortUnlessEditableIntroBlock($contentBlock);

        $contentBlock->delete();

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
}
