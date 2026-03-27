<?php

namespace App\Http\Requests\Scripture;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class VerseAdminMetaUpdateRequest extends FormRequest
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
        return [
            'summary_short' => ['nullable', 'string'],
            'primary_speaker_character_id' => [
                'nullable',
                'integer',
                'exists:characters,id',
            ],
            'primary_listener_character_id' => [
                'nullable',
                'integer',
                'exists:characters,id',
            ],
            'scene_location' => ['nullable', 'string', 'max:255'],
            'narrative_phase' => ['nullable', 'string', 'max:255'],
            'teaching_mode' => ['nullable', 'string', 'max:255'],
            'difficulty_level' => ['nullable', 'string', 'max:255'],
            'memorization_priority' => ['nullable', 'integer', 'min:0', 'max:65535'],
            'is_featured' => ['required', 'boolean'],
            'keywords' => ['nullable', 'array'],
            'keywords.*' => ['string', 'max:255'],
            'study_flags' => ['nullable', 'array'],
            'study_flags.*' => ['string', 'max:255'],
        ];
    }
}
