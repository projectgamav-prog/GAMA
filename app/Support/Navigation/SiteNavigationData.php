<?php

namespace App\Support\Navigation;

use App\Models\NavigationItem;
use Illuminate\Support\Collection;

class SiteNavigationData
{
    /**
     * @return array<int, array<string, mixed>>
     */
    public static function headerItems(): array
    {
        return self::menuItems(NavigationItem::MENU_PUBLIC_HEADER);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public static function footerItems(): array
    {
        return self::menuItems(NavigationItem::MENU_PUBLIC_FOOTER);
    }

    /**
     * @return array{
     *     menu_key: string,
     *     store_href: string,
     *     items: array<int, array<string, mixed>>,
     *     target_options: array{
     *         route_options: array<string, string>,
     *         scripture_target_kinds: array<string, string>,
     *         cms_pages: array<int, array{slug: string, title: string}>
     *     }
     * }
     */
    public static function headerAuthoringData(): array
    {
        return self::authoringData(NavigationItem::MENU_PUBLIC_HEADER);
    }

    /**
     * @return array{
     *     menu_key: string,
     *     store_href: string,
     *     items: array<int, array<string, mixed>>,
     *     target_options: array{
     *         route_options: array<string, string>,
     *         scripture_target_kinds: array<string, string>,
     *         cms_pages: array<int, array{slug: string, title: string}>
     *     }
     * }
     */
    public static function footerAuthoringData(): array
    {
        return self::authoringData(NavigationItem::MENU_PUBLIC_FOOTER);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public static function menuItems(string $menuKey): array
    {
        $items = NavigationItem::query()
            ->forMenu($menuKey)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return self::buildTree($items);
    }

    /**
     * @return array{
     *     menu_key: string,
     *     store_href: string,
     *     items: array<int, array<string, mixed>>,
     *     target_options: array{
     *         route_options: array<string, string>,
     *         scripture_target_kinds: array<string, string>,
     *         cms_pages: array<int, array{slug: string, title: string}>
     *     }
     * }
     */
    public static function authoringData(string $menuKey): array
    {
        return [
            'menu_key' => $menuKey,
            'store_href' => route('admin.navigation.items.store', absolute: false),
            'items' => self::editableMenuItems($menuKey),
            'target_options' => LinkTargetRegistry::sharedOptions(),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public static function editableMenuItems(string $menuKey): array
    {
        $items = NavigationItem::query()
            ->forMenu($menuKey)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return self::buildEditableTree($items);
    }

    /**
     * @param  Collection<int, NavigationItem>  $items
     * @return array<int, array<string, mixed>>
     */
    private static function buildTree(Collection $items, ?int $parentId = null): array
    {
        return $items
            ->filter(fn (NavigationItem $item): bool => $item->parent_id === $parentId)
            ->map(function (NavigationItem $item) use ($items): array {
                $target = LinkTarget::normalize($item->target_json);

                return [
                    'id' => $item->id,
                    'menu_key' => $item->menu_key,
                    'label' => $item->label,
                    'target' => $target,
                    'href' => LinkTarget::resolveHref($target),
                    'children' => self::buildTree($items, $item->id),
                    'sort_order' => $item->sort_order,
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @param  Collection<int, NavigationItem>  $items
     * @return array<int, array<string, mixed>>
     */
    private static function buildEditableTree(Collection $items, ?int $parentId = null): array
    {
        return $items
            ->filter(fn (NavigationItem $item): bool => $item->parent_id === $parentId)
            ->map(function (NavigationItem $item) use ($items): array {
                $target = LinkTarget::normalize($item->target_json);

                return [
                    'id' => $item->id,
                    'menu_key' => $item->menu_key,
                    'label' => $item->label,
                    'target' => $target,
                    'href' => LinkTarget::resolveHref($target),
                    'children' => self::buildEditableTree($items, $item->id),
                    'sort_order' => $item->sort_order,
                    'update_href' => route('admin.navigation.items.update', ['navigationItem' => $item->id], false),
                    'destroy_href' => route('admin.navigation.items.destroy', ['navigationItem' => $item->id], false),
                    'move_up_href' => route('admin.navigation.items.move-up', ['navigationItem' => $item->id], false),
                    'move_down_href' => route('admin.navigation.items.move-down', ['navigationItem' => $item->id], false),
                ];
            })
            ->values()
            ->all();
    }
}
