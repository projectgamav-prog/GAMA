<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scripture\BookAdminContentBlockStoreRequest;
use App\Http\Requests\Scripture\BookAdminContentBlockUpdateRequest;
use App\Models\Book;
use App\Models\ContentBlock;
use App\Support\Scripture\Admin\BookAdminRouteContext;
use App\Support\Scripture\Admin\BookContentBlockOrdering;
use App\Support\Scripture\Admin\RegisteredContentBlock;
use Illuminate\Http\RedirectResponse;

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
            RegisteredContentBlock::updateAttributes($request->validated()),
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
