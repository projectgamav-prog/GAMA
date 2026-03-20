<?php

namespace App\Actions\Scripture;

use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\Verse;
use App\Models\VerseCardGroup;
use Illuminate\Support\Collection;

class BuildChapterVerseReaderData
{
    /**
     * Build chapter-section reading cards in canonical order.
     *
     * @return array{
     *     reader_languages: list<string>,
     *     default_language: string|null,
     *     chapter_sections: list<array<string, mixed>>
     * }
     */
    public function handle(Book $book, BookSection $bookSection, Chapter $chapter): array
    {
        $chapter->load([
            'chapterSections' => fn ($query) => $query
                ->orderBy('sort_order')
                ->with([
                    'verses' => fn ($verseQuery) => $verseQuery
                        ->orderBy('sort_order')
                        ->with([
                            'translations' => fn ($translationQuery) => $translationQuery->orderBy('sort_order'),
                            'verseCardGroupItem.verseCardGroup.items.verse',
                        ])
                        ->withCount([
                            'contentBlocks as published_video_blocks_count' => fn ($contentBlockQuery) => $contentBlockQuery
                                ->where('status', 'published')
                                ->where('block_type', 'video'),
                        ]),
                ]),
        ]);

        $hasEnglish = false;
        $hasHindi = false;

        $chapterSections = $chapter->chapterSections
            ->map(function (ChapterSection $section) use (
                $book,
                $bookSection,
                $chapter,
                &$hasEnglish,
                &$hasHindi,
            ) {
                $sectionData = $this->buildSectionData(
                    $book,
                    $bookSection,
                    $chapter,
                    $section,
                );

                foreach ($sectionData['cards'] as $card) {
                    foreach ($card['verses'] as $verse) {
                        $hasEnglish = $hasEnglish || $verse['translations']['en'] !== null;
                        $hasHindi = $hasHindi || $verse['translations']['hi'] !== null;
                    }
                }

                return $sectionData;
            })
            ->values()
            ->all();

        return [
            'reader_languages' => array_values(array_filter([
                $hasEnglish ? 'en' : null,
                $hasHindi ? 'hi' : null,
            ])),
            'default_language' => $hasEnglish ? 'en' : ($hasHindi ? 'hi' : null),
            'chapter_sections' => $chapterSections,
        ];
    }

    /**
     * Build reading data for one canonical chapter section.
     *
     * @return array<string, mixed>
     */
    private function buildSectionData(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $section,
    ): array {
        /** @var Collection<int, Verse> $sectionVerses */
        $sectionVerses = $section->verses->values();

        /** @var Collection<int, int> $versePositions */
        $versePositions = $sectionVerses
            ->values()
            ->mapWithKeys(fn (Verse $verse, int $index) => [$verse->id => $index]);

        /** @var Collection<int, Verse> $versesById */
        $versesById = $sectionVerses->keyBy('id');

        /** @var Collection<int, array<string, mixed>> $preparedVerses */
        $preparedVerses = $sectionVerses->mapWithKeys(fn (Verse $verse) => [
            $verse->id => $this->readerVerseData(
                $book,
                $bookSection,
                $chapter,
                $section,
                $verse,
            ),
        ]);

        $renderedGroupIds = [];
        $invalidGroupIds = [];
        $cards = [];

        foreach ($sectionVerses as $verse) {
            $group = $verse->verseCardGroupItem?->verseCardGroup;

            if (! $group) {
                $cards[] = $this->singleCardData($verse, $preparedVerses);
                continue;
            }

            if (in_array($group->id, $renderedGroupIds, true)) {
                continue;
            }

            if (in_array($group->id, $invalidGroupIds, true)) {
                $cards[] = $this->singleCardData($verse, $preparedVerses);
                continue;
            }

            $groupVerses = $this->validateGroupVerses(
                $group,
                $section,
                $versePositions,
                $versesById,
            );

            if ($groupVerses === null) {
                $invalidGroupIds[] = $group->id;
                $cards[] = $this->singleCardData($verse, $preparedVerses);
                continue;
            }

            $renderedGroupIds[] = $group->id;
            $cards[] = [
                'id' => 'group-'.$group->id,
                'type' => 'group',
                'label' => $this->groupCardLabel($groupVerses),
                'verses' => $groupVerses
                    ->map(fn (Verse $groupVerse) => $preparedVerses->get($groupVerse->id))
                    ->values()
                    ->all(),
            ];
        }

        return [
            'id' => $section->id,
            'slug' => $section->slug,
            'number' => $section->number,
            'title' => $section->title,
            'sort_order' => $section->sort_order,
            'cards' => $cards,
        ];
    }

    /**
     * Validate a helper-layer group against one chapter section.
     *
     * @param  Collection<int, int>  $versePositions
     * @param  Collection<int, Verse>  $versesById
     * @return Collection<int, Verse>|null
     */
    private function validateGroupVerses(
        VerseCardGroup $group,
        ChapterSection $section,
        Collection $versePositions,
        Collection $versesById,
    ): ?Collection {
        $groupVerses = $group->items
            ->map(fn ($item) => $item->verse)
            ->filter();

        if ($groupVerses->count() < 2) {
            return null;
        }

        if ($groupVerses->contains(
            fn (Verse $groupVerse) => (int) $groupVerse->chapter_section_id !== $section->id
        )) {
            return null;
        }

        $groupVerseIds = $groupVerses->pluck('id');

        if ($groupVerseIds->contains(fn (int $verseId) => ! $versePositions->has($verseId))) {
            return null;
        }

        $orderedIds = $groupVerseIds
            ->sortBy(fn (int $verseId) => $versePositions->get($verseId))
            ->values();

        $positions = $orderedIds
            ->map(fn (int $verseId) => $versePositions->get($verseId))
            ->values();

        $expectedPositions = range($positions->first(), $positions->last());

        if ($positions->all() !== $expectedPositions) {
            return null;
        }

        return $orderedIds
            ->map(fn (int $verseId) => $versesById->get($verseId))
            ->filter()
            ->values();
    }

    /**
     * Prepare one verse for the reader payload.
     *
     * @return array<string, mixed>
     */
    private function readerVerseData(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $section,
        Verse $verse,
    ): array {
        $explanationHref = route('scripture.chapters.verses.show', [
            'book' => $book,
            'bookSection' => $bookSection,
            'chapter' => $chapter,
            'chapterSection' => $section,
            'verse' => $verse,
        ]);

        return [
            'id' => $verse->id,
            'slug' => $verse->slug,
            'number' => $verse->number,
            'text' => $verse->text,
            'explanation_href' => $explanationHref,
            'video_href' => $verse->published_video_blocks_count > 0
                ? $explanationHref.'#published-notes'
                : null,
            'translations' => [
                'en' => $this->translationText($verse, 'en'),
                'hi' => $this->translationText($verse, 'hi'),
            ],
        ];
    }

    /**
     * Get the first translation text for a language in sort order.
     */
    private function translationText(Verse $verse, string $languageCode): ?string
    {
        return $verse->translations
            ->firstWhere('language_code', $languageCode)
            ?->text;
    }

    /**
     * Build a single-verse card.
     *
     * @param  Collection<int, array<string, mixed>>  $preparedVerses
     * @return array<string, mixed>
     */
    private function singleCardData(Verse $verse, Collection $preparedVerses): array
    {
        return [
            'id' => 'verse-'.$verse->id,
            'type' => 'single',
            'label' => $this->singleCardLabel($verse),
            'verses' => [
                $preparedVerses->get($verse->id),
            ],
        ];
    }

    /**
     * Build a single-card label.
     */
    private function singleCardLabel(Verse $verse): string
    {
        return $verse->number
            ? 'Verse '.$verse->number
            : 'Verse';
    }

    /**
     * Build a grouped-card label.
     *
     * @param  Collection<int, Verse>  $verses
     */
    private function groupCardLabel(Collection $verses): string
    {
        $first = $verses->first();
        $last = $verses->last();

        if (! $first instanceof Verse || ! $last instanceof Verse) {
            return 'Grouped Verses';
        }

        if ($first->number && $last->number) {
            return $first->number === $last->number
                ? 'Verse '.$first->number
                : 'Verses '.$first->number.'-'.$last->number;
        }

        return 'Grouped Verses';
    }
}
