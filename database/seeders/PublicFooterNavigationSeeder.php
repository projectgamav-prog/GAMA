<?php

namespace Database\Seeders;

use App\Models\NavigationItem;
use Illuminate\Database\Seeder;

class PublicFooterNavigationSeeder extends Seeder
{
    public function run(): void
    {
        if (NavigationItem::query()->forMenu(NavigationItem::MENU_PUBLIC_FOOTER)->exists()) {
            return;
        }

        $explore = NavigationItem::query()->create([
            'menu_key' => NavigationItem::MENU_PUBLIC_FOOTER,
            'label' => 'Explore',
            'target_json' => null,
            'sort_order' => 1,
        ]);

        foreach ([
            ['Home', 'home'],
            ['Books', 'scripture.books.index'],
        ] as $index => [$label, $routeKey]) {
            NavigationItem::query()->create([
                'menu_key' => NavigationItem::MENU_PUBLIC_FOOTER,
                'parent_id' => $explore->id,
                'label' => $label,
                'target_json' => [
                    'type' => 'route',
                    'value' => ['key' => $routeKey],
                    'behavior' => ['new_tab' => false],
                ],
                'sort_order' => $index + 1,
            ]);
        }

        $reference = NavigationItem::query()->create([
            'menu_key' => NavigationItem::MENU_PUBLIC_FOOTER,
            'label' => 'Reference',
            'target_json' => null,
            'sort_order' => 2,
        ]);

        foreach ([
            ['Dictionary', 'scripture.dictionary.index'],
            ['Topics', 'scripture.topics.index'],
            ['Characters', 'scripture.characters.index'],
        ] as $index => [$label, $routeKey]) {
            NavigationItem::query()->create([
                'menu_key' => NavigationItem::MENU_PUBLIC_FOOTER,
                'parent_id' => $reference->id,
                'label' => $label,
                'target_json' => [
                    'type' => 'route',
                    'value' => ['key' => $routeKey],
                    'behavior' => ['new_tab' => false],
                ],
                'sort_order' => $index + 1,
            ]);
        }

        NavigationItem::query()->create([
            'menu_key' => NavigationItem::MENU_PUBLIC_FOOTER,
            'label' => 'Bhagavad Gita',
            'target_json' => [
                'type' => 'scripture',
                'value' => [
                    'kind' => 'book',
                    'book_slug' => 'bhagavad-gita',
                ],
                'behavior' => ['new_tab' => false],
            ],
            'sort_order' => 3,
        ]);
    }
}
