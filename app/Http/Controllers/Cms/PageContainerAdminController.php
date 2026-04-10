<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\PageContainerAdminStoreRequest;
use App\Http\Requests\Cms\PageContainerAdminUpdateRequest;
use App\Models\Page;
use App\Models\PageContainer;
use App\Support\Cms\CmsModuleRegistry;
use App\Support\Cms\PageBlockOrdering;
use App\Support\Cms\PageContainerOrdering;
use App\Support\Cms\ResolvesCmsAuthoringRedirect;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class PageContainerAdminController extends Controller
{
    use ResolvesCmsAuthoringRedirect;

    public function store(
        PageContainerAdminStoreRequest $request,
        Page $page,
        PageContainerOrdering $pageContainerOrdering,
        PageBlockOrdering $pageBlockOrdering,
    ): RedirectResponse {
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

    public function update(
        PageContainerAdminUpdateRequest $request,
        Page $page,
        PageContainer $pageContainer,
    ): RedirectResponse {
        $pageContainer->update([
            'label' => $this->nullableString($request->validated('label')),
            'container_type' => trim((string) $request->validated('container_type')),
        ]);

        return redirect()->to($this->resolveRedirectTarget($request, $page), 303);
    }

    public function destroy(
        Request $request,
        Page $page,
        PageContainer $pageContainer,
        PageContainerOrdering $pageContainerOrdering,
    ): RedirectResponse {
        $pageContainerOrdering->remove($page, $pageContainer);

        return redirect()->to($this->resolveRedirectTarget($request, $page), 303);
    }

    public function moveUp(
        Request $request,
        Page $page,
        PageContainer $pageContainer,
        PageContainerOrdering $pageContainerOrdering,
    ): RedirectResponse {
        $pageContainerOrdering->moveUp($page, $pageContainer);

        return redirect()->to($this->resolveRedirectTarget($request, $page), 303);
    }

    public function moveDown(
        Request $request,
        Page $page,
        PageContainer $pageContainer,
        PageContainerOrdering $pageContainerOrdering,
    ): RedirectResponse {
        $pageContainerOrdering->moveDown($page, $pageContainer);

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
