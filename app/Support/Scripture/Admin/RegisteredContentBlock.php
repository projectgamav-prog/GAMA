<?php

namespace App\Support\Scripture\Admin;

use App\Models\ContentBlock;
use Illuminate\Database\Eloquent\Model;

class RegisteredContentBlock
{
    /**
     * Determine whether the block belongs to the given owner model.
     */
    public static function owns(Model $owner, ContentBlock $contentBlock): bool
    {
        return $contentBlock->parent_type === $owner->getMorphClass()
            && (int) $contentBlock->parent_id === (int) $owner->getKey();
    }

    /**
     * Determine whether the block is editable for the given owner and type set.
     *
     * @param  list<string>  $editableTypes
     */
    public static function isEditableFor(
        Model $owner,
        ContentBlock $contentBlock,
        array $editableTypes,
    ): bool {
        return self::owns($owner, $contentBlock)
            && in_array($contentBlock->block_type, $editableTypes, true);
    }

    /**
     * Abort when the block is not editable for the given owner and type set.
     *
     * @param  list<string>  $editableTypes
     */
    public static function abortUnlessEditableFor(
        Model $owner,
        ContentBlock $contentBlock,
        array $editableTypes,
    ): void {
        abort_unless(
            self::isEditableFor($owner, $contentBlock, $editableTypes),
            404,
        );
    }

    /**
     * Determine whether the block can act as a contextual insertion anchor.
     *
     * @param  list<string>  $editableTypes
     */
    public static function isInsertionAnchorFor(
        Model $owner,
        ContentBlock $contentBlock,
        array $editableTypes,
    ): bool {
        return self::isEditableFor($owner, $contentBlock, $editableTypes)
            && $contentBlock->status === 'published';
    }

    /**
     * Abort when the block cannot act as a contextual insertion anchor.
     *
     * @param  list<string>  $editableTypes
     */
    public static function abortUnlessInsertionAnchorFor(
        Model $owner,
        ContentBlock $contentBlock,
        array $editableTypes,
    ): void {
        abort_unless(
            self::isInsertionAnchorFor($owner, $contentBlock, $editableTypes),
            404,
        );
    }

    /**
     * Build persisted attributes for content-block creation.
     *
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    public static function createAttributes(
        array $validated,
        ?string $forcedBlockType = null,
        bool $includeDataJson = false,
    ): array {
        $blockType = self::resolvedBlockType($validated, $forcedBlockType);
        $attributes = [
            'region' => trim((string) $validated['region']),
            'block_type' => $blockType,
            'title' => self::nullableString($validated['title'] ?? null),
            'body' => trim((string) $validated['body']),
            'sort_order' => $validated['sort_order'] ?? null,
            'status' => $validated['status'],
        ];

        if ($includeDataJson) {
            $attributes['data_json'] = RegisteredContentBlockDataJson::fromValidated(
                $validated,
                $blockType,
            );
        }

        return $attributes;
    }

    /**
     * Build persisted attributes for content-block updates.
     *
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    public static function updateAttributes(
        array $validated,
        ?string $forcedBlockType = null,
        bool $allowBlockTypeUpdate = true,
        bool $includeDataJson = false,
    ): array {
        $blockType = self::resolvedBlockType($validated, $forcedBlockType);
        $attributes = [
            'region' => trim((string) $validated['region']),
            'title' => self::nullableString($validated['title'] ?? null),
            'body' => trim((string) $validated['body']),
            'sort_order' => $validated['sort_order'] ?? null,
            'status' => $validated['status'],
        ];

        if ($allowBlockTypeUpdate) {
            $attributes['block_type'] = $blockType;
        }

        if ($includeDataJson) {
            $attributes['data_json'] = RegisteredContentBlockDataJson::fromValidated(
                $validated,
                $blockType,
            );
        }

        return $attributes;
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    private static function resolvedBlockType(
        array $validated,
        ?string $forcedBlockType = null,
    ): string {
        if ($forcedBlockType !== null) {
            return $forcedBlockType;
        }

        return trim((string) ($validated['block_type'] ?? ''));
    }

    private static function nullableString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }
}
