<?php

namespace App\Http\Requests\Scripture;

use App\Support\Scripture\Admin\Registry\AdminEntityRegistry;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

abstract class RegistryContentBlockRequest extends FormRequest
{
    /**
     * @var array<string, string>
     */
    private const OPTIONAL_CONTENT_BLOCK_FIELD_MAP = [
        'block_type' => 'content_block_type',
        'media_url' => 'content_block_media_url',
        'alt_text' => 'content_block_alt_text',
    ];

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the registry entity key that owns this content-block workflow.
     */
    abstract protected function adminEntityKey(): string;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $definition = app(AdminEntityRegistry::class)
            ->definition($this->adminEntityKey());
        $rules = [
            'title' => $definition->field('content_block_title')->validationRules(),
            'body' => $definition->field('content_block_body')->validationRules(),
            'region' => $definition->field('content_block_region')->validationRules(),
            'sort_order' => $definition->field('content_block_sort_order')->validationRules(),
            'status' => $definition->field('content_block_status')->validationRules(),
        ];

        foreach (self::OPTIONAL_CONTENT_BLOCK_FIELD_MAP as $inputKey => $fieldKey) {
            if (! array_key_exists($fieldKey, $definition->fields)) {
                continue;
            }

            $rules[$inputKey] = $definition->field($fieldKey)->validationRules();
        }

        return $rules;
    }
}
