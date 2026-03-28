<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scripture\ChapterSectionAdminDetailsUpdateRequest;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use Illuminate\Http\RedirectResponse;

class ChapterSectionAdminDetailsController extends Controller
{
    /**
     * Update basic row details for a chapter section.
     */
    public function update(
        ChapterSectionAdminDetailsUpdateRequest $request,
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
    ): RedirectResponse {
        unset($book, $bookSection, $chapter);

        $chapterSection->update([
            'number' => $this->nullableString($request->validated('number')),
            'title' => $this->nullableString($request->validated('title')),
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
