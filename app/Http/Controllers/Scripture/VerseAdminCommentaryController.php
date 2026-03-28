<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scripture\VerseCommentaryStoreRequest;
use App\Http\Requests\Scripture\VerseCommentaryUpdateRequest;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\Verse;
use App\Models\VerseCommentary;
use Illuminate\Http\RedirectResponse;

class VerseAdminCommentaryController extends Controller
{
    public function store(
        VerseCommentaryStoreRequest $request,
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        Verse $verse,
    ): RedirectResponse {
        unset($book, $bookSection, $chapter, $chapterSection);

        $verse->commentaries()->create($this->attributes($request->validated()));

        return redirect()->back(status: 303);
    }

    public function update(
        VerseCommentaryUpdateRequest $request,
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        Verse $verse,
        VerseCommentary $commentary,
    ): RedirectResponse {
        unset($book, $bookSection, $chapter, $chapterSection);

        abort_unless((int) $commentary->verse_id === (int) $verse->getKey(), 404);

        $commentary->update($this->attributes($request->validated()));

        return redirect()->back(status: 303);
    }

    public function destroy(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        Verse $verse,
        VerseCommentary $commentary,
    ): RedirectResponse {
        unset($book, $bookSection, $chapter, $chapterSection);

        abort_unless((int) $commentary->verse_id === (int) $verse->getKey(), 404);

        $commentary->delete();

        return redirect()->back(status: 303);
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function attributes(array $validated): array
    {
        return [
            'source_key' => $validated['source_key'],
            'source_name' => $validated['source_name'],
            'commentary_source_id' => $validated['commentary_source_id'] ?? null,
            'author_name' => $validated['author_name'] ?? null,
            'language_code' => $validated['language_code'],
            'title' => $validated['title'] ?? null,
            'body' => $validated['body'],
            'sort_order' => $validated['sort_order'],
        ];
    }
}
