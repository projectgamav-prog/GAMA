<?php

namespace App\Support\Scripture\Admin;

use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\ContentBlock;

class ChapterSectionAdminRouteContext
{
    private const DEFAULT_CONTENT_BLOCK_REGION = 'overview';

    public function __construct(
        private readonly Book $book,
        private readonly BookSection $bookSection,
        private readonly Chapter $chapter,
        private readonly ChapterSection $chapterSection,
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
        ], $extra);
    }

    public function contentBlockStoreHref(): string
    {
        return route(
            'scripture.chapter-sections.admin.content-blocks.store',
            $this->routeParameters(),
        );
    }

    public function contentBlockUpdateHref(ContentBlock $contentBlock): string
    {
        return route(
            'scripture.chapter-sections.admin.content-blocks.update',
            $this->routeParameters([
                'contentBlock' => $contentBlock,
            ]),
        );
    }

    /**
     * @return list<string>
     */
    public function contentBlockTypes(): array
    {
        return RegisteredNoteContentBlockSchema::editableTypes();
    }

    public function defaultContentBlockRegion(): string
    {
        return self::DEFAULT_CONTENT_BLOCK_REGION;
    }

    public function ownsContentBlock(ContentBlock $contentBlock): bool
    {
        return RegisteredContentBlock::owns($this->chapterSection, $contentBlock);
    }

    public function isEditableIntroBlock(ContentBlock $contentBlock): bool
    {
        return RegisteredContentBlock::isEditableFor(
            $this->chapterSection,
            $contentBlock,
            $this->contentBlockTypes(),
        );
    }

    public function abortUnlessEditableIntroBlock(ContentBlock $contentBlock): void
    {
        RegisteredContentBlock::abortUnlessEditableFor(
            $this->chapterSection,
            $contentBlock,
            $this->contentBlockTypes(),
        );
    }

    public function isContextualInsertionAnchor(ContentBlock $contentBlock): bool
    {
        return RegisteredContentBlock::isInsertionAnchorFor(
            $this->chapterSection,
            $contentBlock,
            $this->contentBlockTypes(),
        );
    }

    public function abortUnlessContextualInsertionAnchor(ContentBlock $contentBlock): void
    {
        RegisteredContentBlock::abortUnlessInsertionAnchorFor(
            $this->chapterSection,
            $contentBlock,
            $this->contentBlockTypes(),
        );
    }
}
