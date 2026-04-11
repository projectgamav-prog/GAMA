<?php

use App\Models\Book;
use App\Models\Page;
use Database\Seeders\BhagavadGitaDevelopmentSeeder;
use Database\Seeders\CmsDevelopmentSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();
    $this->seed(BhagavadGitaDevelopmentSeeder::class);
    $this->seed(CmsDevelopmentSeeder::class);
});

test('development seed composes the home supplementary region with multiple module types', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('home')
            ->where('cms_regions.0.key', 'home-primary')
            ->has('cms_regions.0.containers', 4)
            ->where('cms_regions.0.containers.0.blocks.0.module_key', 'rich_text')
            ->where('cms_regions.0.containers.0.blocks.1.module_key', 'button_group')
            ->where('cms_regions.0.containers.1.blocks.0.module_key', 'card_list')
            ->where('cms_regions.0.containers.2.blocks.1.module_key', 'media')
            ->where('cms_regions.0.containers.3.blocks.1.module_key', 'button_group'),
        );
});

test('platform guide page is composed as a real cms page with the current module set', function () {
    $pageRecord = Page::query()
        ->where('slug', 'platform-guide')
        ->firstOrFail();

    $this->get(route('pages.show', $pageRecord))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('cms/pages/public-show')
            ->where('page.slug', 'platform-guide')
            ->has('containers', 6)
            ->where('containers.0.blocks.0.module_key', 'rich_text')
            ->where('containers.0.blocks.1.module_key', 'button_group')
            ->where('containers.1.blocks.0.module_key', 'card_list')
            ->where('containers.2.blocks.1.module_key', 'media')
            ->where('containers.4.blocks.0.module_key', 'card_list')
            ->where('containers.5.blocks.1.module_key', 'button_group'),
        );
});

test('verse detail exposes seeded supplementary cms composition in the declared region', function () {
    $book = Book::query()
        ->where('slug', 'bhagavad-gita')
        ->firstOrFail();

    $bookSection = $book->bookSections()
        ->where('slug', 'main')
        ->firstOrFail();

    $chapter = $bookSection->chapters()
        ->where('slug', 'chapter-2')
        ->firstOrFail();

    $chapterSection = $chapter->chapterSections()
        ->where('slug', 'section-1')
        ->firstOrFail();

    $verse = $chapterSection->verses()
        ->where('slug', 'verse-1')
        ->firstOrFail();

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
            ->where('cms_regions.0.key', "scripture-verse-{$verse->id}-supplementary")
            ->has('cms_regions.0.containers', 2)
            ->where('cms_regions.0.containers.0.blocks.0.module_key', 'rich_text')
            ->where('cms_regions.0.containers.0.blocks.1.module_key', 'button_group')
            ->where('cms_regions.0.containers.1.blocks.0.module_key', 'card_list'),
        );
});
