<?php

namespace App\Support\Scripture;

use App\Models\Book;
use App\Models\BookCategory;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\Verse;
use App\Models\VerseCommentary;
use App\Models\VerseTranslation;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use JsonException;
use RuntimeException;

/**
 * Imports the locked scripture JSON corpus into the relational schema.
 *
 * This class owns JSON authoring contract validation, canonical hierarchy
 * upserts, and editorial child-record ordering while keeping the core
 * scripture tree deterministic.
 */
class ScriptureJsonImporter
{
    public const ROOT_MANIFEST_PATH = 'database/data/scripture/manifest.json';

    public const CATEGORIES_PATH = 'database/data/scripture/categories.json';

    public function import(?string $target = null, bool $dryRun = false): array
    {
        $rootManifest = $this->loadRootManifest();
        $categoryManifest = $this->loadCategoriesManifest();
        $resolvedTarget = $this->resolveTarget($target, $rootManifest);

        $summary = [
            'mode' => $resolvedTarget['mode'],
            'target' => $resolvedTarget['target'],
            'dry_run' => $dryRun,
            'schema_version' => (int) $rootManifest['schema_version'],
            'processed_books' => 0,
            'processed_files' => 0,
            'counts' => $this->emptyCountSummary(),
        ];

        if (! $dryRun) {
            $summary['changes'] = $this->emptyChangeSummary();
        }

        foreach ($resolvedTarget['books'] as $bookTarget) {
            $bookDefinition = $this->loadBookDefinition($bookTarget['entry']);
            $preparedImport = $this->prepareBookImport(
                $bookDefinition,
                $categoryManifest,
                $bookTarget['selected_files'],
            );

            $summary['processed_books']++;
            $summary['processed_files'] += $preparedImport['processed_files'];
            $summary['counts'] = $this->mergeNumericSummary(
                $summary['counts'],
                $preparedImport['counts'],
            );

            if ($dryRun) {
                continue;
            }

            $summary['changes'] = $this->mergeChangeSummary(
                $summary['changes'],
                $this->importBook($preparedImport),
            );
        }

        return $summary;
    }

    private function resolveTarget(?string $target, array $rootManifest): array
    {
        $entries = array_values($rootManifest['books']);

        if ($target === null) {
            $books = array_values(array_filter(
                $entries,
                fn (array $entry): bool => (bool) $entry['enabled'],
            ));

            if ($books === []) {
                throw new RuntimeException('Scripture corpus manifest does not contain any enabled books.');
            }

            return [
                'mode' => 'all-books',
                'target' => 'all',
                'books' => array_map(
                    fn (array $entry): array => [
                        'entry' => $entry,
                        'selected_files' => null,
                    ],
                    $books,
                ),
            ];
        }

        if ($this->looksLikeFile($target)) {
            $resolvedPath = $this->resolvePath($target);

            foreach ($entries as $entry) {
                $bookDefinition = $this->loadBookDefinition($entry);

                if (! $this->bookContainsChapterPath($bookDefinition, $resolvedPath)) {
                    continue;
                }

                return [
                    'mode' => 'one-file',
                    'target' => $resolvedPath,
                    'books' => [[
                        'entry' => $entry,
                        'selected_files' => [$resolvedPath => true],
                    ]],
                ];
            }

            throw new RuntimeException(sprintf(
                'Chapter dataset [%s] is not declared in the scripture corpus manifest.',
                $resolvedPath,
            ));
        }

        foreach ($entries as $entry) {
            if ($entry['slug'] !== $target) {
                continue;
            }

            return [
                'mode' => 'one-book',
                'target' => $target,
                'books' => [[
                    'entry' => $entry,
                    'selected_files' => null,
                ]],
            ];
        }

        throw new RuntimeException(sprintf(
            'Scripture book [%s] is not declared in the corpus manifest.',
            $target,
        ));
    }

    private function loadBookDefinition(array $entry): array
    {
        $rootDirectory = dirname($this->resolvePath(self::ROOT_MANIFEST_PATH));
        $manifestPath = $this->resolvePath($entry['path'], $rootDirectory);
        $manifest = $this->loadBookManifest($manifestPath);
        $manifestDirectory = dirname($manifestPath);

        if ($manifest['book']['slug'] !== $entry['slug']) {
            throw new RuntimeException(sprintf(
                'Book manifest [%s] slug [%s] does not match root manifest slug [%s].',
                $manifestPath,
                $manifest['book']['slug'],
                $entry['slug'],
            ));
        }

        $entryNumber = $entry['number'] ?? null;
        $manifestNumber = $manifest['book']['number'] ?? null;

        if (
            $entryNumber !== null
            && $manifestNumber !== null
            && $entryNumber !== $manifestNumber
        ) {
            throw new RuntimeException(sprintf(
                'Book manifest [%s] number [%s] does not match root manifest number [%s].',
                $manifestPath,
                $manifestNumber,
                $entryNumber,
            ));
        }

        return [
            'book' => [
                ...$manifest['book'],
                'number' => $manifestNumber ?? $entryNumber,
            ],
            'categories' => array_values($manifest['categories']),
            'sections' => array_map(
                fn (array $section): array => [
                    'record' => [
                        'slug' => $section['slug'],
                        'number' => $section['number'] ?? null,
                        'title' => $section['title'],
                    ],
                    'chapters' => $this->normalizeChapterReferences(
                        $section['chapters'],
                        $manifestDirectory,
                    ),
                ],
                $manifest['section'],
            ),
        ];
    }

    private function prepareBookImport(
        array $bookDefinition,
        array $categoriesManifest,
        ?array $selectedFiles,
    ): array {
        $categoryRecords = $this->resolveCategoryRecords(
            $categoriesManifest,
            $bookDefinition['categories'],
            $bookDefinition['book']['slug'],
        );

        $counts = $this->emptyCountSummary();
        $counts['books'] = 1;
        $counts['categories'] = count($categoryRecords);
        $counts['category_assignments'] = count($bookDefinition['categories']);

        $processedFiles = 0;
        $sections = [];

        foreach ($bookDefinition['sections'] as $sectionDefinition) {
            $chapters = [];

            foreach ($sectionDefinition['chapters'] as $chapterReference) {
                if ($selectedFiles !== null && ! array_key_exists($chapterReference['path'], $selectedFiles)) {
                    continue;
                }

                $payload = $this->loadChapterPayload($chapterReference['path']);

                if (
                    $chapterReference['slug'] !== null
                    && $chapterReference['slug'] !== $payload['chapter']['slug']
                ) {
                    throw new RuntimeException(sprintf(
                        'Chapter dataset [%s] slug [%s] does not match declared slug [%s].',
                        $chapterReference['path'],
                        $payload['chapter']['slug'],
                        $chapterReference['slug'],
                    ));
                }

                $chapters[] = [
                    'path' => $chapterReference['path'],
                    'payload' => $payload,
                ];

                $processedFiles++;
                $counts['chapters']++;
                $counts['chapter_sections'] += count($payload['chapter-section']);

                foreach ($payload['chapter-section'] as $chapterSection) {
                    $verses = $chapterSection['verses'];
                    $counts['verses'] += count($verses);
                    $counts['translations'] += $this->countNestedRecords($verses, 'translations');
                    $counts['commentaries'] += $this->countNestedRecords($verses, 'commentaries');
                }
            }

            if ($chapters === []) {
                continue;
            }

            $counts['book_sections']++;
            $sections[] = [
                'record' => $sectionDefinition['record'],
                'chapters' => $chapters,
            ];
        }

        if ($processedFiles === 0) {
            throw new RuntimeException(sprintf(
                'No chapter files were selected for book [%s].',
                $bookDefinition['book']['slug'],
            ));
        }

        return [
            'book' => $bookDefinition['book'],
            'categories' => $categoryRecords,
            'sections' => $sections,
            'processed_files' => $processedFiles,
            'counts' => $counts,
        ];
    }

    private function importBook(array $preparedImport): array
    {
        $changes = $this->emptyChangeSummary();

        DB::transaction(function () use ($preparedImport, &$changes): void {
            [$book, $state] = $this->upsert(
                Book::query(),
                ['slug' => $preparedImport['book']['slug']],
                $this->bookValues($preparedImport['book']),
            );
            $changes['books'][$state]++;

            $categoryIds = [];

            foreach ($preparedImport['categories'] as $record) {
                [$category, $state] = $this->upsert(
                    BookCategory::query(),
                    ['slug' => $record['slug']],
                    $this->categoryValues($record),
                );
                $changes['categories'][$state]++;
                $categoryIds[] = (int) $category->getKey();
            }

            $this->syncBookCategories($book, $categoryIds, $changes);

            foreach ($preparedImport['sections'] as $sectionImport) {
                [$bookSection, $state] = $this->upsert(
                    BookSection::query(),
                    [
                        'book_id' => $book->getKey(),
                        'slug' => $sectionImport['record']['slug'],
                    ],
                    $this->bookSectionValues($book->getKey(), $sectionImport['record']),
                );
                $changes['book_sections'][$state]++;

                foreach ($sectionImport['chapters'] as $chapterImport) {
                    $this->importChapterFile($bookSection, $chapterImport['payload'], $changes);
                }
            }
        });

        return $changes;
    }

    private function importChapterFile(BookSection $bookSection, array $payload, array &$changes): void
    {
        [$chapter, $state] = $this->upsert(
            Chapter::query(),
            [
                'book_section_id' => $bookSection->getKey(),
                'slug' => $payload['chapter']['slug'],
            ],
            $this->chapterValues($bookSection->getKey(), $payload['chapter']),
        );
        $changes['chapters'][$state]++;

        foreach ($payload['chapter-section'] as $chapterSectionRecord) {
            [$chapterSection, $state] = $this->upsert(
                ChapterSection::query(),
                [
                    'chapter_id' => $chapter->getKey(),
                    'slug' => $chapterSectionRecord['slug'],
                ],
                $this->chapterSectionValues($chapter->getKey(), $chapterSectionRecord),
            );
            $changes['chapter_sections'][$state]++;

            foreach ($chapterSectionRecord['verses'] as $verseRecord) {
                [$verse, $state] = $this->upsert(
                    Verse::query(),
                    [
                        'chapter_section_id' => $chapterSection->getKey(),
                        'slug' => $verseRecord['slug'],
                    ],
                    $this->verseValues($chapterSection->getKey(), $verseRecord),
                );
                $changes['verses'][$state]++;

                foreach ($verseRecord['translations'] ?? [] as $translationIndex => $translationRecord) {
                    [, $state] = $this->upsert(
                        VerseTranslation::query(),
                        [
                            'verse_id' => $verse->getKey(),
                            'language_code' => $translationRecord['language_code'],
                            'source_key' => $translationRecord['source_key'],
                        ],
                        $this->translationValues($verse->getKey(), $translationRecord, $translationIndex),
                    );
                    $changes['translations'][$state]++;
                }

                foreach ($verseRecord['commentaries'] ?? [] as $commentaryIndex => $commentaryRecord) {
                    [, $state] = $this->upsert(
                        VerseCommentary::query(),
                        [
                            'verse_id' => $verse->getKey(),
                            'language_code' => $commentaryRecord['language_code'],
                            'source_key' => $commentaryRecord['source_key'],
                        ],
                        $this->commentaryValues($verse->getKey(), $commentaryRecord, $commentaryIndex),
                    );
                    $changes['commentaries'][$state]++;
                }
            }
        }
    }

    private function loadRootManifest(): array
    {
        $payload = $this->loadJson($this->resolvePath(self::ROOT_MANIFEST_PATH));

        $this->validate(
            $payload,
            [
                'schema_version' => ['required', 'integer'],
                'books' => ['required', 'array', 'min:1'],
                'books.*.slug' => ['required', 'string'],
                'books.*.number' => ['nullable', 'string'],
                'books.*.path' => ['required', 'string'],
                'books.*.enabled' => ['required', 'boolean'],
            ],
            'Invalid scripture corpus manifest',
        );

        $this->assertSchemaVersion($payload['schema_version'], 'scripture corpus manifest');
        $this->assertUniqueStrings(
            array_map(fn (array $book): string => $book['slug'], $payload['books']),
            'scripture corpus book slugs',
        );

        return $payload;
    }

    private function loadCategoriesManifest(): array
    {
        $payload = $this->loadJson($this->resolvePath(self::CATEGORIES_PATH));

        $this->validate(
            $payload,
            [
                'schema_version' => ['required', 'integer'],
                'categories' => ['required', 'array', 'min:1'],
                'categories.*.slug' => ['required', 'string'],
                'categories.*.name' => ['required', 'string'],
                'categories.*.description' => ['nullable', 'string'],
                'categories.*.sort_order' => ['nullable', 'integer'],
            ],
            'Invalid scripture categories manifest',
        );

        $this->assertSchemaVersion($payload['schema_version'], 'scripture categories manifest');
        $this->assertUniqueStrings(
            array_map(fn (array $category): string => $category['slug'], $payload['categories']),
            'scripture category slugs',
        );

        return $payload;
    }

    private function loadBookManifest(string $path): array
    {
        $payload = $this->loadJson($path);

        $this->validate(
            $payload,
            [
                'schema_version' => ['required', 'integer'],
                'book' => ['required', 'array'],
                'book.slug' => ['required', 'string'],
                'book.number' => ['nullable', 'string'],
                'book.title' => ['required', 'string'],
                'book.description' => ['nullable', 'string'],
                'categories' => ['required', 'array'],
                'categories.*' => ['required', 'string'],
                'section' => ['required', 'array', 'min:1'],
                'section.*.slug' => ['required', 'string'],
                'section.*.number' => ['nullable', 'string'],
                'section.*.title' => ['required', 'string'],
                'section.*.chapters' => ['required', 'array', 'min:1'],
                'section.*.chapters.*.path' => ['required', 'string'],
            ],
            'Invalid scripture book manifest',
        );

        $this->assertSchemaVersion($payload['schema_version'], 'scripture book manifest');
        $this->assertUniqueStrings($payload['categories'], sprintf('book manifest [%s] categories', $path));
        $this->assertUniqueStrings(
            array_map(fn (array $section): string => $section['slug'], $payload['section']),
            sprintf('book manifest [%s] section slugs', $path),
        );

        return $payload;
    }

    private function loadChapterPayload(string $path): array
    {
        $payload = $this->loadJson($path);

        $this->validate(
            $payload,
            array_merge(
                [
                    'schema_version' => ['required', 'integer'],
                    'chapter' => ['required', 'array'],
                    'chapter.slug' => ['required', 'string'],
                    'chapter.number' => ['nullable', 'string'],
                    'chapter.title' => ['nullable', 'string'],
                    'chapter-section' => ['required', 'array', 'min:1'],
                    'chapter-section.*.slug' => ['required', 'string'],
                    'chapter-section.*.number' => ['nullable', 'string'],
                    'chapter-section.*.title' => ['required', 'string'],
                    'chapter-section.*.verses' => ['required', 'array', 'min:1'],
                ],
                $this->verseRules('chapter-section.*.verses.*.'),
            ),
            'Invalid scripture chapter dataset',
        );

        $this->assertSchemaVersion($payload['schema_version'], 'scripture chapter dataset');
        $this->assertUniqueStrings(
            array_map(fn (array $section): string => $section['slug'], $payload['chapter-section']),
            sprintf('chapter dataset [%s] chapter-section slugs', $path),
        );
        $this->assertUniqueVerseSlugsWithinChapterSections($payload['chapter-section'], $path);
        $this->assertUniqueVerseNumbersWithinChapterSections($payload['chapter-section'], $path);

        return $payload;
    }

    private function verseRules(string $prefix): array
    {
        return [
            $prefix.'slug' => ['required', 'string'],
            $prefix.'number' => ['nullable', 'string'],
            $prefix.'text' => ['required', 'string'],
            $prefix.'translations' => ['sometimes', 'array'],
            $prefix.'translations.*.source_key' => ['required', 'string'],
            $prefix.'translations.*.source_name' => ['required', 'string'],
            $prefix.'translations.*.language_code' => ['required', 'string'],
            $prefix.'translations.*.text' => ['required', 'string'],
            $prefix.'translations.*.sort_order' => ['nullable', 'integer'],
            $prefix.'commentaries' => ['sometimes', 'array'],
            $prefix.'commentaries.*.source_key' => ['required', 'string'],
            $prefix.'commentaries.*.source_name' => ['required', 'string'],
            $prefix.'commentaries.*.language_code' => ['required', 'string'],
            $prefix.'commentaries.*.body' => ['required', 'string'],
            $prefix.'commentaries.*.author_name' => ['nullable', 'string'],
            $prefix.'commentaries.*.title' => ['nullable', 'string'],
            $prefix.'commentaries.*.sort_order' => ['nullable', 'integer'],
        ];
    }

    private function validate(array $payload, array $rules, string $message): void
    {
        $validator = Validator::make($payload, $rules);

        if ($validator->fails()) {
            throw new RuntimeException($message.":\n".implode(PHP_EOL, $validator->errors()->all()));
        }
    }

    private function assertSchemaVersion(int $version, string $label): void
    {
        if ($version === 1) {
            return;
        }

        throw new RuntimeException(sprintf('Unsupported %s schema version [%s].', $label, $version));
    }

    private function resolveCategoryRecords(array $categoryManifest, array $categorySlugs, string $bookSlug): array
    {
        $recordsBySlug = [];

        foreach ($categoryManifest['categories'] as $record) {
            $recordsBySlug[$record['slug']] = $record;
        }

        $records = [];

        foreach ($categorySlugs as $slug) {
            if (! array_key_exists($slug, $recordsBySlug)) {
                throw new RuntimeException(sprintf(
                    'Book [%s] references unknown category slug [%s].',
                    $bookSlug,
                    $slug,
                ));
            }

            $records[] = $recordsBySlug[$slug];
        }

        return $records;
    }

    private function bookContainsChapterPath(array $bookDefinition, string $path): bool
    {
        foreach ($bookDefinition['sections'] as $sectionDefinition) {
            foreach ($sectionDefinition['chapters'] as $chapterReference) {
                if ($chapterReference['path'] === $path) {
                    return true;
                }
            }
        }

        return false;
    }

    private function normalizeChapterReferences(array $references, string $baseDirectory): array
    {
        $normalized = [];
        $paths = [];

        foreach ($references as $reference) {
            $path = $this->resolvePath($reference['path'], $baseDirectory);

            if (in_array($path, $paths, true)) {
                throw new RuntimeException(sprintf(
                    'Chapter dataset [%s] is declared more than once in the same manifest.',
                    $path,
                ));
            }

            $normalized[] = [
                'path' => $path,
                'slug' => $reference['slug'] ?? null,
            ];
            $paths[] = $path;
        }

        return $normalized;
    }

    private function loadJson(string $path): array
    {
        $contents = file_get_contents($path);

        if ($contents === false) {
            throw new RuntimeException(sprintf('Unable to read JSON dataset [%s].', $path));
        }

        if (str_starts_with($contents, "\xEF\xBB\xBF")) {
            $contents = substr($contents, 3);
        }

        try {
            $payload = json_decode($contents, true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException $jsonException) {
            throw new RuntimeException(
                sprintf('Invalid UTF-8 JSON dataset [%s]: %s', $path, $jsonException->getMessage()),
                previous: $jsonException,
            );
        }

        if (! is_array($payload)) {
            throw new RuntimeException(sprintf('JSON dataset [%s] must decode to a JSON object.', $path));
        }

        return $payload;
    }

    private function looksLikeFile(string $target): bool
    {
        return is_file($target)
            || is_file(base_path($target))
            || str_ends_with(strtolower($target), '.json')
            || str_contains($target, '/')
            || str_contains($target, '\\');
    }

    private function resolvePath(string $path, ?string $baseDirectory = null): string
    {
        $candidate = is_file($path)
            ? $path
            : ($baseDirectory !== null ? $baseDirectory.DIRECTORY_SEPARATOR.$path : base_path($path));

        if (! is_file($candidate)) {
            throw new RuntimeException(sprintf('Scripture dataset [%s] was not found.', $path));
        }

        return realpath($candidate) ?: $candidate;
    }

    private function assertUniqueStrings(array $values, string $label): void
    {
        if (count($values) === count(array_unique($values))) {
            return;
        }

        throw new RuntimeException(sprintf('Duplicate values are not allowed in %s.', $label));
    }

    private function assertUniqueVerseSlugsWithinChapterSections(array $sections, string $path): void
    {
        foreach ($sections as $section) {
            $duplicates = $this->duplicateValues(
                array_map(
                    fn (array $verse): string => $verse['slug'],
                    $section['verses'] ?? [],
                ),
            );

            if ($duplicates === []) {
                continue;
            }

            throw new RuntimeException(sprintf(
                'Duplicate verse slugs are not allowed in chapter dataset [%s] chapter-section [%s]: %s.',
                $path,
                $section['slug'],
                implode(', ', array_map(
                    fn (string $value): string => sprintf('[%s]', $value),
                    $duplicates,
                )),
            ));
        }
    }

    private function assertUniqueVerseNumbersWithinChapterSections(array $sections, string $path): void
    {
        foreach ($sections as $section) {
            $duplicates = $this->duplicateValues(array_values(array_filter(
                array_map(
                    fn (array $verse): ?string => $verse['number'] ?? null,
                    $section['verses'] ?? [],
                ),
                fn (?string $value): bool => $value !== null,
            )));

            if ($duplicates === []) {
                continue;
            }

            throw new RuntimeException(sprintf(
                'Duplicate verse numbers are not allowed in chapter dataset [%s] chapter-section [%s]: %s.',
                $path,
                $section['slug'],
                implode(', ', array_map(
                    fn (string $value): string => sprintf('[%s]', $value),
                    $duplicates,
                )),
            ));
        }
    }

    /**
     * @param  list<string>  $values
     * @return list<string>
     */
    private function duplicateValues(array $values): array
    {
        $counts = [];

        foreach ($values as $value) {
            $counts[$value] = ($counts[$value] ?? 0) + 1;
        }

        return array_values(array_keys(array_filter(
            $counts,
            fn (int $count): bool => $count > 1,
        )));
    }

    private function syncBookCategories(Book $book, array $categoryIds, array &$changes): void
    {
        $targetIds = array_values(array_unique($categoryIds));
        sort($targetIds);

        $currentIds = $book->categories()
            ->pluck('book_categories.id')
            ->map(fn ($id): int => (int) $id)
            ->sort()
            ->values()
            ->all();

        $book->categories()->sync($targetIds);

        $changes['category_assignments']['attached'] += count(array_diff($targetIds, $currentIds));
        $changes['category_assignments']['detached'] += count(array_diff($currentIds, $targetIds));
        $changes['category_assignments']['unchanged'] += count(array_intersect($currentIds, $targetIds));
    }

    private function bookValues(array $record): array
    {
        return [
            'slug' => $record['slug'],
            'number' => $record['number'] ?? null,
            'title' => $record['title'],
            'description' => $record['description'] ?? null,
        ];
    }

    private function categoryValues(array $record): array
    {
        return [
            'slug' => $record['slug'],
            'name' => $record['name'],
            'description' => $record['description'] ?? null,
            'sort_order' => $record['sort_order'] ?? 0,
        ];
    }

    private function bookSectionValues(int $bookId, array $record): array
    {
        return [
            'book_id' => $bookId,
            'slug' => $record['slug'],
            'number' => $record['number'] ?? null,
            'title' => $record['title'] ?? null,
        ];
    }

    private function chapterValues(int $bookSectionId, array $record): array
    {
        return [
            'book_section_id' => $bookSectionId,
            'slug' => $record['slug'],
            'number' => $record['number'] ?? null,
            'title' => $record['title'] ?? null,
        ];
    }

    private function chapterSectionValues(int $chapterId, array $record): array
    {
        return [
            'chapter_id' => $chapterId,
            'slug' => $record['slug'],
            'number' => $record['number'] ?? null,
            'title' => $record['title'],
        ];
    }

    private function verseValues(int $chapterSectionId, array $record): array
    {
        return [
            'chapter_section_id' => $chapterSectionId,
            'slug' => $record['slug'],
            'number' => $record['number'] ?? null,
            'text' => $record['text'],
        ];
    }

    private function translationValues(int $verseId, array $record, int $index): array
    {
        return [
            'verse_id' => $verseId,
            'source_key' => $record['source_key'],
            'source_name' => $record['source_name'],
            'language_code' => $record['language_code'],
            'text' => $record['text'],
            'sort_order' => $record['sort_order'] ?? ($index + 1),
        ];
    }

    private function commentaryValues(int $verseId, array $record, int $index): array
    {
        return [
            'verse_id' => $verseId,
            'source_key' => $record['source_key'],
            'source_name' => $record['source_name'],
            'author_name' => $record['author_name'] ?? null,
            'language_code' => $record['language_code'],
            'title' => $record['title'] ?? null,
            'body' => $record['body'],
            'sort_order' => $record['sort_order'] ?? ($index + 1),
        ];
    }

    private function upsert(Builder $builder, array $identity, array $values): array
    {
        $model = $builder->firstOrNew($identity);
        $exists = $model->exists;

        $model->fill($values);

        if (! $exists) {
            try {
                $model->save();
            } catch (QueryException $queryException) {
                if (! $this->isUniqueConstraintViolation($queryException)) {
                    throw $queryException;
                }

                $persistedModel = (clone $builder)->where($identity)->first();

                if (! $persistedModel instanceof Model) {
                    throw $queryException;
                }

                $persistedModel->fill($values);

                if (! $persistedModel->isDirty()) {
                    return [$persistedModel, 'unchanged'];
                }

                $persistedModel->save();

                return [$persistedModel, 'updated'];
            }

            return [$model, 'created'];
        }

        if (! $model->isDirty()) {
            return [$model, 'unchanged'];
        }

        $model->save();

        return [$model, 'updated'];
    }

    private function isUniqueConstraintViolation(QueryException $queryException): bool
    {
        $sqlState = $queryException->errorInfo[0] ?? null;
        $driverCode = $queryException->errorInfo[1] ?? null;

        return $sqlState === '23000' && $driverCode === 1062;
    }

    private function countNestedRecords(array $verses, string $key): int
    {
        $count = 0;

        foreach ($verses as $verse) {
            $count += count($verse[$key] ?? []);
        }

        return $count;
    }

    private function emptyCountSummary(): array
    {
        return [
            'categories' => 0,
            'category_assignments' => 0,
            'books' => 0,
            'book_sections' => 0,
            'chapters' => 0,
            'chapter_sections' => 0,
            'verses' => 0,
            'translations' => 0,
            'commentaries' => 0,
        ];
    }

    private function emptyChangeSummary(): array
    {
        $upsertStates = [
            'created' => 0,
            'updated' => 0,
            'unchanged' => 0,
        ];

        return [
            'categories' => $upsertStates,
            'category_assignments' => [
                'attached' => 0,
                'detached' => 0,
                'unchanged' => 0,
            ],
            'books' => $upsertStates,
            'book_sections' => $upsertStates,
            'chapters' => $upsertStates,
            'chapter_sections' => $upsertStates,
            'verses' => $upsertStates,
            'translations' => $upsertStates,
            'commentaries' => $upsertStates,
        ];
    }

    private function mergeNumericSummary(array $left, array $right): array
    {
        foreach ($right as $key => $value) {
            $left[$key] = ($left[$key] ?? 0) + $value;
        }

        return $left;
    }

    private function mergeChangeSummary(array $left, array $right): array
    {
        foreach ($right as $type => $states) {
            foreach ($states as $state => $count) {
                $left[$type][$state] = ($left[$type][$state] ?? 0) + $count;
            }
        }

        return $left;
    }
}
