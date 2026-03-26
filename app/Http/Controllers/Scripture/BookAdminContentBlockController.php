<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scripture\BookAdminContentBlockStoreRequest;
use App\Http\Requests\Scripture\BookAdminContentBlockUpdateRequest;
use App\Models\Book;
use App\Models\ContentBlock;
use App\Support\Scripture\Admin\BookAdminRouteContext;
use Illuminate\Http\RedirectResponse;

class BookAdminContentBlockController extends Controller
{
    /**
     * Create a registered book-owned editorial content block.
     */
    public function store(
        BookAdminContentBlockStoreRequest $request,
        Book $book,
    ): RedirectResponse {
        $book->contentBlocks()->create(
            $this->attributes($request->validated(), includeDataJson: true),
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
            $this->attributes($request->validated()),
        );

        return redirect()->back(status: 303);
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function attributes(array $validated, bool $includeDataJson = false): array
    {
        $attributes = [
            'region' => trim((string) $validated['region']),
            'block_type' => trim((string) $validated['block_type']),
            'title' => $this->nullableString($validated['title'] ?? null),
            'body' => trim((string) $validated['body']),
            'sort_order' => $validated['sort_order'],
            'status' => $validated['status'],
        ];

        if ($includeDataJson) {
            $attributes['data_json'] = null;
        }

        return $attributes;
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
