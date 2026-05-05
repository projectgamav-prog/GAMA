<?php

namespace App\Admin\Conscious\Actions\Scripture;

use App\Admin\Conscious\Actions\ConsciousActionDefinition;
use App\Admin\Conscious\Actions\ConsciousActionHandler;
use App\Admin\Conscious\Policies\ConsciousCanonicalHierarchyPolicy;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

final class CanonicalCreateAction implements ConsciousActionHandler
{
    public function __construct(
        private readonly ConsciousCanonicalHierarchyPolicy $policy,
    ) {}

    public function handle(Request $request, ConsciousActionDefinition $action, Model $entity): ?RedirectResponse
    {
        $this->policy->assertCanCreate($action->actionKey, $entity);

        match ($action->actionKey) {
            'canonical.create_book' => $this->createBook($request),
            'canonical.create_book_section' => $this->createBookSection($request, $entity),
            'canonical.create_chapter' => $this->createChapter($request, $entity),
            'canonical.create_chapter_section' => $this->createChapterSection($request, $entity),
            'canonical.create_verse' => $this->createVerse($request, $entity),
            default => abort(422, 'This canonical create action is not implemented.'),
        };

        return null;
    }

    private function createBook(Request $request): void
    {
        $validated = Validator::make($request->all(), [
            'slug' => ['required', 'string', 'max:255', Rule::unique('books', 'slug')],
            'number' => ['nullable', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            ...$this->blockedParentPayloadRules(),
        ])->validate();

        Book::query()->create([
            'slug' => trim((string) $validated['slug']),
            'number' => $this->nullableString($validated['number'] ?? null),
            'title' => trim((string) $validated['title']),
        ]);
    }

    private function createBookSection(Request $request, Model $book): void
    {
        abort_unless($book instanceof Book, 422);

        $validated = Validator::make($request->all(), [
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('book_sections', 'slug')
                    ->where('book_id', $book->getKey()),
            ],
            'number' => ['nullable', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            ...$this->blockedParentPayloadRules(),
        ])->validate();

        $book->bookSections()->create([
            'slug' => trim((string) $validated['slug']),
            'number' => $this->nullableString($validated['number'] ?? null),
            'title' => $this->nullableString($validated['title'] ?? null),
        ]);
    }

    private function createChapter(Request $request, Model $bookSection): void
    {
        abort_unless($bookSection instanceof BookSection, 422);

        $validated = Validator::make($request->all(), [
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('chapters', 'slug')
                    ->where('book_section_id', $bookSection->getKey()),
            ],
            'number' => ['nullable', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            ...$this->blockedParentPayloadRules(),
        ])->validate();

        $bookSection->chapters()->create([
            'slug' => trim((string) $validated['slug']),
            'number' => $this->nullableString($validated['number'] ?? null),
            'title' => $this->nullableString($validated['title'] ?? null),
        ]);
    }

    private function createChapterSection(Request $request, Model $chapter): void
    {
        abort_unless($chapter instanceof Chapter, 422);

        $validated = Validator::make($request->all(), [
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('chapter_sections', 'slug')
                    ->where('chapter_id', $chapter->getKey()),
            ],
            'number' => ['nullable', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            ...$this->blockedParentPayloadRules(),
        ])->validate();

        $chapter->chapterSections()->create([
            'slug' => trim((string) $validated['slug']),
            'number' => $this->nullableString($validated['number'] ?? null),
            'title' => $this->nullableString($validated['title'] ?? null),
        ]);
    }

    private function createVerse(Request $request, Model $chapterSection): void
    {
        abort_unless($chapterSection instanceof ChapterSection, 422);

        $validated = Validator::make($request->all(), [
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('verses', 'slug')
                    ->where('chapter_section_id', $chapterSection->getKey()),
            ],
            'number' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('verses', 'number')
                    ->where('chapter_section_id', $chapterSection->getKey()),
            ],
            'text' => ['required', 'string'],
            ...$this->blockedParentPayloadRules(),
        ])->validate();

        $chapterSection->verses()->create([
            'slug' => trim((string) $validated['slug']),
            'number' => $this->nullableString($validated['number'] ?? null),
            'text' => trim((string) $validated['text']),
        ]);
    }

    /**
     * @return array<string, list<string>>
     */
    private function blockedParentPayloadRules(): array
    {
        return [
            'book_id' => ['prohibited'],
            'book_section_id' => ['prohibited'],
            'chapter_id' => ['prohibited'],
            'chapter_section_id' => ['prohibited'],
            'parent_type' => ['prohibited'],
            'parent_id' => ['prohibited'],
            'owner_type' => ['prohibited'],
            'owner_id' => ['prohibited'],
            'schema_family' => ['prohibited'],
            'entity_type' => ['prohibited'],
            'entity_id' => ['prohibited'],
        ];
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
