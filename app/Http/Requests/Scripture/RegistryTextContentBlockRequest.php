<?php

namespace App\Http\Requests\Scripture;

use App\Support\Scripture\Admin\Registry\AdminEntityRegistry;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

abstract class RegistryTextContentBlockRequest extends FormRequest
{
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

        return [
            'title' => $definition->field('content_block_title')->validationRules(),
            'body' => $definition->field('content_block_body')->validationRules(),
            'region' => $definition->field('content_block_region')->validationRules(),
            'sort_order' => $definition->field('content_block_sort_order')->validationRules(),
            'status' => $definition->field('content_block_status')->validationRules(),
        ];
    }
}
