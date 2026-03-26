<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scripture\VerseContentBlockStoreRequest;
use App\Http\Requests\Scripture\VerseContentBlockUpdateRequest;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\ContentBlock;
use App\Models\Verse;
use Illuminate\Http\RedirectResponse;

class VerseAdminContentBlockController extends Controller
{
    /**
     * Create a new verse-owned editorial note block.
     */
    public function store(
        VerseContentBlockStoreRequest $request,
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        Verse $verse,
    ): RedirectResponse {
        unset($book, $bookSection, $chapter, $chapterSection);

        $validated = $request->validated();

        $verse->contentBlocks()->create([
            'region' => trim($validated['region']),
            'block_type' => 'text',
            'title' => $this->nullableString($validated['title'] ?? null),
            'body' => trim($validated['body']),
            'data_json' => null,
            'sort_order' => $validated['sort_order'],
            'status' => $validated['status'],
        ]);

        return redirect()->back(status: 303);
    }

    /**
     * Update a verse-owned content block.
     */
    public function update(
        VerseContentBlockUpdateRequest $request,
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        Verse $verse,
        ContentBlock $contentBlock,
    ): RedirectResponse {
        unset($book, $bookSection, $chapter, $chapterSection);

        $this->abortUnlessOwnedByVerse($verse, $contentBlock);

        $validated = $request->validated();

        $contentBlock->update([
            'region' => trim($validated['region']),
            'title' => $this->nullableString($validated['title'] ?? null),
            'body' => trim($validated['body']),
            'sort_order' => $validated['sort_order'],
            'status' => $validated['status'],
        ]);

        return redirect()->back(status: 303);
    }

    private function abortUnlessOwnedByVerse(Verse $verse, ContentBlock $contentBlock): void
    {
        abort_unless(
            $contentBlock->parent_type === $verse->getMorphClass()
                && (int) $contentBlock->parent_id === (int) $verse->getKey(),
            404,
        );
    }

    private function nullableString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }
}
