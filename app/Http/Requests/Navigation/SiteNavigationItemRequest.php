<?php

namespace App\Http\Requests\Navigation;

use App\Models\NavigationItem;
use App\Support\Navigation\LinkTarget;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

abstract class SiteNavigationItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'label' => $this->normalizedString($this->input('label')),
            'menu_key' => $this->normalizedString($this->input('menu_key')) ?? NavigationItem::MENU_PUBLIC_HEADER,
            'target' => LinkTarget::normalize($this->input('target')),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function baseRules(): array
    {
        return [
            'menu_key' => ['required', 'string', Rule::in([
                NavigationItem::MENU_PUBLIC_HEADER,
                NavigationItem::MENU_PUBLIC_FOOTER,
            ])],
            'parent_id' => ['nullable', 'integer', 'exists:navigation_items,id'],
            'label' => ['required', 'string', 'max:255'],
            'target' => ['nullable', 'array'],
            'sort_order' => ['nullable', 'integer', 'min:1'],
        ];
    }

    /**
     * @return array<int, string>
     */
    public function targetErrors(): array
    {
        if ($this->input('target') === null) {
            return [];
        }

        return LinkTarget::validate($this->input('target'));
    }

    protected function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            foreach ($this->targetErrors() as $message) {
                $validator->errors()->add('target', $message);
            }
        });
    }

    protected function normalizedString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }
}
