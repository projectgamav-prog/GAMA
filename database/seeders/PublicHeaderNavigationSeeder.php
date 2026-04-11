<?php

namespace Database\Seeders;

use App\Models\NavigationItem;
use Illuminate\Database\Seeder;

class PublicHeaderNavigationSeeder extends Seeder
{
    public function run(): void
    {
        if (NavigationItem::query()->forMenu(NavigationItem::MENU_PUBLIC_HEADER)->exists()) {
            return;
        }

        $home = NavigationItem::query()->create([
            'menu_key' => NavigationItem::MENU_PUBLIC_HEADER,
            'label' => 'Home',
            'target_json' => [
                'type' => 'route',
                'value' => ['key' => 'home'],
                'behavior' => ['new_tab' => false],
            ],
            'sort_order' => 1,
        ]);

        $scripture = NavigationItem::query()->create([
            'menu_key' => NavigationItem::MENU_PUBLIC_HEADER,
            'label' => 'Scripture',
            'target_json' => [
                'type' => 'route',
                'value' => ['key' => 'scripture.books.index'],
                'behavior' => ['new_tab' => false],
            ],
            'sort_order' => 2,
        ]);

        NavigationItem::query()->create([
            'menu_key' => NavigationItem::MENU_PUBLIC_HEADER,
            'parent_id' => $scripture->id,
            'label' => 'Books',
            'target_json' => [
                'type' => 'route',
                'value' => ['key' => 'scripture.books.index'],
                'behavior' => ['new_tab' => false],
            ],
            'sort_order' => 1,
        ]);

        $study = NavigationItem::query()->create([
            'menu_key' => NavigationItem::MENU_PUBLIC_HEADER,
            'label' => 'Study',
            'target_json' => null,
            'sort_order' => 3,
        ]);

        $reference = NavigationItem::query()->create([
            'menu_key' => NavigationItem::MENU_PUBLIC_HEADER,
            'parent_id' => $study->id,
            'label' => 'Reference',
            'target_json' => null,
            'sort_order' => 1,
        ]);

        foreach ([
            ['Dictionary', 'scripture.dictionary.index'],
            ['Topics', 'scripture.topics.index'],
            ['Characters', 'scripture.characters.index'],
        ] as $index => [$label, $routeKey]) {
            NavigationItem::query()->create([
                'menu_key' => NavigationItem::MENU_PUBLIC_HEADER,
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
    }
}
