<?php

namespace App\Support\Scripture\Admin;

use App\Models\ContentBlock;
use Illuminate\Database\Eloquent\Model;

class EditableTextNoteBlock
{
    private const BLOCK_TYPE = 'text';

    /**
     * Determine whether the block belongs to the given parent model.
     */
    public static function owns(Model $owner, ContentBlock $contentBlock): bool
    {
        return FixedTypeContentBlock::owns($owner, $contentBlock);
    }

    /**
     * Determine whether the block is an editable text note for the given parent.
     */
    public static function isEditableFor(Model $owner, ContentBlock $contentBlock): bool
    {
        return FixedTypeContentBlock::isEditableFor(
            $owner,
            $contentBlock,
            self::BLOCK_TYPE,
        );
    }

    /**
     * Abort when the block is not an editable text note for the given parent.
     */
    public static function abortUnlessEditableFor(
        Model $owner,
        ContentBlock $contentBlock,
    ): void {
        FixedTypeContentBlock::abortUnlessEditableFor(
            $owner,
            $contentBlock,
            self::BLOCK_TYPE,
        );
    }

    /**
     * Build persisted attributes for a newly-created editable text note block.
     *
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    public static function createAttributes(array $validated): array
    {
        return FixedTypeContentBlock::createAttributes(
            $validated,
            self::BLOCK_TYPE,
        );
    }

    /**
     * Build persisted attributes for an editable text note block update.
     *
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    public static function updateAttributes(array $validated): array
    {
        return FixedTypeContentBlock::updateAttributes($validated);
    }
}
