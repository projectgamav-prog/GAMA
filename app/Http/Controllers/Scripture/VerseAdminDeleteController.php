<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\Verse;
use App\Support\Scripture\Admin\ChapterAdminRouteContext;
use App\Support\Scripture\Admin\DeletesScriptureStructure;
use Illuminate\Http\RedirectResponse;

class VerseAdminDeleteController extends Controller
{
    /**
     * Delete a verse and its verse-owned editorial data, then return to the chapter list.
     */
    public function destroy(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        Verse $verse,
        DeletesScriptureStructure $deletesScriptureStructure,
    ): RedirectResponse {
        unset($chapterSection);

        $deletesScriptureStructure->deleteVerse($verse);

        return redirect()->to(
            (new ChapterAdminRouteContext($book, $bookSection, $chapter))->chapterHref(),
            303,
        );
    }
}
