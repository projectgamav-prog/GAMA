<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scripture\EditableTextContentBlockStoreRequest;
use App\Http\Requests\Scripture\EditableTextContentBlockUpdateRequest;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ContentBlock;
use App\Support\Scripture\Admin\ChapterAdminRouteContext;
use App\Support\Scripture\Admin\EditableTextNoteBlock;
use Illuminate\Http\RedirectResponse;

class ChapterAdminContentBlockController extends Controller
{
    /**
     * Create a new chapter-owned editorial note block.
     */
    public function store(
        EditableTextContentBlockStoreRequest $request,
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
    ): RedirectResponse {
        unset($book, $bookSection);

        $chapter->contentBlocks()->create(
            EditableTextNoteBlock::createAttributes($request->validated()),
        );

        return redirect()->back(status: 303);
    }

    /**
     * Update a chapter-owned text note block.
     */
    public function update(
        EditableTextContentBlockUpdateRequest $request,
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ContentBlock $contentBlock,
    ): RedirectResponse {
        $adminRouteContext = new ChapterAdminRouteContext($book, $bookSection, $chapter);

        $adminRouteContext->abortUnlessEditableNoteBlock($contentBlock);

        $contentBlock->update(
            EditableTextNoteBlock::updateAttributes($request->validated()),
        );

        return redirect()->back(status: 303);
    }
}
