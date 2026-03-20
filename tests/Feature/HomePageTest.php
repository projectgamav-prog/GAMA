<?php

use App\Models\Book;
use Database\Seeders\BhagavadGitaDevelopmentSeeder;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Features;

test('home page is rendered as an inertia page with the featured scripture link', function () {
    $this->withoutVite();
    $this->seed(BhagavadGitaDevelopmentSeeder::class);

    $book = Book::query()
        ->where('slug', 'bhagavad-gita')
        ->firstOrFail();

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('home')
            ->where('canRegister', Features::enabled(Features::registration()))
            ->where('featured_book.title', 'Bhagavad Gita')
            ->where('featured_book.href', route('scripture.books.show', $book)),
        );
});

test('home page gracefully handles an empty scripture library', function () {
    $this->withoutVite();

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('home')
            ->where('canRegister', Features::enabled(Features::registration()))
            ->where('featured_book', null),
        );
});
