<?php

namespace App\Http\Requests\Cms;

use App\Support\Cms\CmsModuleRegistry;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class PageBlockAdminUpdateRequest extends FormRequest
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
            'module_key' => [
                'required',
                'string',
                Rule::in(CmsModuleRegistry::keys()),
            ],
            'return_to' => ['nullable', 'string', 'max:500'],
            'data_json' => ['nullable', 'array'],
            'config_json' => ['nullable', 'array'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
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
