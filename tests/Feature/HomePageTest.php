<?php

use App\Models\Book;
use App\Models\Page;
use App\Models\User;
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

test('home page exposes the shared cms region payload for authorized users', function () {
    $this->withoutVite();

    $editor = User::factory()->create([
        'can_access_admin_context' => true,
    ]);

    $this->actingAs($editor)
        ->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('home')
            ->where('cms_regions.0.key', 'home-primary')
            ->where('cms_regions.0.admin.return_to', route('home', absolute: false))
            ->where('cms_regions.0.admin.bootstrap_store_href', route('cms.exposed-regions.containers.store', [
                'regionKey' => 'home-primary',
            ], false))
            ->where('cms_regions.0.admin.page', null),
        );
});

test('home page renders published exposed region containers for guests', function () {
    $this->withoutVite();

    $page = Page::query()->create([
        'title' => 'Home Page Region',
        'slug' => 'region-home-primary-test',
        'exposure_key' => 'home-primary',
        'status' => 'published',
        'layout_key' => 'region',
    ]);

    $container = $page->pageContainers()->create([
        'label' => 'Home Region',
        'container_type' => 'card',
        'sort_order' => 1,
    ]);

    $container->pageBlocks()->create([
        'module_key' => 'rich_text',
        'data_json' => ['html' => '<p>Home region</p>'],
        'config_json' => [],
        'sort_order' => 1,
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $pageAssert) => $pageAssert
            ->component('home')
            ->where('cms_regions.0.key', 'home-primary')
            ->has('cms_regions.0.containers', 1)
            ->where('cms_regions.0.containers.0.id', $container->id)
            ->where('cms_regions.0.admin', null),
        );
});
