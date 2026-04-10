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
