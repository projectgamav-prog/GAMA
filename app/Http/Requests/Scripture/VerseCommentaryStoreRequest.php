<?php

namespace App\Http\Requests\Scripture;

use App\Models\Verse;
use App\Models\VerseCommentary;
use App\Support\Scripture\Admin\Registry\AdminEntityRegistry;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VerseCommentaryStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $definition = app(AdminEntityRegistry::class)->definition('verse');
        $verse = $this->verse();
        $commentary = $this->commentary();

        $sourceKeyRules = $definition->field('commentary_source_key')->validationRules();
        $sourceKeyRules[] = Rule::unique('verse_commentaries', 'source_key')
            ->where(
                fn ($query) => $query
                    ->where('verse_id', $verse->getKey())
                    ->where('language_code', $this->input('language_code')),
            )
            ->ignore($commentary?->getKey());

        return [
            'source_key' => $sourceKeyRules,
            'source_name' => $definition->field('commentary_source_name')->validationRules(),
            'commentary_source_id' => $definition->field('commentary_source_id')->validationRules(),
            'author_name' => $definition->field('commentary_author_name')->validationRules(),
            'language_code' => $definition->field('commentary_language_code')->validationRules(),
            'title' => $definition->field('commentary_title')->validationRules(),
            'body' => $definition->field('commentary_body')->validationRules(),
            'sort_order' => $definition->field('commentary_sort_order')->validationRules(),
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'source_key' => $this->normalizeString($this->input('source_key')),
            'source_name' => $this->normalizeString($this->input('source_name')),
            'author_name' => $this->normalizeNullableString($this->input('author_name')),
            'language_code' => $this->normalizeString($this->input('language_code')),
            'title' => $this->normalizeNullableString($this->input('title')),
            'body' => $this->normalizeString($this->input('body')),
        ]);
    }

    private function verse(): Verse
    {
        $verse = $this->route('verse');

        if (! $verse instanceof Verse) {
            throw new \RuntimeException('The Verse route parameter is missing.');
        }

        return $verse;
    }

    private function commentary(): ?VerseCommentary
    {
        $commentary = $this->route('commentary');

        return $commentary instanceof VerseCommentary ? $commentary : null;
    }

    private function normalizeString(mixed $value): string
    {
        return is_string($value) ? trim($value) : '';
    }

    private function normalizeNullableString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }
}
