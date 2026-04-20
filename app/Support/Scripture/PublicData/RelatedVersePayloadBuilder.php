<?php

namespace App\Support\Scripture\PublicData;

use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\CharacterVerseAssignment;
use App\Models\TopicVerseAssignment;
use App\Models\Verse;
use App\Models\VerseDictionaryAssignment;

class RelatedVersePayloadBuilder
{
    /**
     * @param  iterable<int, VerseDictionaryAssignment>  $assignments
     * @param  callable(Book, BookSection, Chapter, ChapterSection, Verse): string  $verseHref
     * @return list<array<string, mixed>>
     */
    public function fromDictionaryAssignments(iterable $assignments, callable $verseHref): array
    {
        $relatedVerses = [];
        $seenVerseIds = [];

        foreach ($assignments as $assignment) {
            if (! $assignment instanceof VerseDictionaryAssignment) {
                continue;
            }

            $payload = $this->payloadForVerse($assignment->verse, $verseHref);

            if ($payload === null) {
                continue;
            }

            if (isset($seenVerseIds[$payload['id']])) {
                continue;
            }

            $seenVerseIds[$payload['id']] = true;
            $relatedVerses[] = $payload;
        }

        return $relatedVerses;
    }

    /**
     * @param  iterable<int, TopicVerseAssignment>  $assignments
     * @param  callable(Book, BookSection, Chapter, ChapterSection, Verse): string  $verseHref
     * @return list<array<string, mixed>>
     */
    public function fromTopicAssignments(iterable $assignments, callable $verseHref): array
    {
        return collect($assignments)
            ->map(
                fn (TopicVerseAssignment $assignment): ?array => $this->payloadForVerse(
                    $assignment->verse,
                    $verseHref,
                ),
            )
            ->filter()
            ->values()
            ->all();
    }

    /**
     * @param  iterable<int, CharacterVerseAssignment>  $assignments
     * @param  callable(Book, BookSection, Chapter, ChapterSection, Verse): string  $verseHref
     * @return list<array<string, mixed>>
     */
    public function fromCharacterAssignments(iterable $assignments, callable $verseHref): array
    {
        return collect($assignments)
            ->map(
                fn (CharacterVerseAssignment $assignment): ?array => $this->payloadForVerse(
                    $assignment->verse,
                    $verseHref,
                ),
            )
            ->filter()
            ->values()
            ->all();
    }

    /**
     * @param  callable(Book, BookSection, Chapter, ChapterSection, Verse): string  $verseHref
     * @return array<string, mixed>|null
     */
    private function payloadForVerse(?Verse $verse, callable $verseHref): ?array
    {
        $context = $this->canonicalContextForVerse($verse);

        if ($context === null) {
            return null;
        }

        return [
            'id' => $context['verse']->id,
            'slug' => $context['verse']->slug,
            'number' => $context['verse']->number,
            'chapter_slug' => $context['chapter']->slug,
            'chapter_number' => $context['chapter']->number,
            'book_slug' => $context['book']->slug,
            'href' => $verseHref(
                $context['book'],
                $context['bookSection'],
                $context['chapter'],
                $context['chapterSection'],
                $context['verse'],
            ),
        ];
    }

    /**
     * @return array{
     *     book: Book,
     *     bookSection: BookSection,
     *     chapter: Chapter,
     *     chapterSection: ChapterSection,
     *     verse: Verse,
     * }|null
     */
    private function canonicalContextForVerse(?Verse $verse): ?array
    {
        $chapterSection = $verse?->chapterSection;
        $chapter = $chapterSection?->chapter;
        $bookSection = $chapter?->bookSection;
        $book = $bookSection?->book;

        if (! $verse instanceof Verse
            || ! $chapterSection instanceof ChapterSection
            || ! $chapter instanceof Chapter
            || ! $bookSection instanceof BookSection
            || ! $book instanceof Book) {
            return null;
        }

        return [
            'book' => $book,
            'bookSection' => $bookSection,
            'chapter' => $chapter,
            'chapterSection' => $chapterSection,
            'verse' => $verse,
        ];
    }
}
