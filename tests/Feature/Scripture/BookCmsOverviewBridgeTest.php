<?php

use App\Models\Book;
use App\Models\Page;
use App\Models\User;
use Database\Seeders\BhagavadGitaDevelopmentSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();

    $this->seed(BhagavadGitaDevelopmentSeeder::class);

    $this->book = Book::query()
        ->where('slug', 'bhagavad-gita')
        ->with('overviewPage')
        ->firstOrFail();
});

test('public scripture book payload exposes the linked CMS overview page only when it is published', function () {
    $publicOverviewHref = route('pages.show', ['page' => 'bhagavad-gita-overview']);

    $this->get(route('scripture.books.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/books/index')
            ->where('books.0.slug', 'bhagavad-gita')
            ->where('books.0.overview_page_href', $publicOverviewHref),
        );

    $this->book->overviewPage()->update(['status' => 'draft']);

    $this->get(route('scripture.books.show', $this->book))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/books/show')
            ->where('book.overview_page_href', null),
        );
});

test('authorized editors can associate a book with a CMS overview page through the book details flow', function () {
    $editor = User::factory()->create([
        'can_access_admin_context' => true,
    ]);
    $overviewPage = Page::query()->create([
        'title' => 'Fresh Gita Overview',
        'slug' => 'fresh-gita-overview',
        'status' => 'published',
        'layout_key' => 'standard',
    ]);

    $this->actingAs($editor)
        ->patch(route('scripture.books.admin.details.update', $this->book), [
            'description' => 'Updated bridge description.',
            'overview_page_id' => (string) $overviewPage->id,
        ])
        ->assertRedirect();

    expect($this->book->fresh()->description)->toBe('Updated bridge description.');
    expect($this->book->fresh()->overview_page_id)->toBe($overviewPage->id);
});

test('deleting an associated CMS page clears the book overview bridge without touching the book', function () {
    $overviewPage = $this->book->overviewPage;

    expect($overviewPage)->not->toBeNull();

    $overviewPage->delete();

    expect($this->book->fresh()->overview_page_id)->toBeNull();
    expect(Book::query()->whereKey($this->book->id)->exists())->toBeTrue();
});
