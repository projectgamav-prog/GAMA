<?php

namespace App\Http\Controllers\Navigation;

use App\Http\Controllers\Controller;
use App\Http\Requests\Navigation\SiteNavigationItemStoreRequest;
use App\Http\Requests\Navigation\SiteNavigationItemUpdateRequest;
use App\Models\NavigationItem;
use Illuminate\Http\RedirectResponse;

class SiteNavigationItemController extends Controller
{
    public function store(SiteNavigationItemStoreRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $parentId = $validated['parent_id'] ?? null;

        NavigationItem::query()->create([
            'menu_key' => $validated['menu_key'],
            'parent_id' => $parentId,
            'label' => $validated['label'],
            'target_json' => $validated['target'] ?? null,
            'sort_order' => $validated['sort_order'] ?? $this->nextSortOrder($validated['menu_key'], $parentId),
        ]);

        return back(303);
    }

    public function update(
        SiteNavigationItemUpdateRequest $request,
        NavigationItem $navigationItem,
    ): RedirectResponse {
        $validated = $request->validated();

        $navigationItem->update([
            'label' => $validated['label'],
            'target_json' => $validated['target'] ?? null,
        ]);

        return back(303);
    }

    public function destroy(NavigationItem $navigationItem): RedirectResponse
    {
        $menuKey = $navigationItem->menu_key;
        $parentId = $navigationItem->parent_id;

        $navigationItem->delete();
        $this->reindexSiblings($menuKey, $parentId);

        return back(303);
    }

    public function moveUp(NavigationItem $navigationItem): RedirectResponse
    {
        $siblings = NavigationItem::query()
            ->forMenu($navigationItem->menu_key)
            ->where('parent_id', $navigationItem->parent_id)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->values();

        $index = $siblings->search(fn (NavigationItem $item): bool => $item->is($navigationItem));

        if (is_int($index) && $index > 0) {
            $previous = $siblings[$index - 1];
            $currentOrder = $navigationItem->sort_order;

            $navigationItem->update(['sort_order' => $previous->sort_order]);
            $previous->update(['sort_order' => $currentOrder]);
        }

        return back(303);
    }

    public function moveDown(NavigationItem $navigationItem): RedirectResponse
    {
        $siblings = NavigationItem::query()
            ->forMenu($navigationItem->menu_key)
            ->where('parent_id', $navigationItem->parent_id)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->values();

        $index = $siblings->search(fn (NavigationItem $item): bool => $item->is($navigationItem));

        if (is_int($index) && $index < $siblings->count() - 1) {
            $next = $siblings[$index + 1];
            $currentOrder = $navigationItem->sort_order;

            $navigationItem->update(['sort_order' => $next->sort_order]);
            $next->update(['sort_order' => $currentOrder]);
        }

        return back(303);
    }

    private function nextSortOrder(string $menuKey, ?int $parentId): int
    {
        return (int) NavigationItem::query()
            ->forMenu($menuKey)
            ->where('parent_id', $parentId)
            ->max('sort_order') + 1;
    }

    private function reindexSiblings(string $menuKey, ?int $parentId): void
    {
        NavigationItem::query()
            ->forMenu($menuKey)
            ->where('parent_id', $parentId)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->values()
            ->each(function (NavigationItem $item, int $index): void {
                $desiredOrder = $index + 1;

                if ($item->sort_order !== $desiredOrder) {
                    $item->update(['sort_order' => $desiredOrder]);
                }
            });
    }
}
