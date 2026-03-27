<?php

namespace App\Support\Scripture\Admin;

use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ContentBlock;

class ChapterAdminRouteContext
{
    private const EDITABLE_BLOCK_TYPE = 'text';
    private const DEFAULT_CONTENT_BLOCK_REGION = 'study';

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

    public function contentBlockMoveUpHref(ContentBlock $contentBlock): string
    {
        return route('scripture.chapters.admin.content-blocks.move-up', $this->routeParameters([
            'contentBlock' => $contentBlock,
        ]));
    }

    public function contentBlockMoveDownHref(ContentBlock $contentBlock): string
    {
        return route('scripture.chapters.admin.content-blocks.move-down', $this->routeParameters([
            'contentBlock' => $contentBlock,
        ]));
    }

    public function contentBlockReorderHref(ContentBlock $contentBlock): string
    {
        return route('scripture.chapters.admin.content-blocks.move', $this->routeParameters([
            'contentBlock' => $contentBlock,
        ]));
    }

    public function contentBlockDuplicateHref(ContentBlock $contentBlock): string
    {
        return route('scripture.chapters.admin.content-blocks.duplicate', $this->routeParameters([
            'contentBlock' => $contentBlock,
        ]));
    }

    public function contentBlockDestroyHref(ContentBlock $contentBlock): string
    {
        return route('scripture.chapters.admin.content-blocks.destroy', $this->routeParameters([
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
        return FixedTypeContentBlock::owns($this->chapter, $contentBlock);
    }

    public function isEditableNoteBlock(ContentBlock $contentBlock): bool
    {
        return FixedTypeContentBlock::isEditableFor(
            $this->chapter,
            $contentBlock,
            self::EDITABLE_BLOCK_TYPE,
        );
    }

    public function abortUnlessEditableNoteBlock(ContentBlock $contentBlock): void
    {
        FixedTypeContentBlock::abortUnlessEditableFor(
            $this->chapter,
            $contentBlock,
            self::EDITABLE_BLOCK_TYPE,
        );
    }

    public function abortUnlessDuplicableNoteBlock(ContentBlock $contentBlock): void
    {
        $this->abortUnlessEditableNoteBlock($contentBlock);
    }

    public function isContextualInsertionAnchor(ContentBlock $contentBlock): bool
    {
        return FixedTypeContentBlock::isInsertionAnchorFor(
            $this->chapter,
            $contentBlock,
            self::EDITABLE_BLOCK_TYPE,
        );
    }

    public function abortUnlessContextualInsertionAnchor(ContentBlock $contentBlock): void
    {
        FixedTypeContentBlock::abortUnlessInsertionAnchorFor(
            $this->chapter,
            $contentBlock,
            self::EDITABLE_BLOCK_TYPE,
        );
    }
}
