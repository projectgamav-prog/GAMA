<?php

use App\Models\Page;
use App\Models\User;

test('exposed region bootstrap creates a backing page and returns to the source page', function () {
    $this->withoutVite();

    $editor = User::factory()->create([
        'can_access_admin_context' => true,
    ]);

    $this->actingAs($editor)
        ->post(route('cms.exposed-regions.containers.store', [
            'regionKey' => 'home-primary',
        ], false), [
            'label' => 'Home Banner',
            'container_type' => 'card',
            'insertion_mode' => 'end',
            'module_key' => 'rich_text',
            'data_json' => [
                'html' => '<p>Home region content</p>',
            ],
            'config_json' => [],
            'return_to' => route('home', absolute: false),
        ])
        ->assertRedirect(route('home', absolute: false));

    $page = Page::query()
        ->where('exposure_key', 'home-primary')
        ->first();

    expect($page)->not->toBeNull();
    expect($page->status)->toBe('published');
    expect($page->pageContainers()->count())->toBe(1);
    expect($page->pageBlocks()->count())->toBe(1);
});
