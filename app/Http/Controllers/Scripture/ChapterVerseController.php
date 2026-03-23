<?php

namespace App\Http\Controllers\Scripture;

use App\Actions\Scripture\BuildChapterVerseReaderData;
use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
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
    ): Response
    {
        $bookHref = route('scripture.books.show', $book);
        $bookSectionHref = $bookHref.'#section-'.$bookSection->slug;

        $readerData = $buildChapterVerseReaderData->handle(
            $book,
            $bookSection,
            $chapter,
        );

        return Inertia::render('scripture/chapters/verses/index', [
            'book' => [
                'id' => $book->id,
                'slug' => $book->slug,
                'number' => $book->number,
                'title' => $book->title,
                'href' => $bookHref,
            ],
            'book_section' => [
                'id' => $bookSection->id,
                'slug' => $bookSection->slug,
                'number' => $bookSection->number,
                'title' => $bookSection->title,
                'href' => $bookSectionHref,
            ],
            'chapter' => [
                'id' => $chapter->id,
                'slug' => $chapter->slug,
                'number' => $chapter->number,
                'title' => $chapter->title,
                'href' => route('scripture.chapters.show', [
                    'book' => $book,
                    'bookSection' => $bookSection,
                    'chapter' => $chapter,
                ]),
                'verses_href' => route('scripture.chapters.verses.index', [
                    'book' => $book,
                    'bookSection' => $bookSection,
                    'chapter' => $chapter,
                ]),
            ],
            'reader_languages' => $readerData['reader_languages'],
            'default_language' => $readerData['default_language'],
            'chapter_sections' => $readerData['chapter_sections'],
        ]);
    }
}
