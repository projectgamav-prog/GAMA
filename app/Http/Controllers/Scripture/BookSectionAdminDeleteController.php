<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookSection;
use App\Support\Scripture\Admin\BookAdminRouteContext;
use App\Support\Scripture\Admin\DeletesScriptureStructure;
use Illuminate\Http\RedirectResponse;

class BookSectionAdminDeleteController extends Controller
{
    public function destroy(
        Book $book,
        BookSection $bookSection,
        DeletesScriptureStructure $deletesScriptureStructure,
    ): RedirectResponse {
        $deletesScriptureStructure->deleteBookSection($bookSection);

        return redirect()->to((new BookAdminRouteContext($book))->bookHref(), 303);
    }
}
