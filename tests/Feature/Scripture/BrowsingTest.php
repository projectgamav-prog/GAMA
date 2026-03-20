<?php

use App\Models\Book;
use App\Models\Verse;
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

test('book page is displayed for scripture browsing', function () {
    $response = $this->get(route('scripture.books.show', $this->book));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/books/show')
            ->where('book.title', 'Bhagavad Gita')
            ->has('content_blocks', 2)
            ->has('book_sections', 1)
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
            ->where('chapter_section.slug', 'chapter-2-main')
            ->has('translations', 2)
            ->where('translations.0.language_code', 'en')
            ->where('translations.1.language_code', 'hi')
            ->has('commentaries', 1)
            ->where('commentaries.0.title', 'Action without attachment')
            ->has('content_blocks', 1)
            ->where('content_blocks.0.title', 'Published verse note'),
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
