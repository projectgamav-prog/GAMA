<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scripture\BookSectionContentBlockStoreRequest;
use App\Http\Requests\Scripture\BookSectionContentBlockUpdateRequest;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\ContentBlock;
use App\Support\Scripture\Admin\BookSectionAdminRouteContext;
use App\Support\Scripture\Admin\RegisteredContentBlock;
use App\Support\Scripture\Admin\RegisteredContentBlockOrdering;
use Illuminate\Http\RedirectResponse;

class BookSectionAdminContentBlockController extends Controller
{
    /**
     * Create a new book-section-owned intro block.
     */
    public function store(
        BookSectionContentBlockStoreRequest $request,
        Book $book,
        BookSection $bookSection,
        RegisteredContentBlockOrdering $contentBlockOrdering,
    ): RedirectResponse {
        $adminRouteContext = new BookSectionAdminRouteContext($book, $bookSection);
        $validated = $request->validated();
        $relativeBlockId = $validated['relative_block_id'] ?? null;
        $relativeBlock = is_numeric($relativeBlockId)
            ? ContentBlock::query()->find((int) $relativeBlockId)
            : null;

        if ($relativeBlock instanceof ContentBlock) {
            $adminRouteContext->abortUnlessContextualInsertionAnchor($relativeBlock);
        }

        $contentBlockOrdering->create(
            $bookSection,
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
     * Update a book-section-owned intro block.
     */
    public function update(
        BookSectionContentBlockUpdateRequest $request,
        Book $book,
        BookSection $bookSection,
        ContentBlock $contentBlock,
    ): RedirectResponse {
        $adminRouteContext = new BookSectionAdminRouteContext($book, $bookSection);

        $adminRouteContext->abortUnlessEditableIntroBlock($contentBlock);

        $contentBlock->update(
            RegisteredContentBlock::updateAttributes(
                $request->validated(),
                includeDataJson: true,
            ),
        );

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
