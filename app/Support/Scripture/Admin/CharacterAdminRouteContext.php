<?php

namespace App\Support\Scripture\Admin;

use App\Models\Character;
use App\Models\ContentBlock;

class CharacterAdminRouteContext
{
    public function __construct(
        private readonly Character $character,
    ) {}

    /**
     * @param  array<string, mixed>  $extra
     * @return array<string, mixed>
     */
    public function routeParameters(array $extra = []): array
    {
        return array_merge([
            'character' => $this->character,
        ], $extra);
    }

    public function characterHref(): string
    {
        return route('scripture.characters.show', $this->routeParameters());
    }

    public function fullEditHref(): string
    {
        return route('scripture.characters.admin.full-edit', $this->routeParameters());
    }

    public function detailsUpdateHref(): string
    {
        return route('scripture.characters.admin.details.update', $this->routeParameters());
    }

    public function contentBlockStoreHref(): string
    {
        return route('scripture.characters.admin.content-blocks.store', $this->routeParameters());
    }

    public function contentBlockUpdateHref(ContentBlock $contentBlock): string
    {
        return route('scripture.characters.admin.content-blocks.update', $this->routeParameters([
            'contentBlock' => $contentBlock,
        ]));
    }

    public function ownsContentBlock(ContentBlock $contentBlock): bool
    {
        return EditableTextNoteBlock::owns($this->character, $contentBlock);
    }

    public function isEditableNoteBlock(ContentBlock $contentBlock): bool
    {
        return EditableTextNoteBlock::isEditableFor($this->character, $contentBlock);
    }

    public function abortUnlessEditableNoteBlock(ContentBlock $contentBlock): void
    {
        EditableTextNoteBlock::abortUnlessEditableFor($this->character, $contentBlock);
    }
}
