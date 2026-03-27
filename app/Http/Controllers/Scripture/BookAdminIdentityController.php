<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scripture\BookAdminIdentityUpdateRequest;
use App\Models\Book;
use Illuminate\Http\RedirectResponse;

class BookAdminIdentityController extends Controller
{
    /**
     * Update the canonical book identity fields for the current proof phase.
     */
    public function update(
        BookAdminIdentityUpdateRequest $request,
        Book $book,
    ): RedirectResponse {
        $validated = $request->validated();

        $book->update([
            'slug' => trim($validated['slug']),
            'number' => $this->nullableString($validated['number'] ?? null),
            'title' => trim($validated['title']),
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
