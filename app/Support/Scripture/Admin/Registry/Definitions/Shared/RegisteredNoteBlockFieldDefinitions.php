<?php

namespace App\Support\Scripture\Admin\Registry\Definitions\Shared;

use App\Support\Scripture\Admin\Registry\AdminEditMode;
use App\Support\Scripture\Admin\Registry\AdminFieldClassification;
use App\Support\Scripture\Admin\Registry\AdminFieldDefinition;
use App\Support\Scripture\Admin\Registry\AdminFieldGroup;
use App\Support\Scripture\Admin\RegisteredNoteContentBlockSchema;

class RegisteredNoteBlockFieldDefinitions
{
    /**
     * @return array<string, AdminFieldDefinition>
     */
    public static function all(): array
    {
        return [
            'content_block_type' => new AdminFieldDefinition(
                key: 'content_block_type',
                label: 'Registered block type',
                source: 'content_blocks.block_type',
                type: 'select',
                validationRules: ['required', RegisteredNoteContentBlockSchema::typeValidationRule()],
                editModes: [AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                options: RegisteredNoteContentBlockSchema::editableTypes(),
                helpText: 'Only registered note blocks belong here. Text, quote, and image remain in this shared block workflow, while video stays on protected media flows.',
            ),
            'content_block_media_url' => new AdminFieldDefinition(
                key: 'content_block_media_url',
                label: 'Image source URL',
                source: 'content_blocks.data_json->url',
                type: 'text',
                validationRules: ['required_if:block_type,image', 'nullable', 'string', 'max:2048'],
                editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                helpText: 'Required when the registered note block type is image.',
            ),
            'content_block_alt_text' => new AdminFieldDefinition(
                key: 'content_block_alt_text',
                label: 'Image alt text',
                source: 'content_blocks.data_json->alt',
                type: 'text',
                validationRules: ['nullable', 'string', 'max:255'],
                editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                helpText: 'Optional accessibility text for registered image note blocks.',
            ),
            ...TextBlockFieldDefinitions::all(),
        ];
    }
}
