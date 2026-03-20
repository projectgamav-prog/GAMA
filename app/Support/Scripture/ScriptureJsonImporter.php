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

class ScriptureJsonImporter
{
    public const ROOT_MANIFEST_PATH = 'database/data/scripture/manifest.json';

    public const CATEGORIES_PATH = 'database/data/scripture/categories.json';

    /**
     * Import scripture JSON data into the canonical scripture tables.
     *
     * @return array<string, mixed>
     */
    public function import(?string $target = null, bool $dryRun = false): array
    {
        $rootManifest = $this->loadRootManifest();
        $categoriesManifest = $this->loadCategoriesManifest();
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
                $categoriesManifest,
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

    /**
     * @param  array<string, mixed>  $rootManifest
     * @return array{
     *     mode: string,
     *     target: string,
     *     books: list<array{
     *         entry: array<string, mixed>,
     *         selected_files: array<string, bool>|null
     *     }>
     * }
     */
    private function resolveTarget(?string $target, array $rootManifest): array
    {
        $entries = array_values($rootManifest['books']);

        if ($target === null) {
            $enabledEntries = array_values(array_filter(
                $entries,
                fn (array $entry): bool => (bool) $entry['enabled'],
            ));

            if ($enabledEntries === []) {
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
                    $enabledEntries,
                ),
            ];
        }

        if ($this->looksLikeFile($target)) {
            $resolvedPath = $this->resolvePath($target);

            foreach ($entries as $entry) {
                $bookDefinition = $this->loadBookDefinition($entry);
                $matchingPath = $this->findMatchingChapterPath($bookDefinition, $resolvedPath);

                if ($matchingPath === null) {
                    continue;
                }

                return [
                    'mode' => 'one-file',
                    'target' => $resolvedPath,
                    'books' => [[
                        'entry' => $entry,
                        'selected_files' => [$matchingPath => true],
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

    /**
     * @param  array<string, mixed>  $rootEntry
     * @return array<string, mixed>
     */
    private function loadBookDefinition(array $rootEntry): array
    {
        $rootDirectory = dirname($this->resolvePath(self::ROOT_MANIFEST_PATH));
        $manifestPath = $this->resolvePath($rootEntry['path'], $rootDirectory);
        $manifest = $this->loadBookManifest($manifestPath);

        if ($manifest['book']['slug'] !== $rootEntry['slug']) {
            throw new RuntimeException(sprintf(
                'Book manifest [%s] slug [%s] does not match root manifest slug [%s].',
                $manifestPath,
                $manifest['book']['slug'],
                $rootEntry['slug'],
            ));
        }

        $manifestDirectory = dirname($manifestPath);
        $sections = [];

        if ((bool) $manifest['structure']['has_book_sections']) {
            foreach ($manifest['sections'] as $sectionReference) {
                $sectionManifestPath = $this->resolvePath($sectionReference['path'], $manifestDirectory);
                $sectionManifest = $this->loadSectionManifest($sectionManifestPath);

                if (
                    array_key_exists('slug', $sectionReference)
                    && $sectionReference['slug'] !== null
                    && $sectionReference['slug'] !== $sectionManifest['section']['slug']
                ) {
                    throw new RuntimeException(sprintf(
                        'Section manifest [%s] slug [%s] does not match declared slug [%s].',
                        $sectionManifestPath,
                        $sectionManifest['section']['slug'],
                        $sectionReference['slug'],
                    ));
                }

                $sections[] = [
                    'record' => $sectionManifest['section'],
                    'chapters' => $this->normalizeChapterReferences(
                        $sectionManifest['chapters'],
                        dirname($sectionManifestPath),
                    ),
                ];
            }
        } else {
            $sections[] = [
                'record' => $this->defaultBookSection($manifest),
                'chapters' => $this->normalizeChapterReferences(
                    $manifest['chapters'],
                    $manifestDirectory,
                ),
            ];
        }

        return [
            'book' => $manifest['book'],
            'defaults' => $manifest['defaults'] ?? [],
            'category_slugs' => array_values($manifest['category_slugs']),
            'sections' => $sections,
        ];
    }

    /**
     * @param  array<string, mixed>  $bookDefinition
     * @param  array<string, mixed>  $categoriesManifest
     * @param  array<string, bool>|null  $selectedFiles
     * @return array<string, mixed>
     */
    private function prepareBookImport(
        array $bookDefinition,
        array $categoriesManifest,
        ?array $selectedFiles,
    ): array {
        $categoryRecords = $this->resolveCategoryRecords(
            $categoriesManifest,
            $bookDefinition['category_slugs'],
            $bookDefinition['book']['slug'],
        );

        $preparedSections = [];
        $counts = $this->emptyCountSummary();
        $counts['books'] = 1;
        $counts['categories'] = count($categoryRecords);
        $counts['category_assignments'] = count($bookDefinition['category_slugs']);
        $processedFiles = 0;

        foreach ($bookDefinition['sections'] as $sectionDefinition) {
            $preparedChapters = [];

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

                $preparedChapters[] = [
                    'path' => $chapterReference['path'],
                    'payload' => $payload,
                ];

                $processedFiles++;
                $counts['chapters']++;

                $chapterSectionRecords = $payload['chapter_sections'] ?? [
                    array_merge(
                        $this->defaultChapterSection($bookDefinition),
                        ['verses' => $payload['verses']],
                    ),
                ];

                $counts['chapter_sections'] += count($chapterSectionRecords);

                foreach ($chapterSectionRecords as $chapterSectionRecord) {
                    $verses = $chapterSectionRecord['verses'];
                    $counts['verses'] += count($verses);
                    $counts['translations'] += $this->countNestedRecords($verses, 'translations');
                    $counts['commentaries'] += $this->countNestedRecords($verses, 'commentaries');
                }
            }

            if ($preparedChapters === []) {
                continue;
            }

            $counts['book_sections']++;
            $preparedSections[] = [
                'record' => $sectionDefinition['record'],
                'chapters' => $preparedChapters,
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
            'defaults' => $bookDefinition['defaults'],
            'category_records' => $categoryRecords,
            'category_slugs' => $bookDefinition['category_slugs'],
            'sections' => $preparedSections,
            'processed_files' => $processedFiles,
            'counts' => $counts,
        ];
    }

    /**
     * @param  array<string, mixed>  $preparedImport
     * @return array<string, array<string, int>>
     */
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

            foreach ($preparedImport['category_records'] as $categoryRecord) {
                [$category, $state] = $this->upsert(
                    BookCategory::query(),
                    ['slug' => $categoryRecord['slug']],
                    $this->categoryValues($categoryRecord),
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
                    $this->importChapterFile(
                        $bookSection,
                        $chapterImport['payload'],
                        $preparedImport['defaults'] ?? [],
                        $changes,
                    );
                }
            }
        });

        return $changes;
    }

    /**
     * @param  array<string, mixed>  $defaults
     * @param  array<string, array<string, int>>  $changes
     */
    private function importChapterFile(
        BookSection $bookSection,
        array $payload,
        array $defaults,
        array &$changes,
    ): void {
        [$chapter, $state] = $this->upsert(
            Chapter::query(),
            [
                'book_section_id' => $bookSection->getKey(),
                'slug' => $payload['chapter']['slug'],
            ],
            $this->chapterValues($bookSection->getKey(), $payload['chapter']),
        );
        $changes['chapters'][$state]++;

        $chapterSectionRecords = $payload['chapter_sections'] ?? [
            array_merge(
                $this->defaultChapterSection(['defaults' => $defaults]),
                ['verses' => $payload['verses']],
            ),
        ];

        foreach ($chapterSectionRecords as $sectionIndex => $chapterSectionRecord) {
            [$chapterSection, $state] = $this->upsert(
                ChapterSection::query(),
                [
                    'chapter_id' => $chapter->getKey(),
                    'slug' => $chapterSectionRecord['slug'],
                ],
                $this->chapterSectionValues(
                    $chapter->getKey(),
                    $chapterSectionRecord,
                    $sectionIndex,
                ),
            );
            $changes['chapter_sections'][$state]++;

            foreach ($chapterSectionRecord['verses'] as $verseIndex => $verseRecord) {
                [$verse, $state] = $this->upsert(
                    Verse::query(),
                    [
                        'chapter_section_id' => $chapterSection->getKey(),
                        'slug' => $verseRecord['slug'],
                    ],
                    $this->verseValues($chapterSection->getKey(), $verseRecord, $verseIndex),
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

    /**
     * @param  array<string, mixed>  $categoriesManifest
     * @param  list<string>  $categorySlugs
     * @return list<array<string, mixed>>
     */
    private function resolveCategoryRecords(
        array $categoriesManifest,
        array $categorySlugs,
        string $bookSlug,
    ): array {
        $recordsBySlug = [];

        foreach ($categoriesManifest['categories'] as $record) {
            $recordsBySlug[$record['slug']] = $record;
        }

        $records = [];

        foreach ($categorySlugs as $categorySlug) {
            if (! array_key_exists($categorySlug, $recordsBySlug)) {
                throw new RuntimeException(sprintf(
                    'Book [%s] references unknown category slug [%s].',
                    $bookSlug,
                    $categorySlug,
                ));
            }

            $records[] = $recordsBySlug[$categorySlug];
        }

        return $records;
    }

    /**
     * @param  list<int>  $categoryIds
     * @param  array<string, array<string, int>>  $changes
     */
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

        $attached = array_values(array_diff($targetIds, $currentIds));
        $detached = array_values(array_diff($currentIds, $targetIds));
        $unchanged = array_values(array_intersect($currentIds, $targetIds));

        $book->categories()->sync($targetIds);

        $changes['category_assignments']['attached'] += count($attached);
        $changes['category_assignments']['detached'] += count($detached);
        $changes['category_assignments']['unchanged'] += count($unchanged);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function loadBookManifest(string $path): array
    {
        $payload = $this->loadJson($path);
        $validator = Validator::make($payload, [
            'schema_version' => ['required', 'integer'],
            'book' => ['required', 'array'],
            'book.slug' => ['required', 'string'],
            'book.title' => ['required', 'string'],
            'book.description' => ['nullable', 'string'],
            'book.sort_order' => ['nullable', 'integer'],
            'category_slugs' => ['required', 'array'],
            'category_slugs.*' => ['required', 'string'],
            'structure' => ['required', 'array'],
            'structure.has_book_sections' => ['required', 'boolean'],
            'structure.has_chapter_sections' => ['required', 'boolean'],
            'defaults' => ['sometimes', 'array'],
            'defaults.book_section' => ['sometimes', 'array'],
            'defaults.book_section.slug' => ['sometimes', 'string'],
            'defaults.book_section.number' => ['nullable', 'string'],
            'defaults.book_section.title' => ['nullable', 'string'],
            'defaults.book_section.sort_order' => ['nullable', 'integer'],
            'defaults.chapter_section' => ['sometimes', 'array'],
            'defaults.chapter_section.slug' => ['sometimes', 'string'],
            'defaults.chapter_section.number' => ['nullable', 'string'],
            'defaults.chapter_section.title' => ['nullable', 'string'],
            'defaults.chapter_section.sort_order' => ['nullable', 'integer'],
            'chapters' => ['sometimes', 'array', 'min:1'],
            'chapters.*.path' => ['required_with:chapters', 'string'],
            'chapters.*.slug' => ['nullable', 'string'],
            'sections' => ['sometimes', 'array', 'min:1'],
            'sections.*.path' => ['required_with:sections', 'string'],
            'sections.*.slug' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            throw new RuntimeException("Invalid scripture book manifest:\n".$this->formatValidationMessages($validator->errors()->all()));
        }

        if ((int) $payload['schema_version'] !== 1) {
            throw new RuntimeException(sprintf(
                'Unsupported scripture book manifest schema version [%s].',
                $payload['schema_version'],
            ));
        }

        $hasBookSections = (bool) $payload['structure']['has_book_sections'];
        $hasSections = array_key_exists('sections', $payload);
        $hasChapters = array_key_exists('chapters', $payload);

        if ($hasBookSections !== $hasSections || $hasSections === $hasChapters) {
            throw new RuntimeException(sprintf(
                'Book manifest [%s] must use either sections or chapters in a shape consistent with has_book_sections.',
                $path,
            ));
        }

        $this->assertUniqueStrings($payload['category_slugs'], sprintf('book manifest [%s] category slugs', $path));

        return $payload;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function loadSectionManifest(string $path): array
    {
        $payload = $this->loadJson($path);
        $validator = Validator::make($payload, [
            'schema_version' => ['required', 'integer'],
            'section' => ['required', 'array'],
            'section.slug' => ['required', 'string'],
            'section.number' => ['nullable', 'string'],
            'section.title' => ['nullable', 'string'],
            'section.sort_order' => ['nullable', 'integer'],
            'chapters' => ['required', 'array', 'min:1'],
            'chapters.*.path' => ['required', 'string'],
            'chapters.*.slug' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            throw new RuntimeException("Invalid scripture section manifest:\n".$this->formatValidationMessages($validator->errors()->all()));
        }

        if ((int) $payload['schema_version'] !== 1) {
            throw new RuntimeException(sprintf(
                'Unsupported scripture section manifest schema version [%s].',
                $payload['schema_version'],
            ));
        }

        return $payload;
    }

    /**
     * @return array<string, mixed>
     */
    private function loadRootManifest(): array
    {
        $path = $this->resolvePath(self::ROOT_MANIFEST_PATH);
        $payload = $this->loadJson($path);
        $validator = Validator::make($payload, [
            'schema_version' => ['required', 'integer'],
            'books' => ['required', 'array', 'min:1'],
            'books.*.slug' => ['required', 'string'],
            'books.*.path' => ['required', 'string'],
            'books.*.enabled' => ['required', 'boolean'],
        ]);

        if ($validator->fails()) {
            throw new RuntimeException("Invalid scripture corpus manifest:\n".$this->formatValidationMessages($validator->errors()->all()));
        }

        if ((int) $payload['schema_version'] !== 1) {
            throw new RuntimeException(sprintf(
                'Unsupported scripture corpus manifest schema version [%s].',
                $payload['schema_version'],
            ));
        }

        $this->assertUniqueStrings(
            array_map(fn (array $entry): string => $entry['slug'], $payload['books']),
            'scripture corpus book slugs',
        );

        return $payload;
    }

    /**
     * @return array<string, mixed>
     */
    private function loadCategoriesManifest(): array
    {
        $path = $this->resolvePath(self::CATEGORIES_PATH);
        $payload = $this->loadJson($path);
        $validator = Validator::make($payload, [
            'schema_version' => ['required', 'integer'],
            'categories' => ['required', 'array', 'min:1'],
            'categories.*.slug' => ['required', 'string'],
            'categories.*.name' => ['required', 'string'],
            'categories.*.description' => ['nullable', 'string'],
            'categories.*.sort_order' => ['nullable', 'integer'],
        ]);

        if ($validator->fails()) {
            throw new RuntimeException("Invalid scripture categories manifest:\n".$this->formatValidationMessages($validator->errors()->all()));
        }

        if ((int) $payload['schema_version'] !== 1) {
            throw new RuntimeException(sprintf(
                'Unsupported scripture categories schema version [%s].',
                $payload['schema_version'],
            ));
        }

        $this->assertUniqueStrings(
            array_map(fn (array $record): string => $record['slug'], $payload['categories']),
            'scripture category slugs',
        );

        return $payload;
    }

    /**
     * @return array<string, mixed>
     */
    private function loadChapterPayload(string $path): array
    {
        $payload = $this->loadJson($path);
        $validator = Validator::make($payload, [
            'schema_version' => ['required', 'integer'],
            'chapter' => ['required', 'array'],
            'chapter.slug' => ['required', 'string'],
            'chapter.number' => ['nullable', 'string'],
            'chapter.title' => ['nullable', 'string'],
            'chapter.sort_order' => ['nullable', 'integer'],
            'chapter_sections' => ['sometimes', 'array', 'min:1'],
            'chapter_sections.*.slug' => ['required_with:chapter_sections', 'string'],
            'chapter_sections.*.number' => ['nullable', 'string'],
            'chapter_sections.*.title' => ['nullable', 'string'],
            'chapter_sections.*.sort_order' => ['nullable', 'integer'],
            'chapter_sections.*.verses' => ['required_with:chapter_sections', 'array', 'min:1'],
            'chapter_sections.*.verses.*.slug' => ['required_with:chapter_sections', 'string'],
            'chapter_sections.*.verses.*.number' => ['nullable', 'string'],
            'chapter_sections.*.verses.*.text' => ['required_with:chapter_sections', 'string'],
            'chapter_sections.*.verses.*.sort_order' => ['nullable', 'integer'],
            'chapter_sections.*.verses.*.translations' => ['sometimes', 'array'],
            'chapter_sections.*.verses.*.translations.*.source_key' => ['required', 'string'],
            'chapter_sections.*.verses.*.translations.*.source_name' => ['required', 'string'],
            'chapter_sections.*.verses.*.translations.*.language_code' => ['required', 'string'],
            'chapter_sections.*.verses.*.translations.*.text' => ['required', 'string'],
            'chapter_sections.*.verses.*.translations.*.sort_order' => ['nullable', 'integer'],
            'chapter_sections.*.verses.*.commentaries' => ['sometimes', 'array'],
            'chapter_sections.*.verses.*.commentaries.*.source_key' => ['required', 'string'],
            'chapter_sections.*.verses.*.commentaries.*.source_name' => ['required', 'string'],
            'chapter_sections.*.verses.*.commentaries.*.language_code' => ['required', 'string'],
            'chapter_sections.*.verses.*.commentaries.*.body' => ['required', 'string'],
            'chapter_sections.*.verses.*.commentaries.*.author_name' => ['nullable', 'string'],
            'chapter_sections.*.verses.*.commentaries.*.title' => ['nullable', 'string'],
            'chapter_sections.*.verses.*.commentaries.*.sort_order' => ['nullable', 'integer'],
            'verses' => ['sometimes', 'array', 'min:1'],
            'verses.*.slug' => ['required_with:verses', 'string'],
            'verses.*.number' => ['nullable', 'string'],
            'verses.*.text' => ['required_with:verses', 'string'],
            'verses.*.sort_order' => ['nullable', 'integer'],
            'verses.*.translations' => ['sometimes', 'array'],
            'verses.*.translations.*.source_key' => ['required', 'string'],
            'verses.*.translations.*.source_name' => ['required', 'string'],
            'verses.*.translations.*.language_code' => ['required', 'string'],
            'verses.*.translations.*.text' => ['required', 'string'],
            'verses.*.translations.*.sort_order' => ['nullable', 'integer'],
            'verses.*.commentaries' => ['sometimes', 'array'],
            'verses.*.commentaries.*.source_key' => ['required', 'string'],
            'verses.*.commentaries.*.source_name' => ['required', 'string'],
            'verses.*.commentaries.*.language_code' => ['required', 'string'],
            'verses.*.commentaries.*.body' => ['required', 'string'],
            'verses.*.commentaries.*.author_name' => ['nullable', 'string'],
            'verses.*.commentaries.*.title' => ['nullable', 'string'],
            'verses.*.commentaries.*.sort_order' => ['nullable', 'integer'],
        ]);

        if ($validator->fails()) {
            throw new RuntimeException("Invalid scripture chapter dataset:\n".$this->formatValidationMessages($validator->errors()->all()));
        }

        if ((int) $payload['schema_version'] !== 1) {
            throw new RuntimeException(sprintf(
                'Unsupported scripture chapter dataset schema version [%s].',
                $payload['schema_version'],
            ));
        }

        $hasChapterSections = array_key_exists('chapter_sections', $payload);
        $hasVerses = array_key_exists('verses', $payload);

        if ($hasChapterSections === $hasVerses) {
            throw new RuntimeException(sprintf(
                'Chapter dataset [%s] must define exactly one of chapter_sections or verses.',
                $path,
            ));
        }

        return $payload;
    }

    /**
     * @param  list<array<string, mixed>>  $references
     * @return list<array<string, string|null>>
     */
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

    /**
     * @param  array<string, mixed>  $bookDefinition
     * @return array<string, mixed>
     */
    private function defaultBookSection(array $bookDefinition): array
    {
        $default = $bookDefinition['defaults']['book_section'] ?? [];

        return [
            'slug' => $default['slug'] ?? 'main',
            'number' => $default['number'] ?? null,
            'title' => $default['title'] ?? 'Main',
            'sort_order' => $default['sort_order'] ?? 1,
        ];
    }

    /**
     * @param  array<string, mixed>  $bookDefinition
     * @return array<string, mixed>
     */
    private function defaultChapterSection(array $bookDefinition): array
    {
        $default = $bookDefinition['defaults']['chapter_section'] ?? [];

        return [
            'slug' => $default['slug'] ?? 'main',
            'number' => $default['number'] ?? null,
            'title' => $default['title'] ?? 'Main',
            'sort_order' => $default['sort_order'] ?? 1,
        ];
    }

    /**
     * @param  array<string, mixed>  $bookDefinition
     */
    private function findMatchingChapterPath(array $bookDefinition, string $path): ?string
    {
        foreach ($bookDefinition['sections'] as $sectionDefinition) {
            foreach ($sectionDefinition['chapters'] as $chapterReference) {
                if ($chapterReference['path'] === $path) {
                    return $chapterReference['path'];
                }
            }
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
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
        $candidate = $path;

        if (! is_file($candidate)) {
            $candidate = $baseDirectory !== null
                ? $baseDirectory.DIRECTORY_SEPARATOR.$path
                : base_path($path);
        }

        if (! is_file($candidate)) {
            throw new RuntimeException(sprintf('Scripture dataset [%s] was not found.', $path));
        }

        return realpath($candidate) ?: $candidate;
    }

    /**
     * @param  list<string>  $values
     */
    private function assertUniqueStrings(array $values, string $label): void
    {
        if (count($values) === count(array_unique($values))) {
            return;
        }

        throw new RuntimeException(sprintf('Duplicate values are not allowed in %s.', $label));
    }

    /**
     * @param  array<string, mixed>  $record
     * @return array<string, mixed>
     */
    private function bookValues(array $record): array
    {
        return [
            'slug' => $record['slug'],
            'title' => $record['title'],
            'description' => $record['description'] ?? null,
            'sort_order' => $record['sort_order'] ?? 0,
        ];
    }

    /**
     * @param  array<string, mixed>  $record
     * @return array<string, mixed>
     */
    private function categoryValues(array $record): array
    {
        return [
            'slug' => $record['slug'],
            'name' => $record['name'],
            'description' => $record['description'] ?? null,
            'sort_order' => $record['sort_order'] ?? 0,
        ];
    }

    /**
     * @param  array<string, mixed>  $record
     * @return array<string, mixed>
     */
    private function bookSectionValues(int $bookId, array $record): array
    {
        return [
            'book_id' => $bookId,
            'slug' => $record['slug'],
            'number' => $record['number'] ?? null,
            'title' => $record['title'] ?? null,
            'sort_order' => $record['sort_order'] ?? 0,
        ];
    }

    /**
     * @param  array<string, mixed>  $record
     * @return array<string, mixed>
     */
    private function chapterValues(int $bookSectionId, array $record): array
    {
        return [
            'book_section_id' => $bookSectionId,
            'slug' => $record['slug'],
            'number' => $record['number'] ?? null,
            'title' => $record['title'] ?? null,
            'sort_order' => $record['sort_order'] ?? 0,
        ];
    }

    /**
     * @param  array<string, mixed>  $record
     * @return array<string, mixed>
     */
    private function chapterSectionValues(int $chapterId, array $record, int $index = 0): array
    {
        return [
            'chapter_id' => $chapterId,
            'slug' => $record['slug'],
            'number' => $record['number'] ?? null,
            'title' => $record['title'] ?? null,
            'sort_order' => $record['sort_order'] ?? ($index + 1),
        ];
    }

    /**
     * @param  array<string, mixed>  $record
     * @return array<string, mixed>
     */
    private function verseValues(int $chapterSectionId, array $record, int $index): array
    {
        return [
            'chapter_section_id' => $chapterSectionId,
            'slug' => $record['slug'],
            'number' => $record['number'] ?? null,
            'text' => $record['text'],
            'sort_order' => $record['sort_order'] ?? ($index + 1),
        ];
    }

    /**
     * @param  array<string, mixed>  $record
     * @return array<string, mixed>
     */
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

    /**
     * @param  array<string, mixed>  $record
     * @return array<string, mixed>
     */
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

    /**
     * @param  Builder<Model>  $builder
     * @param  array<string, mixed>  $identity
     * @param  array<string, mixed>  $values
     * @return array{0: Model, 1: string}
     */
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

    /**
     * @param  array<int, array<string, mixed>>  $verses
     */
    private function countNestedRecords(array $verses, string $key): int
    {
        $count = 0;

        foreach ($verses as $verse) {
            $count += count($verse[$key] ?? []);
        }

        return $count;
    }

    /**
     * @return array<string, int>
     */
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

    /**
     * @return array<string, array<string, int>>
     */
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

    /**
     * @param  array<string, int>  $left
     * @param  array<string, int>  $right
     * @return array<string, int>
     */
    private function mergeNumericSummary(array $left, array $right): array
    {
        foreach ($right as $key => $value) {
            $left[$key] = ($left[$key] ?? 0) + $value;
        }

        return $left;
    }

    /**
     * @param  array<string, array<string, int>>  $left
     * @param  array<string, array<string, int>>  $right
     * @return array<string, array<string, int>>
     */
    private function mergeChangeSummary(array $left, array $right): array
    {
        foreach ($right as $type => $states) {
            foreach ($states as $state => $count) {
                $left[$type][$state] = ($left[$type][$state] ?? 0) + $count;
            }
        }

        return $left;
    }

    /**
     * @param  list<string>  $messages
     */
    private function formatValidationMessages(array $messages): string
    {
        return implode(PHP_EOL, $messages);
    }
}
