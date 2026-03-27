<?php

namespace App\Http\Requests\Scripture;

use App\Models\ContentBlock;
use App\Support\Scripture\Admin\RegisteredContentBlockOrdering;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Validator;

abstract class OrderedRegistryContentBlockStoreRequest extends RegistryContentBlockRequest
{
    /**
     * Determine whether the given block can anchor contextual insertion.
     */
    abstract protected function isContextualInsertionAnchor(ContentBlock $contentBlock): bool;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = parent::rules();

        $sortOrderRules = array_values(array_filter(
            (array) ($rules['sort_order'] ?? []),
            fn (string $rule) => $rule !== 'required',
        ));

        return [
            ...$rules,
            'sort_order' => ['nullable', ...$sortOrderRules],
            'insertion_mode' => ['nullable', 'string', 'in:'.implode(',', RegisteredContentBlockOrdering::insertionModes())],
            'relative_block_id' => ['nullable', 'integer'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $insertionMode = $this->nullableString(
                $this->input('insertion_mode'),
            );
            $relativeBlockId = $this->input('relative_block_id');
            $hasExplicitSortOrder = $this->hasExplicitSortOrder();

            if ($insertionMode === null) {
                if (! $hasExplicitSortOrder) {
                    $validator->errors()->add(
                        'sort_order',
                        'Sort order is required when no insertion point is provided.',
                    );
                }

                return;
            }

            if (in_array($insertionMode, ['before', 'after'], true)) {
                if (! is_numeric($relativeBlockId)) {
                    $validator->errors()->add(
                        'relative_block_id',
                        'A reference block is required for this insertion point.',
                    );

                    return;
                }

                $relativeBlock = ContentBlock::query()->find(
                    (int) $relativeBlockId,
                );

                if (! $relativeBlock instanceof ContentBlock
                    || ! $this->isContextualInsertionAnchor($relativeBlock)) {
                    $validator->errors()->add(
                        'relative_block_id',
                        'The selected insertion anchor is not available on this page.',
                    );
                }

                return;
            }

            if (in_array($insertionMode, ['start', 'end'], true)
                && $this->nullableString($relativeBlockId) !== null) {
                $validator->errors()->add(
                    'relative_block_id',
                    'A reference block is not used for start or end insertion.',
                );
            }
        });
    }

    private function hasExplicitSortOrder(): bool
    {
        $sortOrder = $this->input('sort_order');

        return $sortOrder !== null && $sortOrder !== '';
    }

    private function nullableString(mixed $value): ?string
    {
        if (! is_string($value) && ! is_numeric($value)) {
            return null;
        }

        $trimmed = trim((string) $value);

        return $trimmed === '' ? null : $trimmed;
    }
}
