<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scripture\EditableTextContentBlockStoreRequest;
use App\Http\Requests\Scripture\EditableTextContentBlockUpdateRequest;
use App\Models\ContentBlock;
use App\Models\Topic;
use App\Support\Scripture\Admin\TopicAdminRouteContext;
use Illuminate\Http\RedirectResponse;

class TopicAdminContentBlockController extends Controller
{
    /**
     * Create a new topic-owned editorial note block.
     */
    public function store(
        EditableTextContentBlockStoreRequest $request,
        Topic $topic,
    ): RedirectResponse {
        $validated = $request->validated();

        $topic->contentBlocks()->create([
            'region' => trim($validated['region']),
            'block_type' => 'text',
            'title' => $this->nullableString($validated['title'] ?? null),
            'body' => trim($validated['body']),
            'data_json' => null,
            'sort_order' => $validated['sort_order'],
            'status' => $validated['status'],
        ]);

        return redirect()->back(status: 303);
    }

    /**
     * Update a topic-owned text note block.
     */
    public function update(
        EditableTextContentBlockUpdateRequest $request,
        Topic $topic,
        ContentBlock $contentBlock,
    ): RedirectResponse {
        $adminRouteContext = new TopicAdminRouteContext($topic);

        $adminRouteContext->abortUnlessEditableNoteBlock($contentBlock);

        $validated = $request->validated();

        $contentBlock->update([
            'region' => trim($validated['region']),
            'title' => $this->nullableString($validated['title'] ?? null),
            'body' => trim($validated['body']),
            'sort_order' => $validated['sort_order'],
            'status' => $validated['status'],
        ]);

        return redirect()->back(status: 303);
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
