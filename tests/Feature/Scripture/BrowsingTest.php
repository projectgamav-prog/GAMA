<?php

use App\Models\Book;
use App\Models\Verse;
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
});

test('books page lists available public scripture books', function () {
    app(ScriptureJsonImporter::class)->import('ramayana');

    $response = $this->get(route('scripture.books.index'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/books/index')
            ->has('books', 2)
            ->where('books.0.slug', 'bhagavad-gita')
            ->where('books.0.href', route('scripture.books.show', $this->book))
            ->where('books.1.slug', 'ramayana')
            ->where(
                'books.1.href',
                route('scripture.books.show', Book::query()->where('slug', 'ramayana')->firstOrFail()),
            ),
        );
});

test('book page is displayed for scripture browsing', function () {
    $response = $this->get(route('scripture.books.show', $this->book));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/books/show')
            ->where('book.title', 'Bhagavad Gita')
            ->has('content_blocks', 2)
            ->has('book_sections', 1)
            ->where(
                'book_sections.0.href',
                route('scripture.books.show', $this->book).'#section-main',
            )
            ->has('book_sections.0.chapters', 2),
        );
});

test('chapter page is displayed and supports zero published content blocks', function () {
    $chapter = $this->bookSection->chapters()
        ->where('slug', 'chapter-2')
        ->firstOrFail();

    $response = $this->get(route('scripture.chapters.show', [
        'book' => $this->book,
        'bookSection' => $this->bookSection,
        'chapter' => $chapter,
    ]));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/show')
            ->where('chapter.title', 'Sankhya Yoga')
            ->where(
                'book_section.href',
                route('scripture.books.show', $this->book).'#section-main',
            )
            ->where('content_blocks', [])
            ->has('chapter_sections', 1)
            ->where('chapter_sections.0.verses_count', 2),
        );
});

test('chapter verse reader page is displayed in canonical order', function () {
    $chapter = $this->bookSection->chapters()
        ->where('slug', 'chapter-2')
        ->firstOrFail();

    $response = $this->get(route('scripture.chapters.verses.index', [
        'book' => $this->book,
        'bookSection' => $this->bookSection,
        'chapter' => $chapter,
    ]));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/verses/index')
            ->where('chapter.number', '2')
            ->where(
                'book_section.href',
                route('scripture.books.show', $this->book).'#section-main',
            )
            ->where('default_language', 'en')
            ->where('reader_languages.0', 'en')
            ->where('reader_languages.1', 'hi')
            ->has('chapter_sections', 1)
            ->has('chapter_sections.0.cards', 2)
            ->where('chapter_sections.0.cards.0.type', 'single')
            ->where('chapter_sections.0.cards.0.verses.0.number', '47')
            ->where(
                'chapter_sections.0.cards.0.verses.0.explanation_href',
                route('scripture.chapters.verses.show', [
                    'book' => $this->book,
                    'bookSection' => $this->bookSection,
                    'chapter' => $chapter,
                    'chapterSection' => $chapter->chapterSections()->where('slug', 'chapter-2-main')->firstOrFail(),
                    'verse' => Verse::query()->where('slug', 'verse-47')->firstOrFail(),
                ]),
            )
            ->where('chapter_sections.0.cards.1.verses.0.number', '48'),
        );
});

test('verse detail page is displayed with translations commentaries and published verse blocks', function () {
    $chapter = $this->bookSection->chapters()
        ->where('slug', 'chapter-2')
        ->firstOrFail();

    $chapterSection = $chapter->chapterSections()
        ->where('slug', 'chapter-2-main')
        ->firstOrFail();

    $verse = $chapterSection->verses()
        ->where('slug', 'verse-47')
        ->firstOrFail();

    $verse->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Published verse note',
        'body' => 'A published note attached directly to the verse.',
        'data_json' => null,
        'sort_order' => 1,
        'status' => 'published',
    ]);

    $verse->contentBlocks()->create([
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
        'chapter' => $chapter,
        'chapterSection' => $chapterSection,
        'verse' => $verse,
    ]));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/verses/show')
            ->where('verse.number', '47')
            ->where(
                'book_section.href',
                route('scripture.books.show', $this->book).'#section-main',
            )
            ->where('chapter_section.slug', 'chapter-2-main')
            ->where('previous_verse', null)
            ->where('next_verse.number', '48')
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
    $chapter = $this->bookSection->chapters()
        ->where('slug', 'chapter-2')
        ->firstOrFail();

    $chapterSection = $chapter->chapterSections()
        ->where('slug', 'chapter-2-main')
        ->firstOrFail();

    $firstVerse = $chapterSection->verses()
        ->where('slug', 'verse-47')
        ->firstOrFail();

    $lastVerse = $chapterSection->verses()
        ->where('slug', 'verse-48')
        ->firstOrFail();

    $this->get(route('scripture.chapters.verses.show', [
        'book' => $this->book,
        'bookSection' => $this->bookSection,
        'chapter' => $chapter,
        'chapterSection' => $chapterSection,
        'verse' => $firstVerse,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/verses/show')
            ->where('previous_verse', null)
            ->where('next_verse.number', '48')
            ->where(
                'next_verse.href',
                route('scripture.chapters.verses.show', [
                    'book' => $this->book,
                    'bookSection' => $this->bookSection,
                    'chapter' => $chapter,
                    'chapterSection' => $chapterSection,
                    'verse' => $lastVerse,
                ]),
            ),
        );

    $this->get(route('scripture.chapters.verses.show', [
        'book' => $this->book,
        'bookSection' => $this->bookSection,
        'chapter' => $chapter,
        'chapterSection' => $chapterSection,
        'verse' => $lastVerse,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/verses/show')
            ->where('next_verse', null)
            ->where('previous_verse.number', '47')
            ->where(
                'previous_verse.href',
                route('scripture.chapters.verses.show', [
                    'book' => $this->book,
                    'bookSection' => $this->bookSection,
                    'chapter' => $chapter,
                    'chapterSection' => $chapterSection,
                    'verse' => $firstVerse,
                ]),
            ),
        );
});

test('verse detail page returns 404 for a mismatched canonical chain', function () {
    $chapter = $this->bookSection->chapters()
        ->where('slug', 'chapter-2')
        ->firstOrFail();

    $chapterSection = $chapter->chapterSections()
        ->where('slug', 'chapter-2-main')
        ->firstOrFail();

    $wrongVerse = $this->bookSection->chapters()
        ->where('slug', 'chapter-1')
        ->firstOrFail()
        ->chapterSections()
        ->where('slug', 'chapter-1-main')
        ->firstOrFail()
        ->verses()
        ->where('slug', 'verse-1')
        ->firstOrFail();

    $this->get(route('scripture.chapters.verses.show', [
        'book' => $this->book,
        'bookSection' => $this->bookSection,
        'chapter' => $chapter,
        'chapterSection' => $chapterSection,
        'verse' => $wrongVerse,
    ]))->assertNotFound();
});

test('multi-section books browse through the same public canonical flow', function () {
    app(ScriptureJsonImporter::class)->import('ramayana');

    $book = Book::query()
        ->where('slug', 'ramayana')
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
            ->where('book.title', 'Ramayana')
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
