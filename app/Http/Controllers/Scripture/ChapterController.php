<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Support\Scripture\PublicScriptureData;
use Inertia\Inertia;
use Inertia\Response;

class ChapterController extends Controller
{
    /**
     * Display a read-only chapter overview page.
     */
    public function show(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        PublicScriptureData $publicScriptureData,
    ): Response
    {
        $contentBlocks = $chapter->contentBlocks()
            ->published()
            ->get();

        $chapterSections = $chapter->chapterSections()
            ->withCount('verses')
            ->inCanonicalOrder()
            ->get();

        return Inertia::render('scripture/chapters/show', [
            'book' => $publicScriptureData->book($book),
            'book_section' => $publicScriptureData->bookSection($book, $bookSection),
            'chapter' => $publicScriptureData->chapter($book, $bookSection, $chapter),
            'content_blocks' => $publicScriptureData->contentBlocks($contentBlocks),
            'chapter_sections' => $publicScriptureData->chapterSections(
                $book,
                $bookSection,
                $chapter,
                $chapterSections,
            ),
        ]);
    }
}
