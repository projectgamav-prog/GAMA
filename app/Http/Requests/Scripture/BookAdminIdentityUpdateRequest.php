<?php

namespace App\Http\Requests\Scripture;

use App\Models\Book;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BookAdminIdentityUpdateRequest extends FormRequest
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
        $book = $this->book();

        return [
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('books', 'slug')
                    ->ignore($book->getKey()),
            ],
            'number' => [
                'nullable',
                'string',
                'max:255',
            ],
            'title' => ['required', 'string', 'max:255'],
        ];
    }

    private function book(): Book
    {
        $book = $this->route('book');

        if (! $book instanceof Book) {
            throw new \RuntimeException('The Book route parameter is missing.');
        }

        return $book;
    }
}
