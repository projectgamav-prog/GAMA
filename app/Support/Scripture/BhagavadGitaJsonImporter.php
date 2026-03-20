<?php

namespace App\Support\Scripture;

use App\Models\Book;
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

class BhagavadGitaJsonImporter
{
    public const DEFAULT_PATH = 'database/data/scripture/bhagavad-gita/pilot/chapter-1-main.json';

    /**
     * Import a Bhagavad Gita JSON dataset into the canonical scripture tables.
     *
     * @return array<string, mixed>
     */
    public function import(string $path, bool $dryRun = false): array
    {
        $resolvedPath = $this->resolvePath($path);
        $payload = $this->loadPayload($resolvedPath);
        $this->validatePayload($payload);

        $summary = [
            'path' => $resolvedPath,
            'dataset_key' => $payload['dataset_key'],
            'schema_version' => (int) $payload['schema_version'],
            'dry_run' => $dryRun,
            'counts' => [
                'books' => 1,
                'book_sections' => 1,
                'chapters' => 1,
                'chapter_sections' => 1,
                'verses' => count($payload['verses']),
                'translations' => $this->countNestedRecords($payload['verses'], 'translations'),
                'commentaries' => $this->countNestedRecords($payload['verses'], 'commentaries'),
            ],
        ];

        if ($dryRun) {
            return $summary;
        }

        $changes = $this->emptyChangeSummary();

        DB::transaction(function () use ($payload, &$changes): void {
            [$book, $state] = $this->upsert(
                Book::query(),
                ['slug' => $payload['book']['slug']],
                $this->bookValues($payload['book']),
            );
            $changes['books'][$state]++;

            [$bookSection, $state] = $this->upsert(
                BookSection::query(),
                [
                    'book_id' => $book->getKey(),
                    'slug' => $payload['book_section']['slug'],
                ],
                $this->bookSectionValues($book->getKey(), $payload['book_section']),
            );
            $changes['book_sections'][$state]++;

            [$chapter, $state] = $this->upsert(
                Chapter::query(),
                [
                    'book_section_id' => $bookSection->getKey(),
                    'slug' => $payload['chapter']['slug'],
                ],
                $this->chapterValues($bookSection->getKey(), $payload['chapter']),
            );
            $changes['chapters'][$state]++;

            [$chapterSection, $state] = $this->upsert(
                ChapterSection::query(),
                [
                    'chapter_id' => $chapter->getKey(),
                    'slug' => $payload['chapter_section']['slug'],
                ],
                $this->chapterSectionValues($chapter->getKey(), $payload['chapter_section']),
            );
            $changes['chapter_sections'][$state]++;

            foreach ($payload['verses'] as $index => $verseData) {
                [$verse, $state] = $this->upsert(
                    Verse::query(),
                    [
                        'chapter_section_id' => $chapterSection->getKey(),
                        'slug' => $verseData['slug'],
                    ],
                    $this->verseValues($chapterSection->getKey(), $verseData, $index),
                );
                $changes['verses'][$state]++;

                foreach ($verseData['translations'] ?? [] as $translationIndex => $translationData) {
                    [, $state] = $this->upsert(
                        VerseTranslation::query(),
                        [
                            'verse_id' => $verse->getKey(),
                            'language_code' => $translationData['language_code'],
                            'source_key' => $translationData['source_key'],
                        ],
                        $this->translationValues($verse->getKey(), $translationData, $translationIndex),
                    );
                    $changes['translations'][$state]++;
                }

                foreach ($verseData['commentaries'] ?? [] as $commentaryIndex => $commentaryData) {
                    [, $state] = $this->upsert(
                        VerseCommentary::query(),
                        [
                            'verse_id' => $verse->getKey(),
                            'language_code' => $commentaryData['language_code'],
                            'source_key' => $commentaryData['source_key'],
                        ],
                        $this->commentaryValues($verse->getKey(), $commentaryData, $commentaryIndex),
                    );
                    $changes['commentaries'][$state]++;
                }
            }
        });

        $summary['changes'] = $changes;

        return $summary;
    }

    /**
     * @return array<string, mixed>
     */
    private function loadPayload(string $path): array
    {
        $contents = file_get_contents($path);

        if ($contents === false) {
            throw new RuntimeException(sprintf('Unable to read import dataset [%s].', $path));
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
            throw new RuntimeException(sprintf('Import dataset [%s] must decode to a JSON object.', $path));
        }

        return $payload;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function validatePayload(array $payload): void
    {
        $validator = Validator::make($payload, [
            'schema_version' => ['required', 'integer'],
            'dataset_key' => ['required', 'string'],
            'book' => ['required', 'array'],
            'book.slug' => ['required', 'string'],
            'book.title' => ['required', 'string'],
            'book.description' => ['nullable', 'string'],
            'book.sort_order' => ['nullable', 'integer'],
            'book_section' => ['required', 'array'],
            'book_section.slug' => ['required', 'string'],
            'book_section.number' => ['nullable', 'string'],
            'book_section.title' => ['nullable', 'string'],
            'book_section.sort_order' => ['nullable', 'integer'],
            'chapter' => ['required', 'array'],
            'chapter.slug' => ['required', 'string'],
            'chapter.number' => ['nullable', 'string'],
            'chapter.title' => ['nullable', 'string'],
            'chapter.sort_order' => ['nullable', 'integer'],
            'chapter_section' => ['required', 'array'],
            'chapter_section.slug' => ['required', 'string'],
            'chapter_section.number' => ['nullable', 'string'],
            'chapter_section.title' => ['nullable', 'string'],
            'chapter_section.sort_order' => ['nullable', 'integer'],
            'verses' => ['required', 'array', 'min:1'],
            'verses.*.slug' => ['required', 'string'],
            'verses.*.number' => ['nullable', 'string'],
            'verses.*.text' => ['required', 'string'],
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
            $messages = implode(PHP_EOL, $validator->errors()->all());

            throw new RuntimeException("Invalid Bhagavad Gita import dataset:\n".$messages);
        }

        if ((int) $payload['schema_version'] !== 1) {
            throw new RuntimeException(sprintf(
                'Unsupported Bhagavad Gita import schema version [%s].',
                $payload['schema_version'],
            ));
        }
    }

    private function resolvePath(string $path): string
    {
        $candidate = is_file($path) ? $path : base_path($path);

        if (! is_file($candidate)) {
            throw new RuntimeException(sprintf('Import dataset [%s] was not found.', $path));
        }

        return realpath($candidate) ?: $candidate;
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
    private function chapterSectionValues(int $chapterId, array $record): array
    {
        return [
            'chapter_id' => $chapterId,
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
     * @return array<string, array<string, int>>
     */
    private function emptyChangeSummary(): array
    {
        $blank = [
            'created' => 0,
            'updated' => 0,
            'unchanged' => 0,
        ];

        return [
            'books' => $blank,
            'book_sections' => $blank,
            'chapters' => $blank,
            'chapter_sections' => $blank,
            'verses' => $blank,
            'translations' => $blank,
            'commentaries' => $blank,
        ];
    }
}
