<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\RedirectResponse;

class BookFullEditController extends Controller
{
    /**
     * Deprecated route-specific full edit now bypasses the old React page.
     */
    public function show(Book $book): RedirectResponse
    {
        return redirect()->route('admin.schema.full-edit', [
            'schemaFamily' => 'scripture',
            'entityType' => 'book',
            'id' => $book->id,
        ]);
    }
}
