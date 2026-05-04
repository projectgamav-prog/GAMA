<?php

namespace App\Admin\Conscious\Actions\Scripture;

use App\Admin\Conscious\Actions\ConsciousActionDefinition;
use App\Admin\Conscious\Actions\ConsciousActionHandler;
use App\Admin\Conscious\Policies\ConsciousProtectedIdentityPolicy;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\Verse;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

final class ProtectedIdentityAction implements ConsciousActionHandler
{
    public function __construct(
        private readonly ConsciousProtectedIdentityPolicy $policy,
    ) {}

    public function handle(
        Request $request,
        ConsciousActionDefinition $action,
        Model $entity,
    ): void {
        $this->policy->assertCanUpdate($action, $entity);

        $payload = $request->except(['_token']);
        $unexpectedKeys = array_diff(array_keys($payload), ['slug', 'number']);

        if ($unexpectedKeys !== []) {
            throw ValidationException::withMessages([
                'action' => 'Protected identity accepts only slug and number.',
            ]);
        }

        if (! array_key_exists('slug', $payload) && ! array_key_exists('number', $payload)) {
            throw ValidationException::withMessages([
                'action' => 'Provide slug or number to update protected identity.',
            ]);
        }

        $validated = Validator::make(
            $payload,
            $this->rules($entity),
            attributes: [
                'slug' => 'URL slug',
                'number' => 'Canonical number',
            ],
        )->validate();

        $updates = [];

        if (array_key_exists('slug', $validated)) {
            $updates['slug'] = trim($validated['slug']);
        }

        if (array_key_exists('number', $validated)) {
            $updates['number'] = $this->nullableString($validated['number']);
        }

        $entity->forceFill($updates)->save();
    }

    /**
     * @return array<string, list<mixed>>
     */
    private function rules(Model $entity): array
    {
        return [
            'slug' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                $this->slugUniqueRule($entity),
            ],
            'number' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }

    private function slugUniqueRule(Model $entity): mixed
    {
        if ($entity instanceof Book) {
            return Rule::unique('books', 'slug')->ignore($entity->getKey());
        }

        if ($entity instanceof BookSection) {
            return Rule::unique('book_sections', 'slug')
                ->where('book_id', $entity->book_id)
                ->ignore($entity->getKey());
        }

        if ($entity instanceof Chapter) {
            return Rule::unique('chapters', 'slug')
                ->where('book_section_id', $entity->book_section_id)
                ->ignore($entity->getKey());
        }

        if ($entity instanceof ChapterSection) {
            return Rule::unique('chapter_sections', 'slug')
                ->where('chapter_id', $entity->chapter_id)
                ->ignore($entity->getKey());
        }

        if ($entity instanceof Verse) {
            return Rule::unique('verses', 'slug')
                ->where('chapter_section_id', $entity->chapter_section_id)
                ->ignore($entity->getKey());
        }

        abort(422, 'Protected identity is not available for this entity.');
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
