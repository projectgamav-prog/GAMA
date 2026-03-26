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

    public function overviewHref(): string
    {
        return route('scripture.books.overview', $this->routeParameters());
    }

    public function detailsUpdateHref(): string
    {
        return route('scripture.books.admin.details.update', $this->routeParameters());
    }

    public function fullEditHref(): string
    {
        return route('scripture.books.admin.full-edit', $this->routeParameters());
    }

    public function canonicalEditHref(): string
    {
        return route('scripture.books.admin.canonical-edit', $this->routeParameters());
    }

    public function contentBlockStoreHref(): string
    {
        return route('scripture.books.admin.content-blocks.store', $this->routeParameters());
    }

    public function contentBlockUpdateHref(ContentBlock $contentBlock): string
    {
        return route('scripture.books.admin.content-blocks.update', $this->routeParameters([
            'contentBlock' => $contentBlock,
        ]));
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
    public function creatableContentBlockRegions(): array
    {
        return BookContentBlockSchema::creatableRegions();
    }

    public function mediaAssignmentStoreHref(): string
    {
        return route('scripture.books.admin.media-assignments.store', $this->routeParameters());
    }

    public function mediaAssignmentUpdateHref(MediaAssignment $mediaAssignment): string
    {
        return route('scripture.books.admin.media-assignments.update', $this->routeParameters([
            'mediaAssignment' => $mediaAssignment,
        ]));
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

    public function abortUnlessEditableContentBlock(ContentBlock $contentBlock): void
    {
        RegisteredContentBlock::abortUnlessEditableFor(
            $this->book,
            $contentBlock,
            $this->editableContentBlockTypes(),
        );
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
