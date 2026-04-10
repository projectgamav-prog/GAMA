<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\PageBlockAdminStoreRequest;
use App\Http\Requests\Cms\PageBlockAdminUpdateRequest;
use App\Models\Page;
use App\Models\PageBlock;
use App\Models\PageContainer;
use App\Support\Cms\CmsModuleRegistry;
use App\Support\Cms\PageBlockOrdering;
use Illuminate\Http\RedirectResponse;

class PageBlockAdminController extends Controller
{
    public function store(
        PageBlockAdminStoreRequest $request,
        Page $page,
        PageContainer $pageContainer,
        PageBlockOrdering $pageBlockOrdering,
    ): RedirectResponse {
        $validated = $request->validated();
        $relativeBlock = is_numeric($validated['relative_block_id'] ?? null)
            ? $pageContainer->pageBlocks()->find((int) $validated['relative_block_id'])
            : null;
        $payload = CmsModuleRegistry::normalizedPayload(
            trim((string) $validated['module_key']),
            $validated['data_json'] ?? [],
            $validated['config_json'] ?? [],
        );

        $pageBlockOrdering->create(
            $pageContainer,
            [
                'module_key' => trim((string) $validated['module_key']),
                'data_json' => $payload['data'],
                'config_json' => $payload['config'],
            ],
            $this->nullableString($validated['insertion_mode'] ?? null),
            $relativeBlock,
        );

        return redirect()->to(route('cms.pages.show', $page, false), 303);
    }

    public function update(
        PageBlockAdminUpdateRequest $request,
        Page $page,
        PageContainer $pageContainer,
        PageBlock $pageBlock,
    ): RedirectResponse {
        $validated = $request->validated();
        $payload = CmsModuleRegistry::normalizedPayload(
            trim((string) $validated['module_key']),
            $validated['data_json'] ?? [],
            $validated['config_json'] ?? [],
        );

        $pageBlock->update([
            'module_key' => trim((string) $validated['module_key']),
            'data_json' => $payload['data'],
            'config_json' => $payload['config'],
        ]);

        return redirect()->to(route('cms.pages.show', $page, false), 303);
    }

    public function destroy(
        Page $page,
        PageContainer $pageContainer,
        PageBlock $pageBlock,
        PageBlockOrdering $pageBlockOrdering,
    ): RedirectResponse {
        $pageBlockOrdering->remove($pageContainer, $pageBlock);

        return redirect()->to(route('cms.pages.show', $page, false), 303);
    }

    public function moveUp(
        Page $page,
        PageContainer $pageContainer,
        PageBlock $pageBlock,
        PageBlockOrdering $pageBlockOrdering,
    ): RedirectResponse {
        $pageBlockOrdering->moveUp($pageContainer, $pageBlock);

        return redirect()->to(route('cms.pages.show', $page, false), 303);
    }

    public function moveDown(
        Page $page,
        PageContainer $pageContainer,
        PageBlock $pageBlock,
        PageBlockOrdering $pageBlockOrdering,
    ): RedirectResponse {
        $pageBlockOrdering->moveDown($pageContainer, $pageBlock);

        return redirect()->to(route('cms.pages.show', $page, false), 303);
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
