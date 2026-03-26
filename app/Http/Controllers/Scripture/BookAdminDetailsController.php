<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scripture\BookAdminDetailsUpdateRequest;
use App\Models\Book;
use Illuminate\Http\RedirectResponse;

class BookAdminDetailsController extends Controller
{
    /**
     * Update book-level editorial details.
     */
    public function update(
        BookAdminDetailsUpdateRequest $request,
        Book $book,
    ): RedirectResponse {
        $book->update([
            'description' => $this->nullableString($request->validated('description')),
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
