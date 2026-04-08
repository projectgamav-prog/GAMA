<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Support\Scripture\Admin\DeletesScriptureStructure;
use Illuminate\Http\RedirectResponse;

class BookAdminDeleteController extends Controller
{
    public function destroy(
        Book $book,
        DeletesScriptureStructure $deletesScriptureStructure,
    ): RedirectResponse {
        $deletesScriptureStructure->deleteBook($book);

        return redirect()->route('scripture.books.index', status: 303);
    }
}
