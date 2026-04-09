<?php

namespace App\Http\Requests\Cms;

use App\Models\Page;
use App\Models\PageContainer;
use App\Support\Cms\CmsModuleRegistry;
use App\Support\Cms\PageContainerOrdering;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class PageContainerAdminStoreRequest extends FormRequest
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
            'label' => ['nullable', 'string', 'max:255'],
            'container_type' => ['required', 'string', 'in:card,section'],
            'insertion_mode' => [
                'nullable',
                'string',
                'in:'.implode(',', PageContainerOrdering::insertionModes()),
            ],
            'relative_container_id' => ['nullable', 'integer'],
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
            /** @var Page|null $page */
            $page = $this->route('page');
            $insertionMode = $this->nullableString($this->input('insertion_mode'));
            $relativeContainerId = $this->input('relative_container_id');

            if (in_array($insertionMode, ['before', 'after'], true)) {
                if (! is_numeric($relativeContainerId)) {
                    $validator->errors()->add(
                        'relative_container_id',
                        'Choose where the new container should be inserted.',
                    );

                    return;
                }

                $relativeContainer = PageContainer::query()->find((int) $relativeContainerId);

                if (! $page instanceof Page
                    || ! $relativeContainer instanceof PageContainer
                    || (int) $relativeContainer->page_id !== (int) $page->getKey()) {
                    $validator->errors()->add(
                        'relative_container_id',
                        'The selected container is not available on this page.',
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
