<?php

namespace App\Support\Scripture;

use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\ContentBlock;
use App\Models\Verse;
use App\Models\VerseCommentary;
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
     * @param  iterable<int, ContentBlock>  $blocks
     * @return list<array<string, mixed>>
     */
    public function contentBlocks(iterable $blocks): array
    {
        return collect($blocks)
            ->map(fn (ContentBlock $block) => [
                'id' => $block->id,
                'region' => $block->region,
                'block_type' => $block->block_type,
                'title' => $block->title,
                'body' => $block->body,
                'data_json' => $block->data_json,
                'sort_order' => $block->sort_order,
            ])
            ->values()
            ->all();
    }

    private function bookHref(Book $book): string
    {
        return route('scripture.books.show', $book);
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
}
