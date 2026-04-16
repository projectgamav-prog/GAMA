<?php

use Database\Seeders\BhagavadGitaDevelopmentSeeder;
use Database\Seeders\ScriptureCorpusDevelopmentSeeder;
use Inertia\Testing\AssertableInertia as Assert;

test('development scripture seed baseline restores the expected multi-book browse state', function () {
    $this->withoutVite();
    $this->seed([
        ScriptureCorpusDevelopmentSeeder::class,
        BhagavadGitaDevelopmentSeeder::class,
    ]);

    $response = $this->get(route('scripture.books.index'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/books/index')
            ->has('books', 6)
            ->where('books.0.slug', 'bhagavad-gita')
            ->where('books.1.slug', 'ramcharitmanas')
            ->where('books.2.slug', 'kabir-dohe')
            ->where('books.3.slug', 'small-poem-book')
            ->where('books.4.slug', 'wisdom-sutras')
            ->where('books.5.slug', 'sectioned-demo-book'),
        );
});

test('development scripture seed baseline includes a persisted Bhagavad Gita hero media assignment', function () {
    $this->withoutVite();
    $this->seed([
        ScriptureCorpusDevelopmentSeeder::class,
        BhagavadGitaDevelopmentSeeder::class,
    ]);

    $response = $this->get(route('scripture.books.show', ['book' => 'bhagavad-gita']));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/books/show')
            ->where('book.slug', 'bhagavad-gita')
            ->where('book.media_slots.hero_media.title', 'Bhagavad Gita hero media')
            ->where(
                'book.media_slots.hero_media.media.url',
                'https://example.test/assets/bhagavad-gita-hero.jpg',
            ),
        );
});
