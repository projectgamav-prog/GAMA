<?php

namespace App\Http\Requests\Scripture;

use App\Support\Scripture\Admin\Registry\AdminEntityRegistry;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class BookAdminMediaAssignmentStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
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
            'media_id' => $definition->field('media_assignment_media_id')->validationRules(),
            'role' => $definition->field('media_assignment_role')->validationRules(),
            'title_override' => $definition->field('media_assignment_title_override')->validationRules(),
            'caption_override' => $definition->field('media_assignment_caption_override')->validationRules(),
            'sort_order' => $definition->field('media_assignment_sort_order')->validationRules(),
            'status' => $definition->field('media_assignment_status')->validationRules(),
        ];
    }
}
