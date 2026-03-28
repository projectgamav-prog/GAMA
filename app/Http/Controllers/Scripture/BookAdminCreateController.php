<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scripture\BookAdminStoreRequest;
use App\Models\Book;
use Illuminate\Http\RedirectResponse;

class BookAdminCreateController extends Controller
{
    /**
     * Create a canonical book row.
     */
    public function store(BookAdminStoreRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        Book::query()->create([
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
