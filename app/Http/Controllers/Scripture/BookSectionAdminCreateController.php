<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scripture\BookSectionAdminStoreRequest;
use App\Models\Book;
use Illuminate\Http\RedirectResponse;

class BookSectionAdminCreateController extends Controller
{
    /**
     * Create a canonical book-section row under the current book.
     */
    public function store(
        BookSectionAdminStoreRequest $request,
        Book $book,
    ): RedirectResponse {
        $validated = $request->validated();

        $book->bookSections()->create([
            'slug' => trim($validated['slug']),
            'number' => $this->nullableString($validated['number'] ?? null),
            'title' => $this->nullableString($validated['title'] ?? null),
        ]);

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
