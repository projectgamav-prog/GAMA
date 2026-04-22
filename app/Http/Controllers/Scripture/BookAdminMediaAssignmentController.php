<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scripture\BookAdminMediaAssignmentAttachRequest;
use App\Http\Requests\Scripture\BookAdminMediaAssignmentReplaceMediaRequest;
use App\Http\Requests\Scripture\BookAdminMediaAssignmentStoreRequest;
use App\Http\Requests\Scripture\BookAdminMediaAssignmentUpdateRequest;
use App\Models\Book;
use App\Models\MediaAssignment;
use App\Support\Scripture\Admin\BookAdminRouteContext;
use Illuminate\Http\RedirectResponse;

class BookAdminMediaAssignmentController extends Controller
{
    /**
     * Attach a new book-owned media assignment through the narrow inline path.
     */
    public function attach(
        BookAdminMediaAssignmentAttachRequest $request,
        Book $book,
    ): RedirectResponse {
        $book->mediaAssignments()->create([
            'media_id' => $request->integer('media_id'),
            'role' => trim((string) $request->string('role')),
            'title_override' => null,
            'caption_override' => null,
            'sort_order' => $this->nextSortOrder($book),
            'status' => 'draft',
            'meta_json' => null,
        ]);

        return redirect()->back(status: 303);
    }

    /**
     * Create a new book-owned media assignment.
     */
    public function store(
        BookAdminMediaAssignmentStoreRequest $request,
        Book $book,
    ): RedirectResponse {
        $book->mediaAssignments()->create(
            $this->attributes($request->validated(), includeMetaJson: true),
        );

        return redirect()->back(status: 303);
    }

    /**
     * Update a book-owned media assignment.
     */
    public function update(
        BookAdminMediaAssignmentUpdateRequest $request,
        Book $book,
        MediaAssignment $mediaAssignment,
    ): RedirectResponse {
        $adminRouteContext = new BookAdminRouteContext($book);

        $adminRouteContext->abortUnlessOwnsMediaAssignment($mediaAssignment);

        $mediaAssignment->update(
            $this->attributes($request->validated()),
        );

        return redirect()->back(status: 303);
    }

    /**
     * Replace only the linked media record for an existing assignment.
     */
    public function replaceMedia(
        BookAdminMediaAssignmentReplaceMediaRequest $request,
        Book $book,
        MediaAssignment $mediaAssignment,
    ): RedirectResponse {
        $adminRouteContext = new BookAdminRouteContext($book);

        $adminRouteContext->abortUnlessOwnsMediaAssignment($mediaAssignment);

        $mediaAssignment->update([
            'media_id' => $request->integer('media_id'),
        ]);

        return redirect()->back(status: 303);
    }

    /**
     * Delete a book-owned media assignment.
     */
    public function destroy(
        Book $book,
        MediaAssignment $mediaAssignment,
    ): RedirectResponse {
        $adminRouteContext = new BookAdminRouteContext($book);

        $adminRouteContext->abortUnlessOwnsMediaAssignment($mediaAssignment);

        $mediaAssignment->delete();

        return redirect()->back(status: 303);
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function attributes(array $validated, bool $includeMetaJson = false): array
    {
        $attributes = [
            'media_id' => $validated['media_id'],
            'role' => trim((string) $validated['role']),
            'title_override' => $this->nullableString($validated['title_override'] ?? null),
            'caption_override' => $this->nullableString($validated['caption_override'] ?? null),
            'sort_order' => $validated['sort_order'],
            'status' => $validated['status'],
        ];

        if ($includeMetaJson) {
            $attributes['meta_json'] = null;
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

    private function nextSortOrder(Book $book): int
    {
        $maxSortOrder = $book->mediaAssignments()->max('sort_order');

        return $maxSortOrder === null ? 1 : ((int) $maxSortOrder) + 1;
    }
}
