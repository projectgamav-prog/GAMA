<?php

namespace App\Support\Scripture\Admin;

use App\Models\ContentBlock;
use Illuminate\Database\Eloquent\Model;

class FixedTypeContentBlock
{
    /**
     * Determine whether the block belongs to the given owner model.
     */
    public static function owns(Model $owner, ContentBlock $contentBlock): bool
    {
        return RegisteredContentBlock::owns($owner, $contentBlock);
    }

    /**
     * Determine whether the block is editable for the given owner and fixed block type.
     */
    public static function isEditableFor(
        Model $owner,
        ContentBlock $contentBlock,
        string $blockType,
    ): bool {
        return RegisteredContentBlock::isEditableFor(
            $owner,
            $contentBlock,
            [$blockType],
        );
    }

    /**
     * Abort when the block is not editable for the given owner and fixed block type.
     */
    public static function abortUnlessEditableFor(
        Model $owner,
        ContentBlock $contentBlock,
        string $blockType,
    ): void {
        RegisteredContentBlock::abortUnlessEditableFor(
            $owner,
            $contentBlock,
            [$blockType],
        );
    }

    /**
     * Determine whether the block can anchor contextual insertion for the owner and fixed block type.
     */
    public static function isInsertionAnchorFor(
        Model $owner,
        ContentBlock $contentBlock,
        string $blockType,
    ): bool {
        return RegisteredContentBlock::isInsertionAnchorFor(
            $owner,
            $contentBlock,
            [$blockType],
        );
    }

    /**
     * Abort when the block cannot anchor contextual insertion for the owner and fixed block type.
     */
    public static function abortUnlessInsertionAnchorFor(
        Model $owner,
        ContentBlock $contentBlock,
        string $blockType,
    ): void {
        RegisteredContentBlock::abortUnlessInsertionAnchorFor(
            $owner,
            $contentBlock,
            [$blockType],
        );
    }

    /**
     * Build persisted attributes for a new fixed-type content block.
     *
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    public static function createAttributes(
        array $validated,
        string $blockType,
        bool $includeDataJson = true,
    ): array {
        return RegisteredContentBlock::createAttributes(
            $validated,
            forcedBlockType: $blockType,
            includeDataJson: $includeDataJson,
        );
    }

    /**
     * Build persisted attributes for a fixed-type content block update.
     *
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    public static function updateAttributes(array $validated): array
    {
        return RegisteredContentBlock::updateAttributes(
            $validated,
            allowBlockTypeUpdate: false,
        );
    }
}
