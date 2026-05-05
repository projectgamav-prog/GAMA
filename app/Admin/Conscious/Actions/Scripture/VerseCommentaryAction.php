<?php

namespace App\Admin\Conscious\Actions\Scripture;

use App\Admin\Conscious\Actions\ConsciousActionDefinition;
use App\Admin\Conscious\Actions\ConsciousActionHandler;
use App\Admin\Conscious\Policies\ConsciousVerseSupportPolicy;
use App\Models\Verse;
use App\Models\VerseCommentary;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

final class VerseCommentaryAction implements ConsciousActionHandler
{
    public function __construct(
        private readonly ConsciousVerseSupportPolicy $policy,
    ) {}

    public function handle(Request $request, ConsciousActionDefinition $action, Model $entity): void
    {
        $this->policy->assertVerseOwner($entity);
        abort_unless($entity instanceof Verse, 422);

        match ($action->actionKey) {
            'verse_support.commentary.create' => $this->create($request, $entity),
            'verse_support.commentary.update' => $this->update($request, $entity),
            'verse_support.commentary.delete' => $this->delete($request, $entity),
            default => abort(422, 'This commentary action is not implemented.'),
        };
    }

    private function create(Request $request, Verse $verse): void
    {
        $validated = Validator::make($request->all(), $this->rules($verse))->validate();
        $verse->commentaries()->create($this->attributes($validated));
    }

    private function update(Request $request, Verse $verse): void
    {
        $base = Validator::make($request->all(), ['commentary_id' => ['required', 'integer']])->validate();
        $commentary = VerseCommentary::query()->findOrFail((int) $base['commentary_id']);
        $this->policy->assertCommentaryOwnedBy($verse, $commentary);

        $validated = Validator::make($request->all(), [
            'commentary_id' => ['required', 'integer'],
            ...$this->rules($verse, $commentary),
        ])->validate();

        unset($validated['commentary_id']);
        $commentary->forceFill($this->attributes($validated))->save();
    }

    private function delete(Request $request, Verse $verse): void
    {
        $validated = Validator::make($request->all(), ['commentary_id' => ['required', 'integer']])->validate();
        $commentary = VerseCommentary::query()->findOrFail((int) $validated['commentary_id']);
        $this->policy->assertCommentaryOwnedBy($verse, $commentary);
        $commentary->delete();
    }

    /**
     * @return array<string, list<mixed>>
     */
    private function rules(Verse $verse, ?VerseCommentary $commentary = null): array
    {
        return [
            'source_key' => [
                'required',
                'string',
                'max:255',
                Rule::unique('verse_commentaries', 'source_key')
                    ->where(fn ($query) => $query
                        ->where('verse_id', $verse->getKey())
                        ->where('language_code', request()->input('language_code')))
                    ->ignore($commentary?->getKey()),
            ],
            'source_name' => ['required', 'string', 'max:255'],
            'commentary_source_id' => ['nullable', 'integer', 'exists:commentary_sources,id'],
            'author_name' => ['nullable', 'string', 'max:255'],
            'language_code' => ['required', 'string', 'max:16'],
            'title' => ['nullable', 'string', 'max:255'],
            'body' => ['required', 'string'],
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
            'commentary_source_id' => $validated['commentary_source_id'] ?? null,
            'author_name' => $this->nullableString($validated['author_name'] ?? null),
            'language_code' => trim((string) $validated['language_code']),
            'title' => $this->nullableString($validated['title'] ?? null),
            'body' => trim((string) $validated['body']),
            'sort_order' => $validated['sort_order'],
        ];
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
