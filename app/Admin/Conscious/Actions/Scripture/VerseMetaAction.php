<?php

namespace App\Admin\Conscious\Actions\Scripture;

use App\Admin\Conscious\Actions\ConsciousActionDefinition;
use App\Admin\Conscious\Actions\ConsciousActionHandler;
use App\Admin\Conscious\Policies\ConsciousVerseSupportPolicy;
use App\Models\Verse;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

final class VerseMetaAction implements ConsciousActionHandler
{
    public function __construct(
        private readonly ConsciousVerseSupportPolicy $policy,
    ) {}

    public function handle(Request $request, ConsciousActionDefinition $action, Model $entity): ?RedirectResponse
    {
        abort_unless($action->actionKey === 'verse_support.meta.update', 422);
        $this->policy->assertVerseOwner($entity);
        abort_unless($entity instanceof Verse, 422);

        $validated = Validator::make($request->all(), [
            'summary_short' => ['sometimes', 'nullable', 'string'],
            'primary_speaker_character_id' => ['sometimes', 'nullable', 'integer', 'exists:characters,id'],
            'primary_listener_character_id' => ['sometimes', 'nullable', 'integer', 'exists:characters,id'],
            'scene_location' => ['sometimes', 'nullable', 'string', 'max:255'],
            'narrative_phase' => ['sometimes', 'nullable', 'string', 'max:255'],
            'teaching_mode' => ['sometimes', 'nullable', 'string', 'max:255'],
            'difficulty_level' => ['sometimes', 'nullable', 'string', 'max:255'],
            'memorization_priority' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:65535'],
            'is_featured' => ['sometimes', 'boolean'],
            'keywords' => ['sometimes', 'nullable', 'array'],
            'keywords.*' => ['string', 'max:255'],
            'study_flags' => ['sometimes', 'nullable', 'array'],
            'study_flags.*' => ['string', 'max:255'],
            'meta_json' => ['sometimes', 'nullable', 'array'],
            'verse_id' => ['prohibited'],
        ])->validate();

        $entity->verseMeta()->updateOrCreate([], $this->attributes($validated));

        return null;
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function attributes(array $validated): array
    {
        $attributes = [];

        foreach ([
            'primary_speaker_character_id',
            'primary_listener_character_id',
            'memorization_priority',
            'is_featured',
            'meta_json',
        ] as $key) {
            if (array_key_exists($key, $validated)) {
                $attributes[$key] = $validated[$key];
            }
        }

        foreach (['summary_short', 'scene_location', 'narrative_phase', 'teaching_mode', 'difficulty_level'] as $key) {
            if (array_key_exists($key, $validated)) {
                $attributes[$key] = $this->nullableString($validated[$key]);
            }
        }

        if (array_key_exists('keywords', $validated)) {
            $attributes['keywords_json'] = $this->normalizeStringList($validated['keywords'] ?? []);
        }

        if (array_key_exists('study_flags', $validated)) {
            $attributes['study_flags_json'] = $this->normalizeStringList($validated['study_flags'] ?? []);
        }

        return $attributes;
    }

    /**
     * @param  array<mixed>  $values
     * @return list<string>|null
     */
    private function normalizeStringList(array $values): ?array
    {
        $normalized = collect($values)
            ->map(fn (mixed $value): ?string => $this->nullableString($value))
            ->filter()
            ->values()
            ->all();

        return $normalized === [] ? null : $normalized;
    }

    private function nullableString(mixed $value): ?string
    {
        if (! is_string($value) && ! is_numeric($value)) {
            return null;
        }

        $trimmed = trim((string) $value);

        return $trimmed === '' ? null : $trimmed;
    }
}
