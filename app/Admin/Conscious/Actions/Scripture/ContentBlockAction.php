<?php

namespace App\Admin\Conscious\Actions\Scripture;

use App\Admin\Conscious\Actions\ConsciousActionDefinition;
use App\Admin\Conscious\Actions\ConsciousActionHandler;
use App\Admin\Conscious\Policies\ConsciousContentBlockPolicy;
use App\Models\ContentBlock;
use App\Support\Scripture\Admin\RegisteredContentBlockOrdering;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

final class ContentBlockAction implements ConsciousActionHandler
{
    public function __construct(
        private readonly ConsciousContentBlockPolicy $policy,
        private readonly RegisteredContentBlockOrdering $ordering,
    ) {}

    public function handle(
        Request $request,
        ConsciousActionDefinition $action,
        Model $entity,
    ): ?RedirectResponse {
        match ($action->actionKey) {
            'content_block.create' => $this->create($request, $entity),
            'content_block.update' => $this->update($request, $entity),
            'content_block.delete' => $this->delete($request, $entity),
            'content_block.duplicate' => $this->duplicate($request, $entity),
            'content_block.reorder' => $this->reorder($request, $entity),
            default => abort(422, 'This content block action is not implemented.'),
        };

        return null;
    }

    private function create(Request $request, Model $owner): void
    {
        $this->policy->assertOwnerSupported($owner);

        $validated = Validator::make(
            $request->all(),
            $this->createRules(),
            attributes: $this->attributes(),
        )->validate();

        $this->policy->assertCanPersist($owner, $validated);

        $this->ordering->create($owner, $this->attributesFromValidated($validated));
    }

    private function update(Request $request, Model $owner): void
    {
        $this->policy->assertOwnerSupported($owner);

        $validated = Validator::make(
            $request->all(),
            $this->updateRules(),
            attributes: $this->attributes(),
        )->validate();

        $contentBlock = ContentBlock::query()->findOrFail((int) $validated['content_block_id']);

        $this->policy->assertCanUpdate($owner, $contentBlock, $validated);

        $contentBlock->forceFill($this->attributesFromValidated($validated, $contentBlock))->save();
    }

    private function delete(Request $request, Model $owner): void
    {
        $this->policy->assertOwnerSupported($owner);

        $validated = Validator::make(
            $request->all(),
            [
                'content_block_id' => ['required', 'integer'],
                ...$this->blockedStructuralPayloadRules(),
            ],
            attributes: $this->attributes(),
        )->validate();

        $contentBlock = ContentBlock::query()->findOrFail((int) $validated['content_block_id']);

        $this->policy->assertCanDelete($owner, $contentBlock);

        $this->ordering->remove($owner, $contentBlock);
    }

    private function duplicate(Request $request, Model $owner): void
    {
        $this->policy->assertOwnerSupported($owner);

        $validated = Validator::make(
            $request->all(),
            [
                'content_block_id' => ['required', 'integer'],
                ...$this->blockedStructuralPayloadRules(),
            ],
            attributes: $this->attributes(),
        )->validate();

        $contentBlock = ContentBlock::query()->findOrFail((int) $validated['content_block_id']);

        $this->policy->assertCanDuplicate($owner, $contentBlock);

        $this->ordering->create($owner, [
            'region' => $contentBlock->region,
            'block_type' => $contentBlock->block_type,
            'title' => $contentBlock->title,
            'body' => $contentBlock->body,
            'status' => $contentBlock->status,
            'data_json' => $contentBlock->data_json,
        ], insertionMode: 'after', relativeBlock: $contentBlock);
    }

    private function reorder(Request $request, Model $owner): void
    {
        $this->policy->assertOwnerSupported($owner);

        $validated = Validator::make(
            $request->all(),
            [
                'content_block_id' => ['required', 'integer'],
                'relative_block_id' => ['sometimes', 'integer'],
                'position' => ['required_with:relative_block_id', 'string', Rule::in(['before', 'after'])],
                'direction' => ['sometimes', 'string', Rule::in(['up', 'down'])],
                ...$this->blockedStructuralPayloadRules(),
            ],
            attributes: $this->attributes(),
        )->validate();

        $contentBlock = ContentBlock::query()->findOrFail((int) $validated['content_block_id']);
        [$relativeBlock, $position] = $this->resolveReorderTarget($owner, $contentBlock, $validated);

        $this->policy->assertCanReorder($owner, $contentBlock, $relativeBlock);

        if ($position === 'before') {
            $this->ordering->moveBefore($owner, $contentBlock, $relativeBlock);
        } else {
            $this->ordering->moveAfter($owner, $contentBlock, $relativeBlock);
        }
    }

    /**
     * @return array<string, list<mixed>>
     */
    private function createRules(): array
    {
        return [
            'block_type' => ['required', 'string', Rule::in($this->policy->allowedBlockTypes())],
            'region' => ['required', 'string', 'max:100'],
            'title' => ['sometimes', 'nullable', 'string', 'max:255'],
            'body' => ['required', 'nullable', 'string'],
            'status' => ['required', 'string', Rule::in(['draft', 'published'])],
            'sort_order' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'data_json' => ['sometimes', 'nullable', 'array'],
            ...$this->blockedStructuralPayloadRules(),
        ];
    }

    /**
     * @return array<string, list<mixed>>
     */
    private function updateRules(): array
    {
        return [
            'content_block_id' => ['required', 'integer'],
            'block_type' => ['sometimes', 'string', Rule::in($this->policy->allowedBlockTypes())],
            'region' => ['sometimes', 'string', 'max:100'],
            'title' => ['sometimes', 'nullable', 'string', 'max:255'],
            'body' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', 'string', Rule::in(['draft', 'published'])],
            'sort_order' => ['prohibited'],
            'data_json' => ['sometimes', 'nullable', 'array'],
            ...$this->blockedStructuralPayloadRules(),
        ];
    }

    /**
     * @return array<string, list<string>>
     */
    private function blockedStructuralPayloadRules(): array
    {
        return [
            'parent_type' => ['prohibited'],
            'parent_id' => ['prohibited'],
            'owner_type' => ['prohibited'],
            'owner_id' => ['prohibited'],
            'schema_family' => ['prohibited'],
            'entity_type' => ['prohibited'],
            'entity_id' => ['prohibited'],
        ];
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function attributesFromValidated(
        array $validated,
        ?ContentBlock $existing = null,
    ): array {
        $attributes = [];

        foreach (['block_type', 'region', 'status'] as $key) {
            if (array_key_exists($key, $validated)) {
                $attributes[$key] = trim((string) $validated[$key]);
            }
        }

        if (array_key_exists('title', $validated)) {
            $attributes['title'] = $this->nullableString($validated['title']);
        }

        if (array_key_exists('body', $validated)) {
            $attributes['body'] = $this->nullableString($validated['body']);
        }

        if (array_key_exists('sort_order', $validated)) {
            $attributes['sort_order'] = $validated['sort_order'];
        }

        if (array_key_exists('data_json', $validated)) {
            $attributes['data_json'] = $validated['data_json'];
        }

        if ($existing === null) {
            foreach (['block_type', 'region', 'status'] as $requiredKey) {
                if (! array_key_exists($requiredKey, $attributes)) {
                    throw ValidationException::withMessages([
                        $requiredKey => 'This content block field is required.',
                    ]);
                }
            }
        }

        return $attributes;
    }

    /**
     * @return array<string, string>
     */
    private function attributes(): array
    {
        return [
            'content_block_id' => 'content block',
            'relative_block_id' => 'relative content block',
            'position' => 'position',
            'direction' => 'direction',
            'block_type' => 'block type',
            'region' => 'region',
            'title' => 'title',
            'body' => 'body',
            'status' => 'status',
            'sort_order' => 'sort order',
            'data_json' => 'data',
        ];
    }

    private function nullableString(mixed $value): ?string
    {
        if (! is_string($value) && ! is_numeric($value)) {
            return null;
        }

        $trimmed = trim((string) $value);

        return $trimmed === '' ? null : $trimmed;
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array{0: ContentBlock, 1: string}
     */
    private function resolveReorderTarget(
        Model $owner,
        ContentBlock $contentBlock,
        array $validated,
    ): array {
        if (isset($validated['relative_block_id'])) {
            return [
                ContentBlock::query()->findOrFail((int) $validated['relative_block_id']),
                (string) $validated['position'],
            ];
        }

        $direction = $validated['direction'] ?? null;
        if (! in_array($direction, ['up', 'down'], true)) {
            throw ValidationException::withMessages([
                'direction' => 'A reorder direction or relative content block is required.',
            ]);
        }

        $blocks = $owner->contentBlocks()
            ->where('region', $contentBlock->region)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->values();
        $index = $blocks->search(
            fn (ContentBlock $block): bool => (int) $block->getKey() === (int) $contentBlock->getKey(),
        );

        abort_unless(is_int($index), 404);

        $relativeBlock = $direction === 'up'
            ? $blocks->get($index - 1)
            : $blocks->get($index + 1);

        if (! $relativeBlock instanceof ContentBlock) {
            throw ValidationException::withMessages([
                'direction' => 'No content block is available in that direction.',
            ]);
        }

        return [
            $relativeBlock,
            $direction === 'up' ? 'before' : 'after',
        ];
    }
}
