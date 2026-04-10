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
            'description' => $request->validated('description'),
        ]);

        return redirect()->back(status: 303);
    }
}
