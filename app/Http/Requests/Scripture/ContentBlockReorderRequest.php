<?php

namespace App\Http\Requests\Scripture;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ContentBlockReorderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'relative_block_id' => ['required', 'integer', 'exists:content_blocks,id'],
            'position' => ['required', 'string', Rule::in(['before', 'after'])],
        ];
    }
}
