<?php

namespace App\Admin\Conscious\Actions\Scripture;

use App\Admin\Conscious\Actions\ConsciousActionDefinition;
use App\Admin\Conscious\Actions\ConsciousActionHandler;
use App\Admin\Conscious\Policies\ConsciousVerseSupportPolicy;
use App\Models\Verse;
use App\Models\VerseTranslation;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

final class VerseTranslationAction implements ConsciousActionHandler
{
    public function __construct(
        private readonly ConsciousVerseSupportPolicy $policy,
    ) {}

    public function handle(Request $request, ConsciousActionDefinition $action, Model $entity): void
    {
        $this->policy->assertVerseOwner($entity);
        abort_unless($entity instanceof Verse, 422);

        match ($action->actionKey) {
            'verse_support.translation.create' => $this->create($request, $entity),
            'verse_support.translation.update' => $this->update($request, $entity),
            'verse_support.translation.delete' => $this->delete($request, $entity),
            default => abort(422, 'This translation action is not implemented.'),
        };
    }

    private function create(Request $request, Verse $verse): void
    {
        $validated = Validator::make($request->all(), $this->rules($verse))->validate();
        $verse->translations()->create($this->attributes($validated));
    }

    private function update(Request $request, Verse $verse): void
    {
        $base = Validator::make($request->all(), ['translation_id' => ['required', 'integer']])->validate();
        $translation = VerseTranslation::query()->findOrFail((int) $base['translation_id']);
        $this->policy->assertTranslationOwnedBy($verse, $translation);

        $validated = Validator::make($request->all(), [
            'translation_id' => ['required', 'integer'],
            ...$this->rules($verse, $translation),
        ])->validate();

        unset($validated['translation_id']);
        $translation->forceFill($this->attributes($validated))->save();
    }

    private function delete(Request $request, Verse $verse): void
    {
        $validated = Validator::make($request->all(), ['translation_id' => ['required', 'integer']])->validate();
        $translation = VerseTranslation::query()->findOrFail((int) $validated['translation_id']);
        $this->policy->assertTranslationOwnedBy($verse, $translation);
        $translation->delete();
    }

    /**
     * @return array<string, list<mixed>>
     */
    private function rules(Verse $verse, ?VerseTranslation $translation = null): array
    {
        return [
            'source_key' => [
                'required',
                'string',
                'max:255',
                Rule::unique('verse_translations', 'source_key')
                    ->where(fn ($query) => $query
                        ->where('verse_id', $verse->getKey())
                        ->where('language_code', request()->input('language_code')))
                    ->ignore($translation?->getKey()),
            ],
            'source_name' => ['required', 'string', 'max:255'],
            'translation_source_id' => ['nullable', 'integer', 'exists:translation_sources,id'],
            'language_code' => ['required', 'string', 'max:16'],
            'text' => ['required', 'string'],
            'sort_order' => ['required', 'integer', 'min:0'],
            'verse_id' => ['prohibited'],
        ];
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function attributes(array $validated): array
    {
        return [
            'source_key' => trim((string) $validated['source_key']),
            'source_name' => trim((string) $validated['source_name']),
            'translation_source_id' => $validated['translation_source_id'] ?? null,
            'language_code' => trim((string) $validated['language_code']),
            'text' => trim((string) $validated['text']),
            'sort_order' => $validated['sort_order'],
        ];
    }
}
