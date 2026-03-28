<?php

namespace App\Actions\Scripture;

use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\Verse;
use App\Models\VerseCardGroup;
use Illuminate\Support\Collection;

/**
 * Builds the read-only chapter reader payload.
 *
 * Canonical verse order always wins. Presentation-only verse card groups are
 * allowed to collapse contiguous verses into one card, but only when they stay
 * inside a single chapter section. Invalid groups gracefully degrade to normal
 * single-verse cards so public reading behavior remains stable.
 */
class BuildChapterVerseReaderData
{
    /**
     * @return array{
     *     reader_languages: list<string>,
     *     default_language: string|null,
     *     chapter_sections: list<array<string, mixed>>
     * }
     */
    public function handle(Book $book, BookSection $bookSection, Chapter $chapter): array
    {
        $this->loadReaderGraph($chapter);

        $chapterSections = $chapter->chapterSections
            ->map(fn (ChapterSection $section) => $this->buildSectionData(
                $book,
                $bookSection,
                $chapter,
                $section,
            ))
            ->values()
            ->all();

        $readerLanguages = $this->readerLanguages($chapterSections);

        return [
            'reader_languages' => $readerLanguages,
            'default_language' => $readerLanguages[0] ?? null,
            'chapter_sections' => $chapterSections,
        ];
    }

    /**
     * Load the canonical reader graph once so the remaining methods can stay pure.
     */
    private function loadReaderGraph(Chapter $chapter): void
    {
        $chapter->load([
            'chapterSections' => fn ($query) => $query
                ->inCanonicalOrder()
                ->with([
                    'contentBlocks' => fn ($contentBlockQuery) => $contentBlockQuery
                        ->published()
                        ->orderBy('sort_order')
                        ->orderBy('id'),
                    'verses' => fn ($verseQuery) => $verseQuery
                        ->inCanonicalOrder()
                        ->with([
                            'translations',
                            'verseCardGroupItem.verseCardGroup.items.verse',
                        ])
                        ->withCount([
                            'contentBlocks as published_video_blocks_count' => fn ($contentBlockQuery) => $contentBlockQuery
                                ->published()
                                ->where('block_type', 'video'),
                        ]),
                ]),
        ]);
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
        return [
            'id' => $section->id,
            'slug' => $section->slug,
            'number' => $section->number,
            'title' => $section->title,
            'cards' => $this->buildCards($book, $bookSection, $chapter, $section),
        ];
    }

    /**
     * Build cards for one chapter section in canonical verse order.
     *
     * @return list<array<string, mixed>>
     */
    private function buildCards(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $section,
    ): array {
        /** @var Collection<int, Verse> $sectionVerses */
        $sectionVerses = $section->verses->values();

        /** @var Collection<int, int> $versePositions */
        $versePositions = $sectionVerses
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
            $cards[] = $this->groupCardData($group, $groupVerses, $preparedVerses);
        }

        return $cards;
    }

    /**
     * Validate a helper-layer group against one chapter section.
     *
     * Reader groups are presentation sugar only. They must never bridge
     * across chapter sections or skip verses inside a grouped range.
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
     * Build a grouped-verse card from already-validated verses.
     *
     * @param  Collection<int, Verse>  $groupVerses
     * @param  Collection<int, array<string, mixed>>  $preparedVerses
     * @return array<string, mixed>
     */
    private function groupCardData(
        VerseCardGroup $group,
        Collection $groupVerses,
        Collection $preparedVerses,
    ): array {
        return [
            'id' => 'group-'.$group->id,
            'type' => 'group',
            'label' => $this->groupCardLabel($groupVerses),
            'verses' => $groupVerses
                ->map(fn (Verse $groupVerse) => $preparedVerses->get($groupVerse->id))
                ->values()
                ->all(),
        ];
    }

    /**
     * Detect which reader languages are actually available in the payload.
     *
     * @param  list<array<string, mixed>>  $chapterSections
     * @return list<string>
     */
    private function readerLanguages(array $chapterSections): array
    {
        $hasEnglish = false;
        $hasHindi = false;

        foreach ($chapterSections as $section) {
            foreach ($section['cards'] as $card) {
                foreach ($card['verses'] as $verse) {
                    $hasEnglish = $hasEnglish || $verse['translations']['en'] !== null;
                    $hasHindi = $hasHindi || $verse['translations']['hi'] !== null;
                }
            }
        }

        return array_values(array_filter([
            $hasEnglish ? 'en' : null,
            $hasHindi ? 'hi' : null,
        ]));
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
