<?php

use App\Support\Cms\CmsModuleRegistry;

test('cms module registry includes the first stable module set', function () {
    expect(CmsModuleRegistry::keys())->toBe([
        'rich_text',
        'button_group',
        'media',
        'card_list',
    ]);
});

test('button group validation accepts shared structured link targets', function () {
    $errors = CmsModuleRegistry::validationErrors('button_group', [
        'buttons' => [[
            'label' => 'Read more',
            'target' => [
                'type' => 'route',
                'value' => [
                    'key' => 'scripture.books.index',
                ],
                'behavior' => [
                    'new_tab' => false,
                ],
            ],
            'variant' => 'default',
        ]],
    ], [
        'layout' => 'auto',
        'alignment' => 'stretch',
    ]);

    expect($errors)->toBe([]);
});

test('rich text validation accepts structured writing data', function () {
    $errors = CmsModuleRegistry::validationErrors('rich_text', [
        'title' => 'Writing in a calmer way',
        'body' => "## Why this matters\n\n- One\n- Two",
        'blocks' => [
            [
                'type' => 'heading',
                'level' => 2,
                'text' => 'Why this matters',
            ],
            [
                'type' => 'list',
                'items' => ['One', 'Two'],
            ],
        ],
    ], [
        'align' => 'left',
        'max_width' => 'content',
    ]);

    expect($errors)->toBe([]);
});

test('card list validation requires a title and supports structured targets', function () {
    $errors = CmsModuleRegistry::validationErrors('card_list', [
        'items' => [[
            'title' => '',
            'target' => [
                'type' => 'route',
                'value' => [
                    'key' => 'home',
                ],
                'behavior' => [
                    'new_tab' => false,
                ],
            ],
        ]],
    ], [
        'layout' => 'cards',
        'columns' => 'two',
    ]);

    expect($errors)->toHaveKey('data_json.items.0.title');
});
