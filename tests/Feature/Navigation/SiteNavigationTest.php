<?php

use App\Models\NavigationItem;
use App\Models\Page;
use App\Models\User;
use Database\Seeders\PublicFooterNavigationSeeder;
use Database\Seeders\PublicHeaderNavigationSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    $this->withoutVite();
    $this->seed(PublicHeaderNavigationSeeder::class);
    $this->seed(PublicFooterNavigationSeeder::class);
});

test('public pages receive the shared structured header navigation tree', function (): void {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('home')
            ->has('siteNavigation.header', 3)
            ->has('siteNavigation.footer', 3)
            ->where('siteNavigation.headerAdmin', null)
            ->where('siteNavigation.header.0.label', 'Home')
            ->where('siteNavigation.header.1.label', 'Scripture')
            ->where('siteNavigation.header.1.href', route('scripture.books.index', absolute: false))
            ->where('siteNavigation.header.1.children.0.label', 'Books')
            ->where('siteNavigation.header.2.label', 'Study')
            ->where('siteNavigation.header.2.children.0.label', 'Reference')
            ->where('siteNavigation.header.2.children.0.children.0.label', 'Dictionary')
            ->where('siteNavigation.header.2.children.0.children.1.label', 'Topics')
            ->where('siteNavigation.header.2.children.0.children.2.label', 'Characters')
            ->where('siteNavigation.footer.0.label', 'Explore')
            ->where('siteNavigation.footer.0.children.0.label', 'Home')
            ->where('siteNavigation.footer.1.label', 'Reference')
            ->where('siteNavigation.footer.1.children.2.label', 'Characters')
            ->where('siteNavigation.footer.2.label', 'Bhagavad Gita'),
        );
});

test('authorized editors receive live header authoring data on public pages', function (): void {
    $editor = User::factory()->create([
        'can_access_admin_context' => true,
    ]);

    $this->actingAs($editor)
        ->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('home')
            ->where('siteNavigation.headerAdmin.menu_key', NavigationItem::MENU_PUBLIC_HEADER)
            ->where('siteNavigation.headerAdmin.store_href', route('admin.navigation.items.store', absolute: false))
            ->has('siteNavigation.headerAdmin.items', 3)
            ->where('siteNavigation.headerAdmin.target_options.route_options.home', 'Home')
            ->where('siteNavigation.headerAdmin.target_options.scripture_target_kinds.book', 'Book'),
        );
});

test('authorized editors can open the navigation workspace', function (): void {
    Page::query()->create([
        'title' => 'About',
        'slug' => 'about',
        'status' => 'published',
        'layout_key' => 'standard',
    ]);

    $editor = User::factory()->create([
        'can_access_admin_context' => true,
    ]);

    $this->actingAs($editor)
        ->get(route('admin.navigation.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/navigation/index')
            ->has('menus', 2)
            ->where('menus.0.menu_key', NavigationItem::MENU_PUBLIC_HEADER)
            ->where('menus.1.menu_key', NavigationItem::MENU_PUBLIC_FOOTER)
            ->where('menus.0.workspace.store_href', route('admin.navigation.items.store', absolute: false))
            ->where('target_options.route_options.home', 'Home')
            ->where('target_options.scripture_target_kinds.book', 'Book')
            ->where('target_options.cms_pages.0.slug', 'about'),
        );
});

test('authorized editors can create update move and delete navigation items', function (): void {
    $editor = User::factory()->create([
        'can_access_admin_context' => true,
    ]);

    $page = Page::query()->create([
        'title' => 'About',
        'slug' => 'about',
        'status' => 'published',
        'layout_key' => 'standard',
    ]);

    $parent = NavigationItem::query()->forMenu(NavigationItem::MENU_PUBLIC_HEADER)->firstOrFail();

    $this->actingAs($editor)
        ->post(route('admin.navigation.items.store'), [
            'menu_key' => NavigationItem::MENU_PUBLIC_HEADER,
            'parent_id' => $parent->id,
            'label' => 'About page',
            'target' => [
                'type' => 'cms_page',
                'value' => [
                    'slug' => $page->slug,
                ],
                'behavior' => [
                    'new_tab' => false,
                ],
            ],
        ])
        ->assertRedirect();

    $item = NavigationItem::query()
        ->where('label', 'About page')
        ->firstOrFail();

    expect($item->target_json['type'])->toBe('cms_page');

    $this->actingAs($editor)
        ->patch(route('admin.navigation.items.update', $item), [
            'menu_key' => NavigationItem::MENU_PUBLIC_HEADER,
            'label' => 'Verse reader',
            'target' => [
                'type' => 'scripture',
                'value' => [
                    'kind' => 'verse',
                    'book_slug' => 'bhagavad-gita',
                    'book_section_slug' => 'main',
                    'chapter_slug' => 'chapter-2',
                    'chapter_section_slug' => 'main',
                    'verse_slug' => 'verse-1',
                ],
                'behavior' => [
                    'new_tab' => false,
                ],
            ],
        ])
        ->assertRedirect();

    $item->refresh();

    expect($item->label)->toBe('Verse reader');
    expect($item->target_json['type'])->toBe('scripture');

    $sibling = NavigationItem::query()->create([
        'menu_key' => NavigationItem::MENU_PUBLIC_HEADER,
        'parent_id' => $parent->id,
        'label' => 'Sibling item',
        'target_json' => null,
        'sort_order' => $item->sort_order + 1,
    ]);

    $this->actingAs($editor)
        ->post(route('admin.navigation.items.move-down', $item))
        ->assertRedirect();

    $item->refresh();
    $sibling->refresh();

    expect($item->sort_order)->toBeGreaterThan($sibling->sort_order);

    $this->actingAs($editor)
        ->delete(route('admin.navigation.items.destroy', $item))
        ->assertRedirect();

    $this->assertDatabaseMissing('navigation_items', [
        'id' => $item->id,
    ]);
});

test('live header authoring actions can post back to the current public page', function (): void {
    $editor = User::factory()->create([
        'can_access_admin_context' => true,
    ]);

    $this->actingAs($editor)
        ->from(route('home'))
        ->post(route('admin.navigation.items.store'), [
            'menu_key' => NavigationItem::MENU_PUBLIC_HEADER,
            'label' => 'Live header draft',
            'target' => [
                'type' => 'url',
                'value' => [
                    'url' => 'https://example.com',
                ],
                'behavior' => [
                    'new_tab' => false,
                ],
            ],
        ])
        ->assertRedirect(route('home'));

    $item = NavigationItem::query()
        ->where('label', 'Live header draft')
        ->firstOrFail();

    $this->actingAs($editor)
        ->from(route('home'))
        ->patch(route('admin.navigation.items.update', $item), [
            'menu_key' => NavigationItem::MENU_PUBLIC_HEADER,
            'label' => 'Live header updated',
            'target' => [
                'type' => 'route',
                'value' => [
                    'key' => 'home',
                ],
                'behavior' => [
                    'new_tab' => false,
                ],
            ],
        ])
        ->assertRedirect(route('home'));

    $this->assertDatabaseHas('navigation_items', [
        'id' => $item->id,
        'label' => 'Live header updated',
    ]);
});

test('authorized editors can manage footer navigation items through the shared navigation workspace routes', function (): void {
    $editor = User::factory()->create([
        'can_access_admin_context' => true,
    ]);

    $this->actingAs($editor)
        ->post(route('admin.navigation.items.store'), [
            'menu_key' => NavigationItem::MENU_PUBLIC_FOOTER,
            'label' => 'Footer smoke item',
            'target' => [
                'type' => 'route',
                'value' => [
                    'key' => 'home',
                ],
                'behavior' => [
                    'new_tab' => false,
                ],
            ],
        ])
        ->assertRedirect();

    $item = NavigationItem::query()
        ->forMenu(NavigationItem::MENU_PUBLIC_FOOTER)
        ->where('label', 'Footer smoke item')
        ->firstOrFail();

    $this->actingAs($editor)
        ->patch(route('admin.navigation.items.update', $item), [
            'menu_key' => NavigationItem::MENU_PUBLIC_FOOTER,
            'label' => 'Footer smoke updated',
            'target' => [
                'type' => 'url',
                'value' => [
                    'url' => 'https://example.com/footer',
                ],
                'behavior' => [
                    'new_tab' => false,
                ],
            ],
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('navigation_items', [
        'id' => $item->id,
        'label' => 'Footer smoke updated',
        'menu_key' => NavigationItem::MENU_PUBLIC_FOOTER,
    ]);
});
