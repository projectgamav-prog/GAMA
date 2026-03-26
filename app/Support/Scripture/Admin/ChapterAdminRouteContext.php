<?php

namespace App\Support\Scripture\Admin;

use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ContentBlock;

class ChapterAdminRouteContext
{
    public function __construct(
        private readonly Book $book,
        private readonly BookSection $bookSection,
        private readonly Chapter $chapter,
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
        ], $extra);
    }

    public function chapterHref(): string
    {
        return route('scripture.chapters.show', $this->routeParameters());
    }

    public function fullEditHref(): string
    {
        return route('scripture.chapters.admin.full-edit', $this->routeParameters());
    }

    public function contentBlockStoreHref(): string
    {
        return route('scripture.chapters.admin.content-blocks.store', $this->routeParameters());
    }

    public function contentBlockUpdateHref(ContentBlock $contentBlock): string
    {
        return route('scripture.chapters.admin.content-blocks.update', $this->routeParameters([
            'contentBlock' => $contentBlock,
        ]));
    }

    public function ownsContentBlock(ContentBlock $contentBlock): bool
    {
        return EditableTextNoteBlock::owns($this->chapter, $contentBlock);
    }

    public function isEditableNoteBlock(ContentBlock $contentBlock): bool
    {
        return EditableTextNoteBlock::isEditableFor($this->chapter, $contentBlock);
    }

    public function abortUnlessEditableNoteBlock(ContentBlock $contentBlock): void
    {
        EditableTextNoteBlock::abortUnlessEditableFor($this->chapter, $contentBlock);
    }
}
