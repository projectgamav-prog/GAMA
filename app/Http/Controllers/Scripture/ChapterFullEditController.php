<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use Illuminate\Http\RedirectResponse;

class ChapterFullEditController extends Controller
{
    /**
     * Deprecated route-specific full edit now bypasses the old React page.
     */
    public function show(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
    ): RedirectResponse {
        return redirect()->route('admin.schema.full-edit', [
            'schemaFamily' => 'scripture',
            'entityType' => 'chapter',
            'id' => $chapter->id,
        ]);
    }
}
