<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\PageContainerAdminStoreRequest;
use App\Models\Page;
use App\Support\Cms\CmsModuleRegistry;
use App\Support\Cms\PageBlockOrdering;
use App\Support\Cms\PageContainerOrdering;
use App\Support\Cms\ResolvesCmsAuthoringRedirect;
use App\Support\Cms\Regions\CmsExposedRegionRegistry;
use Illuminate\Http\RedirectResponse;

class ExposedRegionContainerController extends Controller
{
    use ResolvesCmsAuthoringRedirect;

    public function store(
        PageContainerAdminStoreRequest $request,
        string $regionKey,
        CmsExposedRegionRegistry $registry,
        PageContainerOrdering $pageContainerOrdering,
        PageBlockOrdering $pageBlockOrdering,
    ): RedirectResponse {
        $definition = $registry->definitionForKey(
            $regionKey,
            $request->string('return_to')->trim()->value(),
        );

        abort_unless($definition !== null, 404);

        $page = Page::query()->firstOrCreate(
            ['exposure_key' => $definition->key],
            [
                'title' => $definition->pageTitle,
                'slug' => $definition->pageSlug,
                'status' => 'published',
                'layout_key' => 'region',
            ],
        );

        $validated = $request->validated();
        $relativeContainer = is_numeric($validated['relative_container_id'] ?? null)
            ? $page->pageContainers()->find((int) $validated['relative_container_id'])
            : null;
        $payload = CmsModuleRegistry::normalizedPayload(
            trim((string) $validated['module_key']),
            $validated['data_json'] ?? [],
            $validated['config_json'] ?? [],
        );

        $pageContainer = $pageContainerOrdering->create(
            $page,
            [
                'label' => $this->nullableString($validated['label'] ?? null),
                'container_type' => trim((string) $validated['container_type']),
            ],
            $this->nullableString($validated['insertion_mode'] ?? null),
            $relativeContainer,
        );

        $pageBlockOrdering->create(
            $pageContainer,
            [
                'module_key' => trim((string) $validated['module_key']),
                'data_json' => $payload['data'],
                'config_json' => $payload['config'],
            ],
            'end',
            null,
        );

        return redirect()->to($this->resolveRedirectTarget($request, $page), 303);
    }

    private function nullableString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }
}
