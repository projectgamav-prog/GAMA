<?php

namespace App\Http\Requests\Scripture;

use App\Support\Scripture\Admin\Registry\AdminEntityRegistry;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class BookAdminDetailsUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the request data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'description' => $this->normalizedString($this->input('description')),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $definition = app(AdminEntityRegistry::class)
            ->definition('book');

        return [
            'description' => $definition->field('description')->validationRules(),
        ];
    }

    private function normalizedString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }

}
