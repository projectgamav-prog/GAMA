<?php

namespace App\Support\Scripture\Admin;

use App\Models\Book;
use App\Models\BookSection;
use App\Models\ContentBlock;

class BookSectionAdminRouteContext
{
    private const DEFAULT_CONTENT_BLOCK_REGION = 'overview';

    public function __construct(
        private readonly Book $book,
        private readonly BookSection $bookSection,
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
        ], $extra);
    }

    public function destroyHref(): string
    {
        return ConsciousAdminRouteUrls::action('book_section', $this->bookSection, 'canonical.delete');
    }

    public function detailsUpdateHref(): string
    {
        return ConsciousAdminRouteUrls::fieldUpdate('book_section', $this->bookSection, 'title');
    }

    public function contentBlockStoreHref(): string
    {
        return ConsciousAdminRouteUrls::action('book_section', $this->bookSection, 'content_block.create');
    }

    public function chapterStoreHref(): string
    {
        return ConsciousAdminRouteUrls::action('book_section', $this->bookSection, 'canonical.create_chapter');
    }

    public function contentBlockUpdateHref(ContentBlock $contentBlock): string
    {
        return ConsciousAdminRouteUrls::actionWithQuery(
            'book_section',
            $this->bookSection,
            'content_block.update',
            ['content_block_id' => $contentBlock->getKey()],
        );
    }

    public function contentBlockDestroyHref(ContentBlock $contentBlock): string
    {
        return ConsciousAdminRouteUrls::actionWithQuery(
            'book_section',
            $this->bookSection,
            'content_block.delete',
            ['content_block_id' => $contentBlock->getKey()],
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
        return RegisteredContentBlock::owns($this->bookSection, $contentBlock);
    }

    public function isEditableIntroBlock(ContentBlock $contentBlock): bool
    {
        return $contentBlock->region === $this->defaultContentBlockRegion()
            && RegisteredContentBlock::isEditableFor(
                $this->bookSection,
                $contentBlock,
                $this->contentBlockTypes(),
            );
    }

    public function abortUnlessEditableIntroBlock(ContentBlock $contentBlock): void
    {
        abort_unless($this->isEditableIntroBlock($contentBlock), 404);
    }

    public function isContextualInsertionAnchor(ContentBlock $contentBlock): bool
    {
        return $contentBlock->region === $this->defaultContentBlockRegion()
            && RegisteredContentBlock::isInsertionAnchorFor(
                $this->bookSection,
                $contentBlock,
                $this->contentBlockTypes(),
            );
    }

    public function abortUnlessContextualInsertionAnchor(ContentBlock $contentBlock): void
    {
        RegisteredContentBlock::abortUnlessInsertionAnchorFor(
            $this->bookSection,
            $contentBlock,
            $this->contentBlockTypes(),
        );
    }
}
