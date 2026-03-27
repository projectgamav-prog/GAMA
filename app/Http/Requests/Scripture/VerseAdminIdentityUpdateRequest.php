<?php

namespace App\Http\Requests\Scripture;

use App\Models\Verse;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VerseAdminIdentityUpdateRequest extends FormRequest
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
        $verse = $this->verse();

        return [
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('verses', 'slug')
                    ->where('chapter_section_id', $verse->chapter_section_id)
                    ->ignore($verse->getKey()),
            ],
            'number' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('verses', 'number')
                    ->where('chapter_section_id', $verse->chapter_section_id)
                    ->ignore($verse->getKey()),
            ],
            'text' => ['required', 'string'],
        ];
    }

    private function verse(): Verse
    {
        $verse = $this->route('verse');

        if (! $verse instanceof Verse) {
            throw new \RuntimeException('The Verse route parameter is missing.');
        }

        return $verse;
    }
}
