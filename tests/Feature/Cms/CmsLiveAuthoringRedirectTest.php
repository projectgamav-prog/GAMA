<?php

use App\Models\Page;
use App\Models\User;

beforeEach(function () {
    $this->withoutVite();

    $this->editor = User::factory()->create([
        'can_access_admin_context' => true,
    ]);

    $this->pageRecord = Page::query()->create([
        'title' => 'Redirect Test Page',
        'slug' => 'redirect-test-page',
        'status' => 'published',
        'layout_key' => 'standard',
    ]);

    $this->container = $this->pageRecord->pageContainers()->create([
        'label' => 'Hero',
        'container_type' => 'card',
        'sort_order' => 1,
    ]);

    $this->block = $this->container->pageBlocks()->create([
        'module_key' => 'rich_text',
        'data_json' => [
            'html' => '<p>Original</p>',
        ],
        'config_json' => [],
        'sort_order' => 1,
    ]);
});

test('live container create can redirect back to public page', function () {
    $this->actingAs($this->editor)
        ->post(route('cms.pages.containers.store', $this->pageRecord, false), [
            'label' => 'CTA',
            'container_type' => 'card',
            'insertion_mode' => 'end',
            'module_key' => 'button_group',
            'data_json' => [
                'buttons' => [
                    [
                        'label' => 'Read more',
                        'target' => [
                            'type' => 'url',
                            'value' => [
                                'url' => 'https://example.com',
                            ],
                            'behavior' => [
                                'new_tab' => false,
                            ],
                        ],
                        'variant' => 'default',
                    ],
                ],
            ],
            'config_json' => [],
            'return_to' => route('pages.show', $this->pageRecord, false),
        ])
        ->assertRedirect(route('pages.show', $this->pageRecord, false));
});

test('live block create can redirect back to public page', function () {
    $this->actingAs($this->editor)
        ->post(route('cms.pages.containers.blocks.store', [
            'page' => $this->pageRecord,
            'pageContainer' => $this->container,
        ], false), [
            'insertion_mode' => 'after',
            'relative_block_id' => $this->block->id,
            'module_key' => 'rich_text',
            'data_json' => [
                'html' => '<p>Second</p>',
            ],
            'config_json' => [],
            'return_to' => route('pages.show', $this->pageRecord, false),
        ])
        ->assertRedirect(route('pages.show', $this->pageRecord, false));
});

test('live block update can redirect back to public page', function () {
    $this->actingAs($this->editor)
        ->patch(route('cms.pages.containers.blocks.update', [
            'page' => $this->pageRecord,
            'pageContainer' => $this->container,
            'pageBlock' => $this->block,
        ], false), [
            'module_key' => 'rich_text',
            'data_json' => [
                'html' => '<p>Updated</p>',
            ],
            'config_json' => [],
            'return_to' => route('pages.show', $this->pageRecord, false),
        ])
        ->assertRedirect(route('pages.show', $this->pageRecord, false));
});

test('live block create accepts card list payloads and redirects back to public page', function () {
    $this->actingAs($this->editor)
        ->post(route('cms.pages.containers.blocks.store', [
            'page' => $this->pageRecord,
            'pageContainer' => $this->container,
        ], false), [
            'insertion_mode' => 'after',
            'relative_block_id' => $this->block->id,
            'module_key' => 'card_list',
            'data_json' => [
                'title' => 'Reading paths',
                'items' => [
                    [
                        'title' => 'Browse books',
                        'body' => 'Start from the main library.',
                        'cta_label' => 'Open library',
                        'target' => [
                            'type' => 'route',
                            'value' => [
                                'key' => 'scripture.books.index',
                            ],
                            'behavior' => [
                                'new_tab' => false,
                            ],
                        ],
                    ],
                ],
            ],
            'config_json' => [
                'layout' => 'cards',
                'columns' => 'two',
            ],
            'return_to' => route('pages.show', $this->pageRecord, false),
        ])
        ->assertRedirect(route('pages.show', $this->pageRecord, false));

    $createdBlock = $this->container->fresh()->pageBlocks()->where('module_key', 'card_list')->first();

    expect($createdBlock)->not->toBeNull();
    expect($createdBlock?->data_json['items'][0]['target']['type'] ?? null)->toBe('route');
});

test('live block delete can redirect back to public page', function () {
    $this->actingAs($this->editor)
        ->delete(route('cms.pages.containers.blocks.destroy', [
            'page' => $this->pageRecord,
            'pageContainer' => $this->container,
            'pageBlock' => $this->block,
        ], false), [
            'return_to' => route('pages.show', $this->pageRecord, false),
        ])
        ->assertRedirect(route('pages.show', $this->pageRecord, false));
});
