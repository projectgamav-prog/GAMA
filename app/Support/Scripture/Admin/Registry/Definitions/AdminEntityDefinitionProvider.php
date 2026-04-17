<?php

namespace App\Support\Scripture\Admin\Registry\Definitions;

use App\Support\Scripture\Admin\Registry\AdminEditMode;
use App\Support\Scripture\Admin\Registry\AdminFieldClassification;
use App\Support\Scripture\Admin\Registry\AdminFieldDefinition;
use App\Support\Scripture\Admin\Registry\AdminFieldGroup;
use App\Support\Scripture\Admin\Registry\AdminEntityDefinition;
use App\Support\Scripture\Admin\Registry\Definitions\Shared\RegisteredNoteBlockFieldDefinitions;
use App\Support\Scripture\Admin\Registry\Definitions\Shared\TextBlockFieldDefinitions;

abstract class AdminEntityDefinitionProvider
{
    abstract public function key(): string;

    abstract public function definition(): AdminEntityDefinition;

    protected function canonicalField(
        string $key,
        string $label,
        string $source,
        ?string $helpText = null,
    ): AdminFieldDefinition {
        return new AdminFieldDefinition(
            key: $key,
            label: $label,
            source: $source,
            type: 'text',
            validationRules: [],
            editModes: [AdminEditMode::CANONICAL],
            classification: AdminFieldClassification::CANONICAL,
            group: AdminFieldGroup::IDENTITY,
            readOnly: true,
            helpText: $helpText,
        );
    }

    /**
     * @return array<string, AdminFieldDefinition>
     */
    protected function sharedTextBlockFields(): array
    {
        return TextBlockFieldDefinitions::all();
    }

    /**
     * @return array<string, AdminFieldDefinition>
     */
    protected function sharedRegisteredNoteBlockFields(): array
    {
        return RegisteredNoteBlockFieldDefinitions::all();
    }
}
