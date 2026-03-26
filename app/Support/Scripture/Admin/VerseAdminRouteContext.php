<?php

namespace App\Support\Scripture\Admin;

use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\ContentBlock;
use App\Models\Verse;

class VerseAdminRouteContext
{
    public function __construct(
        private readonly Book $book,
        private readonly BookSection $bookSection,
        private readonly Chapter $chapter,
        private readonly ChapterSection $chapterSection,
        private readonly Verse $verse,
    ) {}

    /**
     * @param  array<string, mixed>  $extra
     * @return array<string, mixed>
     */
    public function routeParameters(array $extra = []): array
    {
        return array_merge([
            'book' => $this->book,
            'bookSection' => $this->bookSection,
            'chapter' => $this->chapter,
            'chapterSection' => $this->chapterSection,
            'verse' => $this->verse,
        ], $extra);
    }

    public function verseHref(): string
    {
        return route('scripture.chapters.verses.show', $this->routeParameters());
    }

    public function fullEditHref(): string
    {
        return route('scripture.chapters.verses.admin.full-edit', $this->routeParameters());
    }

    public function metaUpdateHref(): string
    {
        return route('scripture.chapters.verses.admin.meta.update', $this->routeParameters());
    }

    public function contentBlockStoreHref(): string
    {
        return route('scripture.chapters.verses.admin.content-blocks.store', $this->routeParameters());
    }

    public function contentBlockUpdateHref(ContentBlock $contentBlock): string
    {
        return route('scripture.chapters.verses.admin.content-blocks.update', $this->routeParameters([
            'contentBlock' => $contentBlock,
        ]));
    }

    public function ownsContentBlock(ContentBlock $contentBlock): bool
    {
        return EditableTextNoteBlock::owns($this->verse, $contentBlock);
    }

    public function isEditableNoteBlock(ContentBlock $contentBlock): bool
    {
        return EditableTextNoteBlock::isEditableFor($this->verse, $contentBlock);
    }

    public function abortUnlessOwnsContentBlock(ContentBlock $contentBlock): void
    {
        abort_unless($this->ownsContentBlock($contentBlock), 404);
    }

    public function abortUnlessEditableNoteBlock(ContentBlock $contentBlock): void
    {
        EditableTextNoteBlock::abortUnlessEditableFor($this->verse, $contentBlock);
    }
}
