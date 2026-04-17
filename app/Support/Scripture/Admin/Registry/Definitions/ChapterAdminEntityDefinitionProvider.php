<?php

namespace App\Support\Scripture\Admin\Registry\Definitions;

use App\Models\Chapter;
use App\Support\Scripture\Admin\Registry\AdminEditMode;
use App\Support\Scripture\Admin\Registry\AdminEditModePolicy;
use App\Support\Scripture\Admin\Registry\AdminEntityDefinition;
use App\Support\Scripture\Admin\Registry\AdminMethodFamily;
use App\Support\Scripture\Admin\Registry\AdminRegionDefinition;
use App\Support\Scripture\Admin\Registry\AdminRegionMethodDefinition;

class ChapterAdminEntityDefinitionProvider extends AdminEntityDefinitionProvider
{
    public function key(): string
    {
        return 'chapter';
    }

    public function definition(): AdminEntityDefinition
    {
        return new AdminEntityDefinition(
            key: 'chapter',
            label: 'Chapter',
            primaryModel: Chapter::class,
            primaryTable: 'chapters',
            editModePolicy: new AdminEditModePolicy([
                AdminEditMode::CONTEXTUAL => [
                    'label' => 'Contextual Edit',
                    'status' => 'active',
                    'description' => 'Fast block-local editing from the public chapter surface.',
                    'warning' => null,
                ],
                AdminEditMode::FULL => [
                    'label' => 'Full Editorial Edit',
                    'status' => 'active',
                    'description' => 'Protected editor for chapter-owned editorial blocks.',
                    'warning' => null,
                ],
                AdminEditMode::CANONICAL => [
                    'label' => 'Canonical Protected Edit',
                    'status' => 'planned',
                    'description' => 'Future protected workflow for chapter identity and hierarchy.',
                    'warning' => 'Canonical chapter identity remains read-only in the current phase.',
                ],
            ]),
            fields: [
                'canonical_slug' => $this->canonicalField(
                    key: 'canonical_slug',
                    label: 'Chapter slug',
                    source: 'chapters.slug',
                ),
                'canonical_number' => $this->canonicalField(
                    key: 'canonical_number',
                    label: 'Chapter number',
                    source: 'chapters.number',
                ),
                'canonical_title' => $this->canonicalField(
                    key: 'canonical_title',
                    label: 'Chapter title',
                    source: 'chapters.title',
                ),
                ...$this->sharedRegisteredNoteBlockFields(),
            ],
            regions: [
                new AdminRegionDefinition(
                    key: 'page_intro',
                    label: 'Page intro',
                    surface: 'chapters.show',
                    description: 'Primary published introduction block shown above the grouped verse list.',
                    fieldKeys: array_keys($this->sharedRegisteredNoteBlockFields()),
                    contextualFieldKeys: [
                        'content_block_title',
                        'content_block_body',
                        'content_block_media_url',
                        'content_block_alt_text',
                    ],
                    fullFieldKeys: array_keys($this->sharedRegisteredNoteBlockFields()),
                    canonicalFieldKeys: [],
                    capabilityHint: 'intro',
                    helpText: 'Chapter intro is editorial block content, not canonical identity. Slug, number, and title stay on the separate identity workflow.',
                ),
                new AdminRegionDefinition(
                    key: 'content_blocks',
                    label: 'Published notes',
                    surface: 'chapters.show',
                    description: 'Chapter-owned editorial note blocks.',
                    fieldKeys: array_keys($this->sharedRegisteredNoteBlockFields()),
                    contextualFieldKeys: ['content_block_title', 'content_block_body'],
                    fullFieldKeys: array_keys($this->sharedRegisteredNoteBlockFields()),
                    capabilityHint: 'content_blocks',
                    helpText: 'Chapter uses the shared registered note workflow while keeping ownership scoped to the current chapter. Text, quote, and image blocks stay inside this surface; video remains protected.',
                    methods: [
                        new AdminRegionMethodDefinition(
                            family: AdminMethodFamily::CONTENT_BLOCK_CREATE,
                            editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                            label: 'Chapter content-block create',
                        ),
                        new AdminRegionMethodDefinition(
                            family: AdminMethodFamily::CONTENT_BLOCK_EDIT,
                            editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                            label: 'Chapter content-block edit',
                        ),
                        new AdminRegionMethodDefinition(
                            family: AdminMethodFamily::ORDERED_INSERTION,
                            editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                            label: 'Chapter ordered insertion',
                        ),
                        new AdminRegionMethodDefinition(
                            family: AdminMethodFamily::REORDER,
                            editModes: [AdminEditMode::FULL],
                            label: 'Chapter content-block reorder',
                            description: 'Uses the shared ordering resolver while Chapter stays scoped to registered text, quote, and image note blocks.',
                        ),
                    ],
                ),
            ],
            notes: 'Chapter now uses the shared registered note-block workflow while keeping canonical chapter identity outside the current edit surface.',
        );
    }
}
