<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scripture\VerseAdminMetaUpdateRequest;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\Verse;
use Illuminate\Http\RedirectResponse;

class VerseAdminMetaController extends Controller
{
    /**
     * Update or create verse editorial metadata.
     */
    public function update(
        VerseAdminMetaUpdateRequest $request,
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        Verse $verse,
    ): RedirectResponse {
        unset($book, $bookSection, $chapter, $chapterSection);

        $validated = $request->validated();
        $attributes = [
            'is_featured' => (bool) $validated['is_featured'],
        ];

        if (array_key_exists('summary_short', $validated)) {
            $attributes['summary_short'] = $this->nullableString($validated['summary_short']);
        }

        if (array_key_exists('primary_speaker_character_id', $validated)) {
            $attributes['primary_speaker_character_id'] =
                $validated['primary_speaker_character_id'];
        }

        if (array_key_exists('primary_listener_character_id', $validated)) {
            $attributes['primary_listener_character_id'] =
                $validated['primary_listener_character_id'];
        }

        if (array_key_exists('scene_location', $validated)) {
            $attributes['scene_location'] = $this->nullableString($validated['scene_location']);
        }

        if (array_key_exists('narrative_phase', $validated)) {
            $attributes['narrative_phase'] = $this->nullableString($validated['narrative_phase']);
        }

        if (array_key_exists('teaching_mode', $validated)) {
            $attributes['teaching_mode'] = $this->nullableString($validated['teaching_mode']);
        }

        if (array_key_exists('difficulty_level', $validated)) {
            $attributes['difficulty_level'] = $this->nullableString($validated['difficulty_level']);
        }

        if (array_key_exists('memorization_priority', $validated)) {
            $attributes['memorization_priority'] = $validated['memorization_priority'] ?? 0;
        }

        if (array_key_exists('keywords', $validated)) {
            $attributes['keywords_json'] = $this->normalizeStringList($validated['keywords']);
        }

        if (array_key_exists('study_flags', $validated)) {
            $attributes['study_flags_json'] = $this->normalizeStringList($validated['study_flags']);
        }

        $verse->verseMeta()->updateOrCreate([], $attributes);

        return redirect()->back(status: 303);
    }

    /**
     * @param  list<string>  $values
     * @return list<string>|null
     */
    private function normalizeStringList(array $values): ?array
    {
        $normalized = collect($values)
            ->map(fn (mixed $value): ?string => is_string($value)
                ? $this->nullableString($value)
                : null)
            ->filter()
            ->values()
            ->all();

        return $normalized === [] ? null : $normalized;
    }

    private function nullableString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }
}
