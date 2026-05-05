<?php

namespace App\Support\Scripture\Admin;

use App\Models\Book;
use App\Models\ContentBlock;
use App\Models\MediaAssignment;

class BookAdminRouteContext
{
    public function __construct(
        private readonly Book $book,
    ) {}

    /**
     * @param  array<string, mixed>  $extra
     * @return array<string, mixed>
     */
    public function routeParameters(array $extra = []): array
    {
        return array_merge([
            'book' => $this->book,
        ], $extra);
    }

    public function bookHref(): string
    {
        return route('scripture.books.show', $this->routeParameters());
    }

    public function detailsUpdateHref(): string
    {
        return ConsciousAdminRouteUrls::fieldUpdate('book', $this->book, 'description');
    }

    public function identityUpdateHref(): string
    {
        return ConsciousAdminRouteUrls::fieldUpdate('book', $this->book, 'title');
    }

    public function destroyHref(): string
    {
        return route('scripture.books.admin.destroy', $this->routeParameters());
    }

    public function fullEditHref(): string
    {
        return ConsciousAdminRouteUrls::fullEdit('book', $this->book);
    }

    public function canonicalEditHref(): string
    {
        return route('scripture.books.admin.canonical-edit', $this->routeParameters());
    }

    public function contentBlockStoreHref(): string
    {
        return ConsciousAdminRouteUrls::action('book', $this->book, 'content_block.create');
    }

    public function contentBlockUpdateHref(ContentBlock $contentBlock): string
    {
        return ConsciousAdminRouteUrls::actionWithQuery(
            'book',
            $this->book,
            'content_block.update',
            ['content_block_id' => $contentBlock->getKey()],
        );
    }

    public function contentBlockMoveUpHref(ContentBlock $contentBlock): string
    {
        return ConsciousAdminRouteUrls::actionWithQuery(
            'book',
            $this->book,
            'content_block.reorder',
            ['content_block_id' => $contentBlock->getKey(), 'direction' => 'up'],
        );
    }

    public function contentBlockMoveDownHref(ContentBlock $contentBlock): string
    {
        return ConsciousAdminRouteUrls::actionWithQuery(
            'book',
            $this->book,
            'content_block.reorder',
            ['content_block_id' => $contentBlock->getKey(), 'direction' => 'down'],
        );
    }

    public function contentBlockReorderHref(ContentBlock $contentBlock): string
    {
        return ConsciousAdminRouteUrls::actionWithQuery(
            'book',
            $this->book,
            'content_block.reorder',
            ['content_block_id' => $contentBlock->getKey()],
        );
    }

    public function contentBlockDuplicateHref(ContentBlock $contentBlock): string
    {
        return ConsciousAdminRouteUrls::actionWithQuery(
            'book',
            $this->book,
            'content_block.duplicate',
            ['content_block_id' => $contentBlock->getKey()],
        );
    }

    public function contentBlockDestroyHref(ContentBlock $contentBlock): string
    {
        return ConsciousAdminRouteUrls::actionWithQuery(
            'book',
            $this->book,
            'content_block.delete',
            ['content_block_id' => $contentBlock->getKey()],
        );
    }

    /**
     * @return list<string>
     */
    public function editableContentBlockTypes(): array
    {
        return BookContentBlockSchema::editableTypes();
    }

    /**
     * @return list<string>
     */
    public function duplicableContentBlockTypes(): array
    {
        return TextualContentBlockSchema::editableTypes();
    }

    /**
     * @return list<string>
     */
    public function creatableContentBlockRegions(): array
    {
        return BookContentBlockSchema::creatableRegions();
    }

    public function mediaAssignmentStoreHref(): string
    {
        return ConsciousAdminRouteUrls::action('book', $this->book, 'media_assignment.attach');
    }

    public function mediaAssignmentAttachHref(): string
    {
        return ConsciousAdminRouteUrls::action('book', $this->book, 'media_assignment.attach');
    }

    public function mediaAssignmentUpdateHref(MediaAssignment $mediaAssignment): string
    {
        return ConsciousAdminRouteUrls::actionWithQuery(
            'book',
            $this->book,
            'media_assignment.update',
            ['media_assignment_id' => $mediaAssignment->getKey()],
        );
    }

    public function mediaAssignmentReplaceMediaHref(MediaAssignment $mediaAssignment): string
    {
        return ConsciousAdminRouteUrls::actionWithQuery(
            'book',
            $this->book,
            'media_assignment.replace',
            ['media_assignment_id' => $mediaAssignment->getKey()],
        );
    }

    public function mediaAssignmentDestroyHref(MediaAssignment $mediaAssignment): string
    {
        return ConsciousAdminRouteUrls::actionWithQuery(
            'book',
            $this->book,
            'media_assignment.detach',
            ['media_assignment_id' => $mediaAssignment->getKey()],
        );
    }

    public function ownsContentBlock(ContentBlock $contentBlock): bool
    {
        return RegisteredContentBlock::owns($this->book, $contentBlock);
    }

    public function isEditableContentBlock(ContentBlock $contentBlock): bool
    {
        return RegisteredContentBlock::isEditableFor(
            $this->book,
            $contentBlock,
            $this->editableContentBlockTypes(),
        );
    }

    public function isDuplicableContentBlock(ContentBlock $contentBlock): bool
    {
        return RegisteredContentBlock::isEditableFor(
            $this->book,
            $contentBlock,
            $this->duplicableContentBlockTypes(),
        );
    }

    public function abortUnlessEditableContentBlock(ContentBlock $contentBlock): void
    {
        RegisteredContentBlock::abortUnlessEditableFor(
            $this->book,
            $contentBlock,
            $this->editableContentBlockTypes(),
        );
    }

    public function abortUnlessDuplicableContentBlock(ContentBlock $contentBlock): void
    {
        abort_unless($this->isDuplicableContentBlock($contentBlock), 404);
    }

    public function isContextualInsertionAnchor(ContentBlock $contentBlock): bool
    {
        return RegisteredContentBlock::isInsertionAnchorFor(
            $this->book,
            $contentBlock,
            $this->editableContentBlockTypes(),
        );
    }

    public function abortUnlessContextualInsertionAnchor(ContentBlock $contentBlock): void
    {
        RegisteredContentBlock::abortUnlessInsertionAnchorFor(
            $this->book,
            $contentBlock,
            $this->editableContentBlockTypes(),
        );
    }

    public function ownsMediaAssignment(MediaAssignment $mediaAssignment): bool
    {
        return $mediaAssignment->assignable_type === $this->book->getMorphClass()
            && (int) $mediaAssignment->assignable_id === (int) $this->book->getKey();
    }

    public function abortUnlessOwnsMediaAssignment(MediaAssignment $mediaAssignment): void
    {
        abort_unless($this->ownsMediaAssignment($mediaAssignment), 404);
    }
}
