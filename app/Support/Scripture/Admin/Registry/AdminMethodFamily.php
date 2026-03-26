<?php

namespace App\Support\Scripture\Admin\Registry;

class AdminMethodFamily
{
    public const TEXT_FIELD_EDIT = 'text_field_edit';

    public const LONG_TEXT_EDIT = 'long_text_edit';

    public const NUMBER_FIELD_EDIT = 'number_field_edit';

    public const CHOICE_FIELD_EDIT = 'choice_field_edit';

    public const TOGGLE_FIELD_EDIT = 'toggle_field_edit';

    public const RELATION_FIELD_EDIT = 'relation_field_edit';

    public const CANONICAL_DISPLAY = 'canonical_display';

    public const CONTENT_BLOCK_CREATE = 'content_block_create';

    public const CONTENT_BLOCK_EDIT = 'content_block_edit';

    public const ORDERED_INSERTION = 'ordered_insertion';

    public const REORDER = 'reorder';

    public const MEDIA_SLOT_EDIT = 'media_slot_edit';

    /**
     * @return list<string>
     */
    public static function all(): array
    {
        return [
            self::TEXT_FIELD_EDIT,
            self::LONG_TEXT_EDIT,
            self::NUMBER_FIELD_EDIT,
            self::CHOICE_FIELD_EDIT,
            self::TOGGLE_FIELD_EDIT,
            self::RELATION_FIELD_EDIT,
            self::CANONICAL_DISPLAY,
            self::CONTENT_BLOCK_CREATE,
            self::CONTENT_BLOCK_EDIT,
            self::ORDERED_INSERTION,
            self::REORDER,
            self::MEDIA_SLOT_EDIT,
        ];
    }

    /**
     * @return array{label: string, description: string, ui_hint: string, content_aware: bool}
     */
    public static function metadata(string $family): array
    {
        return match ($family) {
            self::TEXT_FIELD_EDIT => [
                'label' => 'Text field edit',
                'description' => 'Edits registered short-form textual values through an intentional field method.',
                'ui_hint' => 'field_form',
                'content_aware' => true,
            ],
            self::LONG_TEXT_EDIT => [
                'label' => 'Long-text edit',
                'description' => 'Edits registered long-form editorial copy through a textarea-oriented method.',
                'ui_hint' => 'field_form',
                'content_aware' => true,
            ],
            self::NUMBER_FIELD_EDIT => [
                'label' => 'Number field edit',
                'description' => 'Edits registered numeric values through a constrained number method.',
                'ui_hint' => 'field_form',
                'content_aware' => false,
            ],
            self::CHOICE_FIELD_EDIT => [
                'label' => 'Choice field edit',
                'description' => 'Edits registered select/status values through a controlled option set.',
                'ui_hint' => 'choice_picker',
                'content_aware' => false,
            ],
            self::TOGGLE_FIELD_EDIT => [
                'label' => 'Toggle field edit',
                'description' => 'Edits registered boolean values through a true-or-false toggle method.',
                'ui_hint' => 'boolean_toggle',
                'content_aware' => false,
            ],
            self::RELATION_FIELD_EDIT => [
                'label' => 'Relation field edit',
                'description' => 'Edits registered relations by selecting an allowed related record.',
                'ui_hint' => 'relation_picker',
                'content_aware' => false,
            ],
            self::CANONICAL_DISPLAY => [
                'label' => 'Canonical display',
                'description' => 'Shows protected canonical values or structure without routine editorial editing.',
                'ui_hint' => 'read_only_card',
                'content_aware' => false,
            ],
            self::CONTENT_BLOCK_CREATE => [
                'label' => 'Content-block create',
                'description' => 'Creates registered content blocks inside intentional editorial regions.',
                'ui_hint' => 'collection_create',
                'content_aware' => true,
            ],
            self::CONTENT_BLOCK_EDIT => [
                'label' => 'Content-block edit',
                'description' => 'Edits registered content block content and supporting metadata.',
                'ui_hint' => 'collection_edit',
                'content_aware' => true,
            ],
            self::ORDERED_INSERTION => [
                'label' => 'Ordered insertion',
                'description' => 'Creates new content at an explicit visual insertion point instead of guessing sort order.',
                'ui_hint' => 'inline_insert',
                'content_aware' => true,
            ],
            self::REORDER => [
                'label' => 'Reorder',
                'description' => 'Changes the order of a registered collection through stable ordering rules.',
                'ui_hint' => 'ordered_collection',
                'content_aware' => false,
            ],
            self::MEDIA_SLOT_EDIT => [
                'label' => 'Media-slot edit',
                'description' => 'Assigns registered media into intentional public slots instead of free-form media markup.',
                'ui_hint' => 'collection_workspace',
                'content_aware' => false,
            ],
            default => throw new \InvalidArgumentException("Unsupported admin method family [{$family}]."),
        };
    }

    public static function assertValid(string $family): void
    {
        if (! in_array($family, self::all(), true)) {
            throw new \InvalidArgumentException("Unsupported admin method family [{$family}].");
        }
    }
}
