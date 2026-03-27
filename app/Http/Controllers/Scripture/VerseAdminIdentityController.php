<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scripture\VerseAdminIdentityUpdateRequest;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\Verse;
use Illuminate\Http\RedirectResponse;

class VerseAdminIdentityController extends Controller
{
    /**
     * Update the canonical verse identity fields for the current proof phase.
     */
    public function update(
        VerseAdminIdentityUpdateRequest $request,
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        Verse $verse,
    ): RedirectResponse {
        unset($book, $bookSection, $chapter, $chapterSection);

        $validated = $request->validated();

        $verse->update([
            'slug' => trim($validated['slug']),
            'number' => $this->nullableString($validated['number'] ?? null),
            'text' => trim($validated['text']),
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
