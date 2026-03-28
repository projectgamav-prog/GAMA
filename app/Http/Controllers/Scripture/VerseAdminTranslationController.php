<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scripture\VerseTranslationStoreRequest;
use App\Http\Requests\Scripture\VerseTranslationUpdateRequest;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\Verse;
use App\Models\VerseTranslation;
use Illuminate\Http\RedirectResponse;

class VerseAdminTranslationController extends Controller
{
    public function store(
        VerseTranslationStoreRequest $request,
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        Verse $verse,
    ): RedirectResponse {
        unset($book, $bookSection, $chapter, $chapterSection);

        $verse->translations()->create($this->attributes($request->validated()));

        return redirect()->back(status: 303);
    }

    public function update(
        VerseTranslationUpdateRequest $request,
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        Verse $verse,
        VerseTranslation $translation,
    ): RedirectResponse {
        unset($book, $bookSection, $chapter, $chapterSection);

        abort_unless((int) $translation->verse_id === (int) $verse->getKey(), 404);

        $translation->update($this->attributes($request->validated()));

        return redirect()->back(status: 303);
    }

    public function destroy(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        Verse $verse,
        VerseTranslation $translation,
    ): RedirectResponse {
        unset($book, $bookSection, $chapter, $chapterSection);

        abort_unless((int) $translation->verse_id === (int) $verse->getKey(), 404);

        $translation->delete();

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
            'translation_source_id' => $validated['translation_source_id'] ?? null,
            'language_code' => $validated['language_code'],
            'text' => $validated['text'],
            'sort_order' => $validated['sort_order'],
        ];
    }
}
