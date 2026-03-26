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
use App\Support\Scripture\Admin\EditableTextNoteBlock;
use App\Support\Scripture\Admin\RegisteredContentBlockOrdering;
use App\Support\Scripture\Admin\VerseAdminRouteContext;
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
        RegisteredContentBlockOrdering $contentBlockOrdering,
    ): RedirectResponse {
        unset($book, $bookSection, $chapter, $chapterSection);

        $contentBlockOrdering->create(
            $verse,
            EditableTextNoteBlock::createAttributes($request->validated()),
        );

        return redirect()->back(status: 303);
    }

    /**
     * Update a verse-owned text note block.
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
        $adminRouteContext = new VerseAdminRouteContext(
            $book,
            $bookSection,
            $chapter,
            $chapterSection,
            $verse,
        );

        $adminRouteContext->abortUnlessEditableNoteBlock($contentBlock);

        $contentBlock->update(
            EditableTextNoteBlock::updateAttributes($request->validated()),
        );

        return redirect()->back(status: 303);
    }
}
