<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\PageAdminUpdateRequest;
use App\Models\Page;
use Illuminate\Http\RedirectResponse;

class PageAdminUpdateController extends Controller
{
    /**
     * Update the core CMS page identity fields.
     */
    public function update(
        PageAdminUpdateRequest $request,
        Page $page,
    ): RedirectResponse {
        $validated = $request->validated();

        $page->update([
            'title' => trim($validated['title']),
            'slug' => trim($validated['slug']),
            'status' => trim($validated['status']),
            'layout_key' => $this->nullableString($validated['layout_key'] ?? null),
        ]);

        return redirect()->route('cms.pages.show', $page, 303);
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
