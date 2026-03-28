<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scripture\BookSectionAdminDetailsUpdateRequest;
use App\Models\Book;
use App\Models\BookSection;
use Illuminate\Http\RedirectResponse;

class BookSectionAdminDetailsController extends Controller
{
    /**
     * Update basic row details for a book section.
     */
    public function update(
        BookSectionAdminDetailsUpdateRequest $request,
        Book $book,
        BookSection $bookSection,
    ): RedirectResponse {
        unset($book);

        $bookSection->update([
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
