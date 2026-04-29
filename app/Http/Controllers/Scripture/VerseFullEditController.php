<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\Verse;
use Illuminate\Http\RedirectResponse;

class VerseFullEditController extends Controller
{
    /**
     * Deprecated route-specific full edit now bypasses the old React page.
     */
    public function show(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        Verse $verse,
    ): RedirectResponse {
        return redirect()->route('admin.schema.full-edit', [
            'schemaFamily' => 'scripture',
            'entityType' => 'verse',
            'id' => $verse->id,
        ]);
    }
}
