<?php

namespace App\Http\Controllers\Navigation;

use App\Http\Controllers\Controller;
use App\Models\NavigationItem;
use App\Support\Navigation\SiteNavigationData;
use Inertia\Inertia;
use Inertia\Response;

class SiteNavigationWorkspaceController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/navigation/index', [
            'menus' => [
                $this->menuWorkspace(
                    SiteNavigationData::headerAuthoringData(),
                    'Header navigation',
                    'Manage the structured global header tree. Items can be direct links, parent-only groups, or parents that also expose an overview target.',
                ),
                $this->menuWorkspace(
                    SiteNavigationData::footerAuthoringData(),
                    'Footer navigation',
                    'Manage the structured global footer columns and links. Keep the footer intentional, grouped, and tied to the same shared link-target system.',
                ),
            ],
            'target_options' => SiteNavigationData::headerAuthoringData()['target_options'],
        ]);
    }

    /**
     * @param  array{
     *     menu_key: string,
     *     store_href: string,
     *     items: array<int, array<string, mixed>>
     * }  $authoringData
     * @return array{
     *     menu_key: string,
     *     label: string,
     *     description: string,
     *     workspace: array{store_href: string},
     *     items: array<int, array<string, mixed>>
     * }
     */
    private function menuWorkspace(array $authoringData, string $label, string $description): array
    {
        return [
            'menu_key' => $authoringData['menu_key'],
            'label' => $label,
            'description' => $description,
            'workspace' => [
                'store_href' => $authoringData['store_href'],
            ],
            'items' => $authoringData['items'],
        ];
    }
}
