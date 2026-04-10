<?php

namespace App\Support\Cms\Regions;

use App\Models\Page;
use App\Support\AdminContext\AdminContext;
use App\Support\Cms\PublicPageData;
use Illuminate\Contracts\Auth\Authenticatable;

class CmsExposedRegionResolver
{
    public function __construct(
        private readonly PublicPageData $publicPageData,
    ) {}

    /**
     * @param  list<CmsExposedRegionDefinition>  $definitions
     * @return list<array<string, mixed>>
     */
    public function resolve(array $definitions, ?Authenticatable $user): array
    {
        $isAdmin = AdminContext::canAccess($user);
        $pages = Page::query()
            ->whereIn('exposure_key', collect($definitions)->map->key->all())
            ->with([
                'pageContainers' => fn ($query) => $query
                    ->orderBy('sort_order')
                    ->with([
                        'pageBlocks' => fn ($blockQuery) => $blockQuery
                            ->orderBy('sort_order')
                            ->orderBy('id'),
                    ]),
            ])
            ->get()
            ->keyBy('exposure_key');

        return collect($definitions)
            ->map(function (CmsExposedRegionDefinition $definition) use ($pages, $isAdmin): array {
                /** @var Page|null $page */
                $page = $pages->get($definition->key);
                $hasPublishedPage = $page instanceof Page && $page->status === 'published';

                return [
                    'key' => $definition->key,
                    'label' => $definition->label,
                    'description' => $definition->description,
                    'containers' => $hasPublishedPage
                        ? $this->publicPageData->publicContainers($page)
                        : [],
                    'admin' => $isAdmin
                        ? [
                            'return_to' => $definition->returnTo,
                            'bootstrap_store_href' => route(
                                'cms.exposed-regions.containers.store',
                                ['regionKey' => $definition->key],
                                false,
                            ),
                            'page' => $page
                                ? $this->publicPageData->adminPage($page)
                                : null,
                            'containers' => $page
                                ? $this->publicPageData->adminContainers($page)
                                : [],
                        ]
                        : null,
                ];
            })
            ->values()
            ->all();
    }
}
