<?php

namespace App\Http\Requests\Scripture;

use App\Models\BookSection;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ChapterAdminStoreRequest extends FormRequest
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
        $bookSection = $this->bookSection();

        return [
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('chapters', 'slug')
                    ->where('book_section_id', $bookSection->getKey()),
            ],
            'number' => ['nullable', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
        ];
    }

    private function bookSection(): BookSection
    {
        $bookSection = $this->route('bookSection');

        if (! $bookSection instanceof BookSection) {
            throw new \RuntimeException('The BookSection route parameter is missing.');
        }

        return $bookSection;
    }
}
