<?php

use App\Models\Book;
use Database\Seeders\BhagavadGitaDevelopmentSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();

    $this->seed(BhagavadGitaDevelopmentSeeder::class);

    $this->book = Book::query()
        ->where('slug', 'bhagavad-gita')
        ->firstOrFail();

    $this->bookSection = $this->book->bookSections()
        ->where('slug', 'main-text')
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

test('chapter verse list page is displayed in canonical order', function () {
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
            ->has('chapter_sections', 1)
            ->has('chapter_sections.0.verses', 2)
            ->where('chapter_sections.0.verses.0.number', '47')
            ->where('chapter_sections.0.verses.1.number', '48'),
        );
});
