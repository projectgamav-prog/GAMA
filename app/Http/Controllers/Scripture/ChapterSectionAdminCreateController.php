<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scripture\ChapterSectionAdminStoreRequest;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use Illuminate\Http\RedirectResponse;

class ChapterSectionAdminCreateController extends Controller
{
    /**
     * Create a canonical chapter-section row under the current chapter.
     */
    public function store(
        ChapterSectionAdminStoreRequest $request,
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
    ): RedirectResponse {
        unset($book, $bookSection);

        $validated = $request->validated();

        $chapter->chapterSections()->create([
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
