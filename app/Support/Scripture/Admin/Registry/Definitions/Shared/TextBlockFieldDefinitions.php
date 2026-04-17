<?php

namespace App\Support\Scripture\Admin\Registry\Definitions\Shared;

use App\Support\Scripture\Admin\Registry\AdminEditMode;
use App\Support\Scripture\Admin\Registry\AdminFieldClassification;
use App\Support\Scripture\Admin\Registry\AdminFieldDefinition;
use App\Support\Scripture\Admin\Registry\AdminFieldGroup;

class TextBlockFieldDefinitions
{
    /**
     * @return array<string, AdminFieldDefinition>
     */
    public static function all(): array
    {
        return [
            'content_block_region' => new AdminFieldDefinition(
                key: 'content_block_region',
                label: 'Block region',
                source: 'content_blocks.region',
                type: 'text',
                validationRules: ['required', 'string', 'max:100'],
                editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                helpText: 'Entity-scoped region key for registered note surfaces. Keep the meaning intentional for each entity.',
            ),
            'content_block_title' => new AdminFieldDefinition(
                key: 'content_block_title',
                label: 'Block title',
                source: 'content_blocks.title',
                type: 'text',
                validationRules: ['nullable', 'string', 'max:255'],
                editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                helpText: 'Optional heading shown when the entity surface presents a titled note block.',
            ),
            'content_block_body' => new AdminFieldDefinition(
                key: 'content_block_body',
                label: 'Block body',
                source: 'content_blocks.body',
                type: 'textarea',
                validationRules: ['required', 'string'],
                editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                helpText: 'Primary editorial copy for the registered note block.',
            ),
            'content_block_sort_order' => new AdminFieldDefinition(
                key: 'content_block_sort_order',
                label: 'Block sort order',
                source: 'content_blocks.sort_order',
                type: 'integer',
                validationRules: ['required', 'integer', 'min:0'],
                editModes: [AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                helpText: 'Lower numbers render earlier. Shared ordering services normalize and shift later blocks when needed.',
            ),
            'content_block_status' => new AdminFieldDefinition(
                key: 'content_block_status',
                label: 'Block status',
                source: 'content_blocks.status',
                type: 'select',
                validationRules: ['required', 'in:draft,published'],
                editModes: [AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                options: ['draft', 'published'],
                helpText: 'Published blocks render publicly. Draft blocks remain protected in admin.',
            ),
        ];
    }
}
