<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scripture\ChapterAdminStoreRequest;
use App\Models\Book;
use App\Models\BookSection;
use Illuminate\Http\RedirectResponse;

class ChapterAdminCreateController extends Controller
{
    /**
     * Create a canonical chapter row under the current book section.
     */
    public function store(
        ChapterAdminStoreRequest $request,
        Book $book,
        BookSection $bookSection,
    ): RedirectResponse {
        unset($book);

        $validated = $request->validated();

        $bookSection->chapters()->create([
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
