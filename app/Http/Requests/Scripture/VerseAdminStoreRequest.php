<?php

namespace App\Http\Requests\Scripture;

use App\Models\ChapterSection;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VerseAdminStoreRequest extends FormRequest
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
        $chapterSection = $this->chapterSection();

        return [
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('verses', 'slug')
                    ->where('chapter_section_id', $chapterSection->getKey()),
            ],
            'number' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('verses', 'number')
                    ->where('chapter_section_id', $chapterSection->getKey()),
            ],
            'text' => ['required', 'string'],
        ];
    }

    private function chapterSection(): ChapterSection
    {
        $chapterSection = $this->route('chapterSection');

        if (! $chapterSection instanceof ChapterSection) {
            throw new \RuntimeException('The ChapterSection route parameter is missing.');
        }

        return $chapterSection;
    }
}
