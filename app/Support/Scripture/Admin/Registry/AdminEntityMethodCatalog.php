<?php

namespace App\Support\Scripture\Admin\Registry;

class AdminEntityMethodCatalog
{
    public function __construct(
        private readonly AdminEntityDefinition $entity,
    ) {}

    /**
     * @return list<AdminMethodDefinition>
     */
    public function methods(): array
    {
        return [
            ...$this->fieldMethods(),
            ...$this->regionMethods(),
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function methodsToArray(): array
    {
        return collect($this->methods())
            ->map(fn (AdminMethodDefinition $method) => $method->toArray())
            ->values()
            ->all();
    }

    /**
     * @return array<string, list<array<string, mixed>>>
     */
    public function methodsByModeToArray(): array
    {
        $grouped = [
            AdminEditMode::CONTEXTUAL => [],
            AdminEditMode::FULL => [],
            AdminEditMode::CANONICAL => [],
        ];

        foreach ($this->methods() as $method) {
            foreach ($method->editModes as $mode) {
                $grouped[$mode][] = $method->toArray();
            }
        }

        return $grouped;
    }

    /**
     * @return list<AdminMethodDefinition>
     */
    private function fieldMethods(): array
    {
        return collect($this->entity->fields)
            ->map(function (AdminFieldDefinition $field): AdminMethodDefinition {
                $family = $this->fieldMethodFamily($field);
                $region = $this->regionForField($field->key);

                return new AdminMethodDefinition(
                    key: "field.{$field->key}",
                    family: $family,
                    label: $this->fieldMethodLabel($field, $family),
                    description: $this->fieldMethodDescription($field, $family),
                    scope: 'field',
                    editModes: $field->editModes,
                    fieldKeys: [$field->key],
                    regionKey: $region?->key,
                    surface: $region?->surface,
                    capabilityHint: $region?->capabilityHint,
                );
            })
            ->values()
            ->all();
    }

    /**
     * @return list<AdminMethodDefinition>
     */
    private function regionMethods(): array
    {
        return collect($this->entity->regions)
            ->flatMap(function (AdminRegionDefinition $region): array {
                return collect($region->methods)
                    ->map(fn (AdminRegionMethodDefinition $method) => new AdminMethodDefinition(
                        key: "region.{$region->key}.{$method->family}",
                        family: $method->family,
                        label: $method->labelFor($region),
                        description: $method->descriptionFor($region),
                        scope: 'region',
                        editModes: $method->editModes,
                        fieldKeys: $region->fieldKeys,
                        regionKey: $region->key,
                        surface: $region->surface,
                        capabilityHint: $region->capabilityHint,
                    ))
                    ->values()
                    ->all();
            })
            ->values()
            ->all();
    }

    private function fieldMethodFamily(AdminFieldDefinition $field): string
    {
        if ($field->classification === AdminFieldClassification::CANONICAL
            && $field->readOnly) {
            return AdminMethodFamily::CANONICAL_DISPLAY;
        }

        return match ($field->type) {
            'textarea' => AdminMethodFamily::LONG_TEXT_EDIT,
            'integer' => AdminMethodFamily::NUMBER_FIELD_EDIT,
            'select' => AdminMethodFamily::CHOICE_FIELD_EDIT,
            'boolean' => AdminMethodFamily::TOGGLE_FIELD_EDIT,
            'relation' => AdminMethodFamily::RELATION_FIELD_EDIT,
            default => AdminMethodFamily::TEXT_FIELD_EDIT,
        };
    }

    private function fieldMethodLabel(
        AdminFieldDefinition $field,
        string $family,
    ): string {
        return $family === AdminMethodFamily::CANONICAL_DISPLAY
            ? "{$field->label} display"
            : "{$field->label} edit";
    }

    private function fieldMethodDescription(
        AdminFieldDefinition $field,
        string $family,
    ): string {
        return match ($family) {
            AdminMethodFamily::CANONICAL_DISPLAY => "Displays the protected {$field->label} value from {$field->source} inside the canonical workflow.",
            AdminMethodFamily::LONG_TEXT_EDIT => "Edits {$field->label} from {$field->source} through a long-text method.",
            AdminMethodFamily::NUMBER_FIELD_EDIT => "Edits {$field->label} from {$field->source} through a numeric method.",
            AdminMethodFamily::CHOICE_FIELD_EDIT => "Edits {$field->label} from {$field->source} through a registered choice method.",
            AdminMethodFamily::TOGGLE_FIELD_EDIT => "Edits {$field->label} from {$field->source} through a boolean toggle method.",
            AdminMethodFamily::RELATION_FIELD_EDIT => "Edits {$field->label} from {$field->source} through a related-record picker method.",
            default => "Edits {$field->label} from {$field->source} through a registered text method.",
        };
    }

    private function regionForField(string $fieldKey): ?AdminRegionDefinition
    {
        foreach ($this->entity->regions as $region) {
            if (in_array($fieldKey, $region->fieldKeys, true)) {
                return $region;
            }
        }

        return null;
    }
}
