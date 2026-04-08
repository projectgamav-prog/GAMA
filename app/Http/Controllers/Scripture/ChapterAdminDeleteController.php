<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Support\Scripture\Admin\BookAdminRouteContext;
use App\Support\Scripture\Admin\DeletesScriptureStructure;
use Illuminate\Http\RedirectResponse;

class ChapterAdminDeleteController extends Controller
{
    public function destroy(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        DeletesScriptureStructure $deletesScriptureStructure,
    ): RedirectResponse {
        unset($bookSection);

        $deletesScriptureStructure->deleteChapter($chapter);

        return redirect()->to((new BookAdminRouteContext($book))->bookHref(), 303);
    }
}
