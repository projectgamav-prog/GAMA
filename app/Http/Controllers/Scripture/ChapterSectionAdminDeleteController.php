<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Support\Scripture\Admin\ChapterAdminRouteContext;
use App\Support\Scripture\Admin\DeletesScriptureStructure;
use Illuminate\Http\RedirectResponse;

class ChapterSectionAdminDeleteController extends Controller
{
    public function destroy(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        DeletesScriptureStructure $deletesScriptureStructure,
    ): RedirectResponse {
        $deletesScriptureStructure->deleteChapterSection($chapterSection);

        return redirect()->to(
            (new ChapterAdminRouteContext($book, $bookSection, $chapter))->chapterHref(),
            303,
        );
    }
}
