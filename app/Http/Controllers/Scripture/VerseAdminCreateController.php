<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scripture\VerseAdminStoreRequest;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use Illuminate\Http\RedirectResponse;

class VerseAdminCreateController extends Controller
{
    /**
     * Create a canonical verse row under the current chapter section.
     */
    public function store(
        VerseAdminStoreRequest $request,
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
    ): RedirectResponse {
        unset($book, $bookSection, $chapter);

        $validated = $request->validated();

        $chapterSection->verses()->create([
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
