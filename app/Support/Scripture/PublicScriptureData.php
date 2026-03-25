<?php

namespace App\Support\Scripture;

use App\Models\Book;
use App\Models\BookSection;
use App\Models\Character;
use App\Models\CharacterVerseAssignment;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\ContentBlock;
use App\Models\DictionaryEntry;
use App\Models\Media;
use App\Models\Topic;
use App\Models\TopicVerseAssignment;
use App\Models\Verse;
use App\Models\VerseDictionaryAssignment;
use App\Models\VerseMeta;
use App\Models\VerseCommentary;
use App\Models\VerseRecitation;
use App\Models\VerseTranslation;

/**
 * Maps canonical scripture models into the stable public Inertia payload shape.
 *
 * Controllers keep ownership of querying and access rules; this mapper owns
 * the public-facing array contract and the canonical links between pages.
 */
class PublicScriptureData
{
    /**
     * @param  iterable<int, Book>  $books
     * @return list<array<string, mixed>>
     */
    public function books(iterable $books): array
    {
        return collect($books)
            ->map(fn (Book $book) => $this->book($book))
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public function book(Book $book): array
    {
        return [
            'id' => $book->id,
            'slug' => $book->slug,
            'number' => $book->number,
            'title' => $book->title,
            'description' => $book->description,
            'href' => $this->bookHref($book),
            'overview_href' => $this->bookOverviewHref($book),
            'overview_video' => $this->overviewVideo($book),
        ];
    }

    /**
     * @param  iterable<int, BookSection>  $sections
     * @return list<array<string, mixed>>
     */
    public function bookSectionsWithChapters(Book $book, iterable $sections): array
    {
        return collect($sections)
            ->map(fn (BookSection $section) => [
                ...$this->bookSection($book, $section),
                'chapters' => collect($section->chapters)
                    ->map(fn (Chapter $chapter) => $this->chapter(
                        $book,
                        $section,
                        $chapter,
                        includeReaderLink: false,
                    ))
                    ->values()
                    ->all(),
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public function bookSection(Book $book, BookSection $section): array
    {
        return [
            'id' => $section->id,
            'slug' => $section->slug,
            'number' => $section->number,
            'title' => $section->title,
            'href' => $this->bookSectionHref($book, $section),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function chapter(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        bool $includeReaderLink = true,
    ): array {
        $data = [
            'id' => $chapter->id,
            'slug' => $chapter->slug,
            'number' => $chapter->number,
            'title' => $chapter->title,
            'href' => $this->chapterHref($book, $bookSection, $chapter),
        ];

        if (! $includeReaderLink) {
            return $data;
        }

        return [
            ...$data,
            'verses_href' => $this->chapterReaderHref($book, $bookSection, $chapter),
        ];
    }

    /**
     * @param  iterable<int, ChapterSection>  $sections
     * @return list<array<string, mixed>>
     */
    public function chapterSections(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        iterable $sections,
    ): array {
        return collect($sections)
            ->map(fn (ChapterSection $section) => $this->chapterSection(
                $book,
                $bookSection,
                $chapter,
                $section,
                $section->verses_count ?? null,
            ))
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public function chapterSection(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $section,
        ?int $versesCount = null,
    ): array {
        $data = [
            'id' => $section->id,
            'slug' => $section->slug,
            'number' => $section->number,
            'title' => $section->title,
            'href' => $this->chapterSectionHref($book, $bookSection, $chapter, $section),
        ];

        if ($versesCount === null) {
            return $data;
        }

        return [
            ...$data,
            'verses_count' => $versesCount,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function verse(Verse $verse, ?string $href = null): array
    {
        $data = [
            'id' => $verse->id,
            'slug' => $verse->slug,
            'number' => $verse->number,
            'text' => $verse->text,
        ];

        if ($href === null) {
            return $data;
        }

        return [
            ...$data,
            'href' => $href,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    public function adjacentVerse(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        ?Verse $verse,
    ): ?array {
        if (! $verse instanceof Verse) {
            return null;
        }

        return $this->verse(
            $verse,
            $this->verseHref($book, $bookSection, $chapter, $chapterSection, $verse),
        );
    }

    /**
     * @param  iterable<int, VerseTranslation>  $translations
     * @return list<array<string, mixed>>
     */
    public function translations(iterable $translations): array
    {
        return collect($translations)
            ->map(fn (VerseTranslation $translation) => [
                'id' => $translation->id,
                'source_key' => $translation->source_key,
                'source_name' => $translation->source_name,
                'language_code' => $translation->language_code,
                'text' => $translation->text,
                'sort_order' => $translation->sort_order,
            ])
            ->values()
            ->all();
    }

    /**
     * @param  iterable<int, VerseCommentary>  $commentaries
     * @return list<array<string, mixed>>
     */
    public function commentaries(iterable $commentaries): array
    {
        return collect($commentaries)
            ->map(fn (VerseCommentary $commentary) => [
                'id' => $commentary->id,
                'source_key' => $commentary->source_key,
                'source_name' => $commentary->source_name,
                'author_name' => $commentary->author_name,
                'language_code' => $commentary->language_code,
                'title' => $commentary->title,
                'body' => $commentary->body,
                'sort_order' => $commentary->sort_order,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>|null
     */
    public function verseMeta(?VerseMeta $verseMeta): ?array
    {
        if (! $verseMeta instanceof VerseMeta) {
            return null;
        }

        return [
            'primary_speaker_character_id' => $verseMeta->primary_speaker_character_id,
            'primary_listener_character_id' => $verseMeta->primary_listener_character_id,
            'scene_location' => $verseMeta->scene_location,
            'narrative_phase' => $verseMeta->narrative_phase,
            'teaching_mode' => $verseMeta->teaching_mode,
            'difficulty_level' => $verseMeta->difficulty_level,
            'memorization_priority' => $verseMeta->memorization_priority,
            'is_featured' => $verseMeta->is_featured,
            'summary_short' => $verseMeta->summary_short,
            'keywords_json' => $verseMeta->keywords_json,
            'study_flags_json' => $verseMeta->study_flags_json,
        ];
    }

    /**
     * @param  iterable<int, VerseDictionaryAssignment>  $assignments
     * @return list<array<string, mixed>>
     */
    public function dictionaryTerms(iterable $assignments): array
    {
        return collect($assignments)
            ->map(fn (VerseDictionaryAssignment $assignment) => [
                'id' => $assignment->id,
                'matched_text' => $assignment->matched_text,
                'matched_normalized_text' => $assignment->matched_normalized_text,
                'match_type' => $assignment->match_type,
                'language_code' => $assignment->language_code,
                'sort_order' => $assignment->sort_order,
                'dictionary_entry' => $this->dictionaryEntrySummary($assignment->dictionaryEntry),
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public function dictionaryEntry(DictionaryEntry $entry): array
    {
        return [
            'id' => $entry->id,
            'slug' => $entry->slug,
            'headword' => $entry->headword,
            'transliteration' => $entry->transliteration,
            'root_headword' => $entry->rootEntry?->headword ?? $entry->root_headword,
            'meaning' => $entry->short_meaning,
            'explanation' => $entry->notes,
            'entry_type' => $entry->entry_type,
            'href' => $this->dictionaryEntryHref($entry),
        ];
    }

    /**
     * @param  iterable<int, DictionaryEntry>  $entries
     * @return list<array<string, mixed>>
     */
    public function dictionaryEntries(iterable $entries): array
    {
        return collect($entries)
            ->map(fn (DictionaryEntry $entry) => [
                'id' => $entry->id,
                'slug' => $entry->slug,
                'headword' => $entry->headword,
                'transliteration' => $entry->transliteration,
                'root_headword' => $entry->rootEntry?->headword ?? $entry->root_headword,
                'short_meaning' => $entry->short_meaning,
                'href' => $this->dictionaryEntryHref($entry),
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public function topic(Topic $topic): array
    {
        return [
            'id' => $topic->id,
            'slug' => $topic->slug,
            'name' => $topic->name,
            'description' => $topic->description,
            'href' => $this->topicHref($topic),
        ];
    }

    /**
     * @param  iterable<int, Topic>  $topics
     * @return list<array<string, mixed>>
     */
    public function topicEntries(iterable $topics): array
    {
        return collect($topics)
            ->map(fn (Topic $topic) => [
                'id' => $topic->id,
                'slug' => $topic->slug,
                'name' => $topic->name,
                'description' => $topic->description,
                'href' => $this->topicHref($topic),
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public function character(Character $character): array
    {
        return [
            'id' => $character->id,
            'slug' => $character->slug,
            'name' => $character->name,
            'description' => $character->description,
            'href' => $this->characterHref($character),
        ];
    }

    /**
     * @param  iterable<int, Character>  $characters
     * @return list<array<string, mixed>>
     */
    public function characterEntries(iterable $characters): array
    {
        return collect($characters)
            ->map(fn (Character $character) => [
                'id' => $character->id,
                'slug' => $character->slug,
                'name' => $character->name,
                'description' => $character->description,
                'href' => $this->characterHref($character),
            ])
            ->values()
            ->all();
    }

    /**
     * @param  iterable<int, VerseDictionaryAssignment>  $assignments
     * @return list<array<string, mixed>>
     */
    public function dictionaryEntryRelatedVerses(iterable $assignments): array
    {
        $relatedVerses = [];
        $seenVerseIds = [];

        foreach ($assignments as $assignment) {
            if (! $assignment instanceof VerseDictionaryAssignment) {
                continue;
            }

            $verse = $assignment->verse;
            $chapterSection = $verse?->chapterSection;
            $chapter = $chapterSection?->chapter;
            $bookSection = $chapter?->bookSection;
            $book = $bookSection?->book;

            if (! $verse instanceof Verse
                || ! $chapterSection instanceof ChapterSection
                || ! $chapter instanceof Chapter
                || ! $bookSection instanceof BookSection
                || ! $book instanceof Book) {
                continue;
            }

            $verseId = (int) $verse->getKey();

            if (isset($seenVerseIds[$verseId])) {
                continue;
            }

            $seenVerseIds[$verseId] = true;

            $relatedVerses[] = [
                ...$this->relatedVersePayload(
                    $book,
                    $bookSection,
                    $chapter,
                    $chapterSection,
                    $verse,
                ),
            ];
        }

        return $relatedVerses;
    }

    /**
     * @param  iterable<int, TopicVerseAssignment>  $assignments
     * @return list<array<string, mixed>>
     */
    public function topicRelatedVerses(iterable $assignments): array
    {
        return collect($assignments)
            ->map(function (TopicVerseAssignment $assignment): ?array {
                $verse = $assignment->verse;
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

                return $this->relatedVersePayload(
                    $book,
                    $bookSection,
                    $chapter,
                    $chapterSection,
                    $verse,
                );
            })
            ->filter()
            ->values()
            ->all();
    }

    /**
     * @param  iterable<int, CharacterVerseAssignment>  $assignments
     * @return list<array<string, mixed>>
     */
    public function characterRelatedVerses(iterable $assignments): array
    {
        return collect($assignments)
            ->map(function (CharacterVerseAssignment $assignment): ?array {
                $verse = $assignment->verse;
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

                return $this->relatedVersePayload(
                    $book,
                    $bookSection,
                    $chapter,
                    $chapterSection,
                    $verse,
                );
            })
            ->filter()
            ->values()
            ->all();
    }

    /**
     * @param  iterable<int, VerseRecitation>  $recitations
     * @return list<array<string, mixed>>
     */
    public function recitations(iterable $recitations): array
    {
        return collect($recitations)
            ->map(fn (VerseRecitation $recitation) => [
                'id' => $recitation->id,
                'reciter_name' => $recitation->reciter_name,
                'reciter_slug' => $recitation->reciter_slug,
                'language_code' => $recitation->language_code,
                'style' => $recitation->style,
                'duration_seconds' => $recitation->duration_seconds,
                'sort_order' => $recitation->sort_order,
                'media' => $this->mediaSummary($recitation->media),
            ])
            ->values()
            ->all();
    }

    /**
     * @param  iterable<int, TopicVerseAssignment>  $assignments
     * @return list<array<string, mixed>>
     */
    public function topics(iterable $assignments): array
    {
        return collect($assignments)
            ->map(fn (TopicVerseAssignment $assignment) => [
                'id' => $assignment->id,
                'weight' => $assignment->weight === null ? null : (float) $assignment->weight,
                'sort_order' => $assignment->sort_order,
                'notes' => $assignment->notes,
                'topic' => $this->topicSummary($assignment->topic),
            ])
            ->values()
            ->all();
    }

    /**
     * @param  iterable<int, CharacterVerseAssignment>  $assignments
     * @return list<array<string, mixed>>
     */
    public function characters(iterable $assignments): array
    {
        return collect($assignments)
            ->map(fn (CharacterVerseAssignment $assignment) => [
                'id' => $assignment->id,
                'weight' => $assignment->weight === null ? null : (float) $assignment->weight,
                'sort_order' => $assignment->sort_order,
                'notes' => $assignment->notes,
                'character' => $this->characterSummary($assignment->character),
            ])
            ->values()
            ->all();
    }

    /**
     * @param  iterable<int, ContentBlock>  $blocks
     * @return list<array<string, mixed>>
     */
    public function contentBlocks(iterable $blocks): array
    {
        return collect($blocks)
            ->map(fn (ContentBlock $block) => $this->contentBlock($block))
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>|null
     */
    private function overviewVideo(Book $book): ?array
    {
        if (! $book->relationLoaded('contentBlocks')) {
            return null;
        }

        $videoBlocks = collect($book->contentBlocks)
            ->filter(fn (mixed $block) => $block instanceof ContentBlock
                && $block->block_type === 'video'
                && filled(data_get($block->data_json, 'url')))
            ->values();

        $videoBlock = $videoBlocks->firstWhere('region', 'overview');

        if (! $videoBlock instanceof ContentBlock) {
            $videoBlock = $videoBlocks->first();
        }

        if (! $videoBlock instanceof ContentBlock) {
            return null;
        }

        return $this->contentBlock($videoBlock);
    }

    /**
     * @return array<string, mixed>
     */
    private function contentBlock(ContentBlock $block): array
    {
        return [
            'id' => $block->id,
            'region' => $block->region,
            'block_type' => $block->block_type,
            'title' => $block->title,
            'body' => $block->body,
            'data_json' => $block->data_json,
            'sort_order' => $block->sort_order,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function dictionaryEntrySummary(?DictionaryEntry $entry): ?array
    {
        if (! $entry instanceof DictionaryEntry) {
            return null;
        }

        return [
            'id' => $entry->id,
            'slug' => $entry->slug,
            'headword' => $entry->headword,
            'transliteration' => $entry->transliteration,
            'short_meaning' => $entry->short_meaning,
            'href' => $this->dictionaryEntryHref($entry),
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function mediaSummary(?Media $media): ?array
    {
        if (! $media instanceof Media) {
            return null;
        }

        return [
            'id' => $media->id,
            'title' => $media->title,
            'path' => $media->path,
            'url' => $media->url,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function topicSummary(?Topic $topic): ?array
    {
        if (! $topic instanceof Topic) {
            return null;
        }

        return [
            'id' => $topic->id,
            'slug' => $topic->slug,
            'name' => $topic->name,
            'href' => $this->topicHref($topic),
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function characterSummary(?Character $character): ?array
    {
        if (! $character instanceof Character) {
            return null;
        }

        return [
            'id' => $character->id,
            'slug' => $character->slug,
            'name' => $character->name,
            'href' => $this->characterHref($character),
        ];
    }

    private function bookHref(Book $book): string
    {
        return route('scripture.books.show', $book);
    }

    private function bookOverviewHref(Book $book): string
    {
        return route('scripture.books.overview', $book);
    }

    private function dictionaryEntryHref(DictionaryEntry $entry): string
    {
        return route('scripture.dictionary.show', $entry);
    }

    private function topicHref(Topic $topic): string
    {
        return route('scripture.topics.show', $topic);
    }

    private function characterHref(Character $character): string
    {
        return route('scripture.characters.show', $character);
    }

    private function bookSectionHref(Book $book, BookSection $section): string
    {
        return $this->bookHref($book).'#section-'.$section->slug;
    }

    private function chapterHref(Book $book, BookSection $bookSection, Chapter $chapter): string
    {
        return route('scripture.chapters.show', [
            'book' => $book,
            'bookSection' => $bookSection,
            'chapter' => $chapter,
        ]);
    }

    private function chapterReaderHref(Book $book, BookSection $bookSection, Chapter $chapter): string
    {
        return route('scripture.chapters.verses.index', [
            'book' => $book,
            'bookSection' => $bookSection,
            'chapter' => $chapter,
        ]);
    }

    private function chapterSectionHref(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $section,
    ): string {
        return $this->chapterReaderHref($book, $bookSection, $chapter).'#'.$section->slug;
    }

    private function verseHref(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        Verse $verse,
    ): string {
        return route('scripture.chapters.verses.show', [
            'book' => $book,
            'bookSection' => $bookSection,
            'chapter' => $chapter,
            'chapterSection' => $chapterSection,
            'verse' => $verse,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function relatedVersePayload(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        Verse $verse,
    ): array {
        return [
            'id' => $verse->id,
            'slug' => $verse->slug,
            'number' => $verse->number,
            'chapter_slug' => $chapter->slug,
            'chapter_number' => $chapter->number,
            'book_slug' => $book->slug,
            'href' => $this->verseHref(
                $book,
                $bookSection,
                $chapter,
                $chapterSection,
                $verse,
            ),
        ];
    }
}
