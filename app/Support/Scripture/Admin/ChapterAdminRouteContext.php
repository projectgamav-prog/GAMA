<?php

namespace App\Support\Scripture\Admin;

use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ContentBlock;

class ChapterAdminRouteContext
{
    private const DEFAULT_INTRO_BLOCK_REGION = 'overview';
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

    public function identityUpdateHref(): string
    {
        return route('scripture.chapters.admin.identity.update', $this->routeParameters());
    }

    public function destroyHref(): string
    {
        return route('scripture.chapters.admin.destroy', $this->routeParameters());
    }

    public function contentBlockStoreHref(): string
    {
        // Fallback-only path for protected full-edit maintenance of chapter
        // editorial blocks.
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
        return RegisteredNoteContentBlockSchema::editableTypes();
    }

    /**
     * @return list<string>
     */
    public function duplicableContentBlockTypes(): array
    {
        return TextualContentBlockSchema::editableTypes();
    }

    public function defaultContentBlockRegion(): string
    {
        return self::DEFAULT_CONTENT_BLOCK_REGION;
    }

    public function defaultIntroBlockRegion(): string
    {
        return self::DEFAULT_INTRO_BLOCK_REGION;
    }

    public function ownsContentBlock(ContentBlock $contentBlock): bool
    {
        return RegisteredContentBlock::owns($this->chapter, $contentBlock);
    }

    public function isEditableNoteBlock(ContentBlock $contentBlock): bool
    {
        return RegisteredContentBlock::isEditableFor(
            $this->chapter,
            $contentBlock,
            $this->contentBlockTypes(),
        );
    }

    public function isEditableIntroBlock(ContentBlock $contentBlock): bool
    {
        return $contentBlock->region === $this->defaultIntroBlockRegion()
            && RegisteredContentBlock::isEditableFor(
                $this->chapter,
                $contentBlock,
                $this->contentBlockTypes(),
            );
    }

    public function isDuplicableNoteBlock(ContentBlock $contentBlock): bool
    {
        return RegisteredContentBlock::isEditableFor(
            $this->chapter,
            $contentBlock,
            $this->duplicableContentBlockTypes(),
        );
    }

    public function abortUnlessEditableNoteBlock(ContentBlock $contentBlock): void
    {
        RegisteredContentBlock::abortUnlessEditableFor(
            $this->chapter,
            $contentBlock,
            $this->contentBlockTypes(),
        );
    }

    public function abortUnlessEditableIntroBlock(ContentBlock $contentBlock): void
    {
        abort_unless($this->isEditableIntroBlock($contentBlock), 404);
    }

    public function abortUnlessDuplicableNoteBlock(ContentBlock $contentBlock): void
    {
        abort_unless($this->isDuplicableNoteBlock($contentBlock), 404);
    }

    public function isContextualInsertionAnchor(ContentBlock $contentBlock): bool
    {
        return RegisteredContentBlock::isInsertionAnchorFor(
            $this->chapter,
            $contentBlock,
            $this->contentBlockTypes(),
        );
    }

    public function abortUnlessContextualInsertionAnchor(ContentBlock $contentBlock): void
    {
        RegisteredContentBlock::abortUnlessInsertionAnchorFor(
            $this->chapter,
            $contentBlock,
            $this->contentBlockTypes(),
        );
    }

    public function contentBlockProtectionReason(): string
    {
        return 'Only chapter-owned registered intro and note blocks (text, quote, and image) are editable in this phase.';
    }
}
