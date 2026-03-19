<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\Verse;
use Inertia\Inertia;
use Inertia\Response;

class ChapterVerseController extends Controller
{
    /**
     * Display a read-only verse list for a chapter.
     */
    public function index(Book $book, BookSection $bookSection, Chapter $chapter): Response
    {
        $chapter->load([
            'chapterSections' => fn ($query) => $query
                ->orderBy('sort_order')
                ->with([
                    'verses' => fn ($verseQuery) => $verseQuery->orderBy('sort_order'),
                ]),
        ]);

        return Inertia::render('scripture/chapters/verses/index', [
            'book' => [
                'id' => $book->id,
                'slug' => $book->slug,
                'title' => $book->title,
                'sort_order' => $book->sort_order,
                'href' => route('scripture.books.show', $book),
            ],
            'book_section' => [
                'id' => $bookSection->id,
                'slug' => $bookSection->slug,
                'number' => $bookSection->number,
                'title' => $bookSection->title,
                'sort_order' => $bookSection->sort_order,
            ],
            'chapter' => [
                'id' => $chapter->id,
                'slug' => $chapter->slug,
                'number' => $chapter->number,
                'title' => $chapter->title,
                'sort_order' => $chapter->sort_order,
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
            'chapter_sections' => $chapter->chapterSections
                ->map(fn (ChapterSection $section) => [
                    'id' => $section->id,
                    'slug' => $section->slug,
                    'number' => $section->number,
                    'title' => $section->title,
                    'sort_order' => $section->sort_order,
                    'verses' => $section->verses
                        ->map(fn (Verse $verse) => [
                            'id' => $verse->id,
                            'slug' => $verse->slug,
                            'number' => $verse->number,
                            'text' => $verse->text,
                            'sort_order' => $verse->sort_order,
                        ])
                        ->values()
                        ->all(),
                ])
                ->values()
                ->all(),
        ]);
    }
}
