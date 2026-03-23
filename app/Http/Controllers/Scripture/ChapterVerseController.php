<?php

namespace App\Http\Controllers\Scripture;

use App\Actions\Scripture\BuildChapterVerseReaderData;
use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Support\Scripture\PublicScriptureData;
use Inertia\Inertia;
use Inertia\Response;

class ChapterVerseController extends Controller
{
    /**
     * Display a read-only verse reader for a chapter.
     */
    public function index(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        BuildChapterVerseReaderData $buildChapterVerseReaderData,
        PublicScriptureData $publicScriptureData,
    ): Response
    {
        $readerData = $buildChapterVerseReaderData->handle(
            $book,
            $bookSection,
            $chapter,
        );

        return Inertia::render('scripture/chapters/verses/index', [
            'book' => $publicScriptureData->book($book),
            'book_section' => $publicScriptureData->bookSection($book, $bookSection),
            'chapter' => $publicScriptureData->chapter($book, $bookSection, $chapter),
            'reader_languages' => $readerData['reader_languages'],
            'default_language' => $readerData['default_language'],
            'chapter_sections' => $readerData['chapter_sections'],
        ]);
    }
}
