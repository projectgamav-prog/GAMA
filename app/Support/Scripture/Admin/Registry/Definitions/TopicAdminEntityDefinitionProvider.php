<?php

namespace App\Support\Scripture\Admin\Registry\Definitions;

use App\Models\Topic;
use App\Support\Scripture\Admin\Registry\AdminEditMode;
use App\Support\Scripture\Admin\Registry\AdminEditModePolicy;
use App\Support\Scripture\Admin\Registry\AdminEntityDefinition;
use App\Support\Scripture\Admin\Registry\AdminFieldClassification;
use App\Support\Scripture\Admin\Registry\AdminFieldDefinition;
use App\Support\Scripture\Admin\Registry\AdminFieldGroup;
use App\Support\Scripture\Admin\Registry\AdminRegionDefinition;

class TopicAdminEntityDefinitionProvider extends AdminEntityDefinitionProvider
{
    public function key(): string
    {
        return 'topic';
    }

    public function definition(): AdminEntityDefinition
    {
        return new AdminEntityDefinition(
            key: 'topic',
            label: 'Topic',
            primaryModel: Topic::class,
            primaryTable: 'topics',
            editModePolicy: new AdminEditModePolicy([
                AdminEditMode::CONTEXTUAL => [
                    'label' => 'Contextual Edit',
                    'status' => 'disabled',
                    'description' => 'Topic admin is paused while the active CMS scope stays focused on scripture pages.',
                    'warning' => 'Topic editing is intentionally postponed and is not part of the active admin architecture for the next phase.',
                ],
                AdminEditMode::FULL => [
                    'label' => 'Full Editorial Edit',
                    'status' => 'disabled',
                    'description' => 'The proof-stage topic editor is retained only as a postponed reference surface.',
                    'warning' => 'Topic admin routes are disabled while books, chapters, verses, and supporting CMS infrastructure are cleaned up first.',
                ],
                AdminEditMode::CANONICAL => [
                    'label' => 'Canonical Protected Edit',
                    'status' => 'disabled',
                    'description' => 'Canonical topic workflows remain outside the current cleanup scope.',
                    'warning' => 'Topic remains postponed and does not have an active canonical protected route.',
                ],
            ]),
            fields: [
                'canonical_slug' => $this->canonicalField(
                    key: 'canonical_slug',
                    label: 'Topic slug',
                    source: 'topics.slug',
                ),
                'canonical_name' => $this->canonicalField(
                    key: 'canonical_name',
                    label: 'Topic name',
                    source: 'topics.name',
                ),
                'description' => new AdminFieldDefinition(
                    key: 'description',
                    label: 'Topic description',
                    source: 'topics.description',
                    type: 'textarea',
                    validationRules: ['nullable', 'string'],
                    editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                    classification: AdminFieldClassification::EDITORIAL,
                    group: AdminFieldGroup::EDITORIAL,
                ),
                ...$this->sharedTextBlockFields(),
            ],
            regions: [
                new AdminRegionDefinition(
                    key: 'description',
                    label: 'Description',
                    surface: 'topics.show',
                    description: 'Public editorial copy for the topic page.',
                    fieldKeys: ['description'],
                    contextualFieldKeys: ['description'],
                    fullFieldKeys: ['description'],
                    capabilityHint: 'copy',
                ),
                new AdminRegionDefinition(
                    key: 'content_blocks',
                    label: 'Topic content',
                    surface: 'topics.show',
                    description: 'Topic-owned editorial note blocks.',
                    fieldKeys: array_keys($this->sharedTextBlockFields()),
                    contextualFieldKeys: ['content_block_title', 'content_block_body'],
                    fullFieldKeys: array_keys($this->sharedTextBlockFields()),
                    capabilityHint: 'content_blocks',
                ),
            ],
            notes: 'Topic admin is currently postponed and retained only as a proof-stage schema sketch outside the active admin surface.',
        );
    }
}
