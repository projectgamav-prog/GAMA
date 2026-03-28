<?php

namespace App\Http\Requests\Scripture;

use App\Models\Verse;
use App\Models\VerseTranslation;
use App\Support\Scripture\Admin\Registry\AdminEntityRegistry;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VerseTranslationStoreRequest extends FormRequest
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
        $translation = $this->translation();

        $sourceKeyRules = $definition->field('translation_source_key')->validationRules();
        $sourceKeyRules[] = Rule::unique('verse_translations', 'source_key')
            ->where(
                fn ($query) => $query
                    ->where('verse_id', $verse->getKey())
                    ->where('language_code', $this->input('language_code')),
            )
            ->ignore($translation?->getKey());

        return [
            'source_key' => $sourceKeyRules,
            'source_name' => $definition->field('translation_source_name')->validationRules(),
            'translation_source_id' => $definition->field('translation_source_id')->validationRules(),
            'language_code' => $definition->field('translation_language_code')->validationRules(),
            'text' => $definition->field('translation_text')->validationRules(),
            'sort_order' => $definition->field('translation_sort_order')->validationRules(),
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'source_key' => $this->normalizeString($this->input('source_key')),
            'source_name' => $this->normalizeString($this->input('source_name')),
            'language_code' => $this->normalizeString($this->input('language_code')),
            'text' => $this->normalizeString($this->input('text')),
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

    private function translation(): ?VerseTranslation
    {
        $translation = $this->route('translation');

        return $translation instanceof VerseTranslation ? $translation : null;
    }

    private function normalizeString(mixed $value): string
    {
        return is_string($value) ? trim($value) : '';
    }
}
