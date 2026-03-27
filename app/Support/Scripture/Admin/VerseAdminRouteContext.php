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
    private const EDITABLE_BLOCK_TYPE = 'text';
    private const DEFAULT_CONTENT_BLOCK_REGION = 'study';

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

    public function contentBlockMoveUpHref(ContentBlock $contentBlock): string
    {
        return route('scripture.chapters.verses.admin.content-blocks.move-up', $this->routeParameters([
            'contentBlock' => $contentBlock,
        ]));
    }

    public function contentBlockMoveDownHref(ContentBlock $contentBlock): string
    {
        return route('scripture.chapters.verses.admin.content-blocks.move-down', $this->routeParameters([
            'contentBlock' => $contentBlock,
        ]));
    }

    public function contentBlockReorderHref(ContentBlock $contentBlock): string
    {
        return route('scripture.chapters.verses.admin.content-blocks.move', $this->routeParameters([
            'contentBlock' => $contentBlock,
        ]));
    }

    public function contentBlockDuplicateHref(ContentBlock $contentBlock): string
    {
        return route('scripture.chapters.verses.admin.content-blocks.duplicate', $this->routeParameters([
            'contentBlock' => $contentBlock,
        ]));
    }

    public function contentBlockDestroyHref(ContentBlock $contentBlock): string
    {
        return route('scripture.chapters.verses.admin.content-blocks.destroy', $this->routeParameters([
            'contentBlock' => $contentBlock,
        ]));
    }

    /**
     * @return list<string>
     */
    public function contentBlockTypes(): array
    {
        return [self::EDITABLE_BLOCK_TYPE];
    }

    public function defaultContentBlockRegion(): string
    {
        return self::DEFAULT_CONTENT_BLOCK_REGION;
    }

    public function ownsContentBlock(ContentBlock $contentBlock): bool
    {
        return FixedTypeContentBlock::owns($this->verse, $contentBlock);
    }

    public function isEditableNoteBlock(ContentBlock $contentBlock): bool
    {
        return FixedTypeContentBlock::isEditableFor(
            $this->verse,
            $contentBlock,
            self::EDITABLE_BLOCK_TYPE,
        );
    }

    public function isContextualInsertionAnchor(ContentBlock $contentBlock): bool
    {
        return FixedTypeContentBlock::isInsertionAnchorFor(
            $this->verse,
            $contentBlock,
            self::EDITABLE_BLOCK_TYPE,
        );
    }

    public function abortUnlessOwnsContentBlock(ContentBlock $contentBlock): void
    {
        abort_unless($this->ownsContentBlock($contentBlock), 404);
    }

    public function abortUnlessEditableNoteBlock(ContentBlock $contentBlock): void
    {
        FixedTypeContentBlock::abortUnlessEditableFor(
            $this->verse,
            $contentBlock,
            self::EDITABLE_BLOCK_TYPE,
        );
    }

    public function abortUnlessDuplicableNoteBlock(ContentBlock $contentBlock): void
    {
        $this->abortUnlessEditableNoteBlock($contentBlock);
    }

    public function abortUnlessContextualInsertionAnchor(ContentBlock $contentBlock): void
    {
        FixedTypeContentBlock::abortUnlessInsertionAnchorFor(
            $this->verse,
            $contentBlock,
            self::EDITABLE_BLOCK_TYPE,
        );
    }

    public function contentBlockProtectionReason(): string
    {
        return 'Only verse-owned text note blocks are editable in this phase.';
    }
}
