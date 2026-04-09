<?php

namespace App\Http\Requests\Cms;

use App\Models\PageBlock;
use App\Models\PageContainer;
use App\Support\Cms\CmsModuleRegistry;
use App\Support\Cms\PageBlockOrdering;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class PageBlockAdminStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'insertion_mode' => [
                'nullable',
                'string',
                'in:'.implode(',', PageBlockOrdering::insertionModes()),
            ],
            'relative_block_id' => ['nullable', 'integer'],
            'module_key' => [
                'required',
                'string',
                Rule::in(CmsModuleRegistry::keys()),
            ],
            'data_json' => ['nullable', 'array'],
            'config_json' => ['nullable', 'array'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            /** @var PageContainer|null $pageContainer */
            $pageContainer = $this->route('pageContainer');
            $insertionMode = $this->nullableString($this->input('insertion_mode'));
            $relativeBlockId = $this->input('relative_block_id');

            if (in_array($insertionMode, ['before', 'after'], true)) {
                if (! is_numeric($relativeBlockId)) {
                    $validator->errors()->add(
                        'relative_block_id',
                        'Choose where the new block should be inserted.',
                    );

                    return;
                }

                $relativeBlock = PageBlock::query()->find((int) $relativeBlockId);

                if (! $pageContainer instanceof PageContainer
                    || ! $relativeBlock instanceof PageBlock
                    || (int) $relativeBlock->page_container_id !== (int) $pageContainer->getKey()) {
                    $validator->errors()->add(
                        'relative_block_id',
                        'The selected block is not available in this container.',
                    );
                }
            }

            foreach (
                CmsModuleRegistry::validationErrors(
                    $this->nullableString($this->input('module_key')),
                    $this->input('data_json'),
                    $this->input('config_json'),
                ) as $field => $message
            ) {
                $validator->errors()->add($field, $message);
            }
        });
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
