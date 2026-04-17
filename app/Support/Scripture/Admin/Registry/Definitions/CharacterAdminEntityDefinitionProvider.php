<?php

namespace App\Support\Scripture\Admin\Registry\Definitions;

use App\Models\Character;
use App\Support\Scripture\Admin\Registry\AdminEditMode;
use App\Support\Scripture\Admin\Registry\AdminEditModePolicy;
use App\Support\Scripture\Admin\Registry\AdminEntityDefinition;
use App\Support\Scripture\Admin\Registry\AdminFieldClassification;
use App\Support\Scripture\Admin\Registry\AdminFieldDefinition;
use App\Support\Scripture\Admin\Registry\AdminFieldGroup;
use App\Support\Scripture\Admin\Registry\AdminRegionDefinition;

class CharacterAdminEntityDefinitionProvider extends AdminEntityDefinitionProvider
{
    public function key(): string
    {
        return 'character';
    }

    public function definition(): AdminEntityDefinition
    {
        return new AdminEntityDefinition(
            key: 'character',
            label: 'Character',
            primaryModel: Character::class,
            primaryTable: 'characters',
            editModePolicy: new AdminEditModePolicy([
                AdminEditMode::CONTEXTUAL => [
                    'label' => 'Contextual Edit',
                    'status' => 'disabled',
                    'description' => 'Character admin is paused while the active CMS scope stays focused on scripture pages.',
                    'warning' => 'Character editing is intentionally postponed and is not part of the active admin architecture for the next phase.',
                ],
                AdminEditMode::FULL => [
                    'label' => 'Full Editorial Edit',
                    'status' => 'disabled',
                    'description' => 'The proof-stage character editor is retained only as a postponed reference surface.',
                    'warning' => 'Character admin routes are disabled while books, chapters, verses, and supporting CMS infrastructure are cleaned up first.',
                ],
                AdminEditMode::CANONICAL => [
                    'label' => 'Canonical Protected Edit',
                    'status' => 'disabled',
                    'description' => 'Canonical character workflows remain outside the current cleanup scope.',
                    'warning' => 'Character remains postponed and does not have an active canonical protected route.',
                ],
            ]),
            fields: [
                'canonical_slug' => $this->canonicalField(
                    key: 'canonical_slug',
                    label: 'Character slug',
                    source: 'characters.slug',
                ),
                'canonical_name' => $this->canonicalField(
                    key: 'canonical_name',
                    label: 'Character name',
                    source: 'characters.name',
                ),
                'description' => new AdminFieldDefinition(
                    key: 'description',
                    label: 'Character description',
                    source: 'characters.description',
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
                    surface: 'characters.show',
                    description: 'Public editorial copy for the character page.',
                    fieldKeys: ['description'],
                    contextualFieldKeys: ['description'],
                    fullFieldKeys: ['description'],
                    capabilityHint: 'copy',
                ),
                new AdminRegionDefinition(
                    key: 'content_blocks',
                    label: 'Character content',
                    surface: 'characters.show',
                    description: 'Character-owned editorial note blocks.',
                    fieldKeys: array_keys($this->sharedTextBlockFields()),
                    contextualFieldKeys: ['content_block_title', 'content_block_body'],
                    fullFieldKeys: array_keys($this->sharedTextBlockFields()),
                    capabilityHint: 'content_blocks',
                ),
            ],
            notes: 'Character admin is currently postponed and retained only as a proof-stage schema sketch outside the active admin surface.',
        );
    }
}
