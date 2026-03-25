<?php

use App\Models\Book;
use App\Support\Scripture\ScriptureJsonImporter;
use Database\Seeders\BhagavadGitaDevelopmentSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();

    $this->seed(BhagavadGitaDevelopmentSeeder::class);

    $this->book = Book::query()
        ->where('slug', 'bhagavad-gita')
        ->firstOrFail();

    $this->bookSection = $this->book->bookSections()
        ->where('slug', 'main')
        ->firstOrFail();

    $this->chapter = $this->bookSection->chapters()
        ->where('slug', 'chapter-2')
        ->firstOrFail();

    $this->chapterSection = $this->chapter->chapterSections()
        ->inCanonicalOrder()
        ->firstOrFail();

    $sectionVerses = $this->chapterSection->verses()
        ->inCanonicalOrder()
        ->get()
        ->values();

    $this->firstVerse = $sectionVerses[0];
    $this->secondVerse = $sectionVerses[1];
    $this->penultimateVerse = $sectionVerses[$sectionVerses->count() - 2];
    $this->lastVerse = $sectionVerses[$sectionVerses->count() - 1];
});

test('books page lists available public scripture books', function () {
    app(ScriptureJsonImporter::class)->import('ramcharitmanas');
    $ramcharitmanas = Book::query()
        ->where('slug', 'ramcharitmanas')
        ->firstOrFail();

    $this->book->update(['number' => '2']);
    $ramcharitmanas->update(['number' => '1']);

    $response = $this->get(route('scripture.books.index'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/books/index')
            ->has('books', 2)
            ->where('books.0.slug', 'ramcharitmanas')
            ->where('books.0.number', '1')
            ->where('books.0.href', route('scripture.books.show', $ramcharitmanas))
            ->where('books.1.slug', 'bhagavad-gita')
            ->where('books.1.number', '2')
            ->where(
                'books.1.href',
                route('scripture.books.show', $this->book),
            ),
        );
});

test('book page is displayed for scripture browsing', function () {
    $response = $this->get(route('scripture.books.show', $this->book));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/books/show')
            ->where('book.number', '1')
            ->where('book.title', 'Bhagavad Gita')
            ->has('content_blocks', 2)
            ->has('book_sections', 1)
            ->where(
                'book_sections.0.href',
                route('scripture.books.show', $this->book).'#section-main',
            )
            ->has('book_sections.0.chapters', $this->bookSection->chapters()->count()),
        );
});

test('chapter page is displayed and supports zero published content blocks', function () {
    $response = $this->get(route('scripture.chapters.show', [
        'book' => $this->book,
        'bookSection' => $this->bookSection,
        'chapter' => $this->chapter,
    ]));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/show')
            ->where('chapter.title', $this->chapter->title)
            ->where(
                'book_section.href',
                route('scripture.books.show', $this->book).'#section-main',
            )
            ->where('content_blocks', [])
            ->has('chapter_sections', $this->chapter->chapterSections()->count())
            ->where('chapter_sections.0.verses_count', $this->chapterSection->verses()->count()),
        );
});

test('chapter verse reader page is displayed in canonical order', function () {
    $response = $this->get(route('scripture.chapters.verses.index', [
        'book' => $this->book,
        'bookSection' => $this->bookSection,
        'chapter' => $this->chapter,
    ]));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/verses/index')
            ->where('chapter.number', $this->chapter->number)
            ->where(
                'book_section.href',
                route('scripture.books.show', $this->book).'#section-main',
            )
            ->where('default_language', 'en')
            ->where('reader_languages.0', 'en')
            ->where('reader_languages.1', 'hi')
            ->has('chapter_sections', $this->chapter->chapterSections()->count())
            ->where('chapter_sections.0.slug', $this->chapterSection->slug)
            ->where('chapter_sections.0.cards.0.type', 'single')
            ->where('chapter_sections.0.cards.0.verses.0.number', $this->firstVerse->number)
            ->where(
                'chapter_sections.0.cards.0.verses.0.explanation_href',
                route('scripture.chapters.verses.show', [
                    'book' => $this->book,
                    'bookSection' => $this->bookSection,
                    'chapter' => $this->chapter,
                    'chapterSection' => $this->chapterSection,
                    'verse' => $this->firstVerse,
                ]),
            )
            ->where('chapter_sections.0.cards.1.verses.0.number', $this->secondVerse->number),
        );
});

test('verse detail page is displayed with translations commentaries and published verse blocks', function () {
    $this->firstVerse->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Published verse note',
        'body' => 'A published note attached directly to the verse.',
        'data_json' => null,
        'sort_order' => 1,
        'status' => 'published',
    ]);

    $this->firstVerse->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Draft verse note',
        'body' => 'This should stay hidden on the public page.',
        'data_json' => null,
        'sort_order' => 2,
        'status' => 'draft',
    ]);

    $response = $this->get(route('scripture.chapters.verses.show', [
        'book' => $this->book,
        'bookSection' => $this->bookSection,
        'chapter' => $this->chapter,
        'chapterSection' => $this->chapterSection,
        'verse' => $this->firstVerse,
    ]));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/verses/show')
            ->where('verse.number', $this->firstVerse->number)
            ->where(
                'book_section.href',
                route('scripture.books.show', $this->book).'#section-main',
            )
            ->where('chapter_section.slug', $this->chapterSection->slug)
            ->where('previous_verse', null)
            ->where('next_verse.number', $this->secondVerse->number)
            ->has('translations', 2)
            ->where('translations.0.language_code', 'en')
            ->where('translations.1.language_code', 'hi')
            ->has('commentaries', 1)
            ->where('commentaries.0.title', 'Action without attachment')
            ->has('content_blocks', 1)
            ->where('content_blocks.0.title', 'Published verse note'),
        );
});

test('verse detail page includes adjacent verse navigation inside the current chapter section', function () {
    $this->get(route('scripture.chapters.verses.show', [
        'book' => $this->book,
        'bookSection' => $this->bookSection,
        'chapter' => $this->chapter,
        'chapterSection' => $this->chapterSection,
        'verse' => $this->firstVerse,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/verses/show')
            ->where('previous_verse', null)
            ->where('next_verse.number', $this->secondVerse->number)
            ->where(
                'next_verse.href',
                route('scripture.chapters.verses.show', [
                    'book' => $this->book,
                    'bookSection' => $this->bookSection,
                    'chapter' => $this->chapter,
                    'chapterSection' => $this->chapterSection,
                    'verse' => $this->secondVerse,
                ]),
            ),
        );

    $this->get(route('scripture.chapters.verses.show', [
        'book' => $this->book,
        'bookSection' => $this->bookSection,
        'chapter' => $this->chapter,
        'chapterSection' => $this->chapterSection,
        'verse' => $this->lastVerse,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/verses/show')
            ->where('next_verse', null)
            ->where('previous_verse.number', $this->penultimateVerse->number)
            ->where(
                'previous_verse.href',
                route('scripture.chapters.verses.show', [
                    'book' => $this->book,
                    'bookSection' => $this->bookSection,
                    'chapter' => $this->chapter,
                    'chapterSection' => $this->chapterSection,
                    'verse' => $this->penultimateVerse,
                ]),
            ),
        );
});

test('verse detail page returns 404 for a mismatched canonical chain', function () {
    $wrongVerse = $this->bookSection->chapters()
        ->where('slug', 'chapter-1')
        ->firstOrFail()
        ->chapterSections()
        ->inCanonicalOrder()
        ->firstOrFail()
        ->verses()
        ->where('slug', 'verse-11')
        ->firstOrFail();

    $this->get(route('scripture.chapters.verses.show', [
        'book' => $this->book,
        'bookSection' => $this->bookSection,
        'chapter' => $this->chapter,
        'chapterSection' => $this->chapterSection,
        'verse' => $wrongVerse,
    ]))->assertNotFound();
});

test('multi-section books browse through the same public canonical flow', function () {
    app(ScriptureJsonImporter::class)->import('ramcharitmanas');

    $book = Book::query()
        ->where('slug', 'ramcharitmanas')
        ->firstOrFail();

    $bookSection = $book->bookSections()
        ->where('slug', 'ayodhya-kanda')
        ->firstOrFail();

    $chapter = $bookSection->chapters()
        ->where('slug', 'chapter-1')
        ->firstOrFail();

    $chapterSection = $chapter->chapterSections()
        ->where('slug', 'main')
        ->firstOrFail();

    $verse = $chapterSection->verses()
        ->where('slug', 'verse-1')
        ->firstOrFail();

    $this->get(route('scripture.books.show', $book))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/books/show')
            ->where('book.number', '2')
            ->where('book.title', 'Ramcharitmanas')
            ->has('book_sections', 2)
            ->where('book_sections.0.slug', 'bala-kanda')
            ->where(
                'book_sections.0.href',
                route('scripture.books.show', $book).'#section-bala-kanda',
            )
            ->where('book_sections.1.slug', 'ayodhya-kanda')
            ->where(
                'book_sections.1.href',
                route('scripture.books.show', $book).'#section-ayodhya-kanda',
            ),
        );

    $this->get(route('scripture.chapters.show', [
        'book' => $book,
        'bookSection' => $bookSection,
        'chapter' => $chapter,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/show')
            ->where('book_section.slug', 'ayodhya-kanda')
            ->where(
                'book_section.href',
                route('scripture.books.show', $book).'#section-ayodhya-kanda',
            )
            ->where('chapter.title', 'Rama Leaves for the Forest')
            ->has('chapter_sections', 1),
        );

    $this->get(route('scripture.chapters.verses.index', [
        'book' => $book,
        'bookSection' => $bookSection,
        'chapter' => $chapter,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/verses/index')
            ->where('book_section.slug', 'ayodhya-kanda')
            ->where(
                'book_section.href',
                route('scripture.books.show', $book).'#section-ayodhya-kanda',
            )
            ->has('chapter_sections', 1)
            ->where(
                'chapter_sections.0.cards.0.verses.0.text',
                'The command to leave the kingdom falls with sudden force.',
            ),
        );

    $this->get(route('scripture.chapters.verses.show', [
        'book' => $book,
        'bookSection' => $bookSection,
        'chapter' => $chapter,
        'chapterSection' => $chapterSection,
        'verse' => $verse,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/verses/show')
            ->where('book_section.slug', 'ayodhya-kanda')
            ->where(
                'book_section.href',
                route('scripture.books.show', $book).'#section-ayodhya-kanda',
            )
            ->where(
                'chapter_section.href',
                route('scripture.chapters.verses.index', [
                    'book' => $book,
                    'bookSection' => $bookSection,
                    'chapter' => $chapter,
                ]).'#main',
            )
            ->where(
                'verse.text',
                'The command to leave the kingdom falls with sudden force.',
            ),
        );
});
