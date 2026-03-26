<?php

namespace App\Support\Scripture\Admin;

use App\Models\ContentBlock;
use Illuminate\Database\Eloquent\Model;

class EditableTextNoteBlock
{
    /**
     * Determine whether the block belongs to the given parent model.
     */
    public static function owns(Model $owner, ContentBlock $contentBlock): bool
    {
        return $contentBlock->parent_type === $owner->getMorphClass()
            && (int) $contentBlock->parent_id === (int) $owner->getKey();
    }

    /**
     * Determine whether the block is an editable text note for the given parent.
     */
    public static function isEditableFor(Model $owner, ContentBlock $contentBlock): bool
    {
        return self::owns($owner, $contentBlock)
            && $contentBlock->block_type === 'text';
    }

    /**
     * Abort when the block is not an editable text note for the given parent.
     */
    public static function abortUnlessEditableFor(
        Model $owner,
        ContentBlock $contentBlock,
    ): void {
        abort_unless(self::isEditableFor($owner, $contentBlock), 404);
    }

    /**
     * Build persisted attributes for a newly-created editable text note block.
     *
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    public static function createAttributes(array $validated): array
    {
        return [
            'region' => trim((string) $validated['region']),
            'block_type' => 'text',
            'title' => self::nullableString($validated['title'] ?? null),
            'body' => trim((string) $validated['body']),
            'data_json' => null,
            'sort_order' => $validated['sort_order'],
            'status' => $validated['status'],
        ];
    }

    /**
     * Build persisted attributes for an editable text note block update.
     *
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    public static function updateAttributes(array $validated): array
    {
        return [
            'region' => trim((string) $validated['region']),
            'title' => self::nullableString($validated['title'] ?? null),
            'body' => trim((string) $validated['body']),
            'sort_order' => $validated['sort_order'],
            'status' => $validated['status'],
        ];
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
