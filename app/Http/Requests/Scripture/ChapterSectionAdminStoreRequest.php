<?php

namespace App\Http\Requests\Scripture;

use App\Models\Chapter;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ChapterSectionAdminStoreRequest extends FormRequest
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
        $chapter = $this->chapter();

        return [
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('chapter_sections', 'slug')
                    ->where('chapter_id', $chapter->getKey()),
            ],
            'number' => ['nullable', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
        ];
    }

    private function chapter(): Chapter
    {
        $chapter = $this->route('chapter');

        if (! $chapter instanceof Chapter) {
            throw new \RuntimeException('The Chapter route parameter is missing.');
        }

        return $chapter;
    }
}
