<?php

namespace App\Support\Scripture\Admin\Registry;

readonly class AdminEntityDefinition
{
    /**
     * @param  array<string, AdminFieldDefinition>  $fields
     * @param  list<AdminRegionDefinition>  $regions
     */
    public function __construct(
        public string $key,
        public string $label,
        public string $primaryModel,
        public string $primaryTable,
        public AdminEditModePolicy $editModePolicy,
        public array $fields,
        public array $regions,
        public ?string $notes = null,
    ) {}

    public function field(string $key): AdminFieldDefinition
    {
        if (! array_key_exists($key, $this->fields)) {
            throw new \InvalidArgumentException(
                "Admin field [{$key}] is not registered for entity [{$this->key}].",
            );
        }

        return $this->fields[$key];
    }

    /**
     * @return array<string, list<array<string, mixed>>>
     */
    public function fieldGroupsToArray(): array
    {
        $grouped = [
            AdminFieldGroup::IDENTITY => [],
            AdminFieldGroup::EDITORIAL => [],
            AdminFieldGroup::SUPPORTING => [],
        ];

        foreach ($this->fields as $field) {
            $grouped[$field->group][] = $field->toArray();
        }

        return $grouped;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        $methodCatalog = new AdminEntityMethodCatalog($this);

        return [
            'key' => $this->key,
            'label' => $this->label,
            'primary_model' => $this->primaryModel,
            'primary_table' => $this->primaryTable,
            'edit_modes' => $this->editModePolicy->toArray(),
            'notes' => $this->notes,
            'fields' => collect($this->fields)
                ->mapWithKeys(fn (AdminFieldDefinition $field, string $key) => [
                    $key => $field->toArray(),
                ])
                ->all(),
            'field_groups' => $this->fieldGroupsToArray(),
            'methods' => $methodCatalog->methodsToArray(),
            'methods_by_mode' => $methodCatalog->methodsByModeToArray(),
            'regions' => collect($this->regions)
                ->map(fn (AdminRegionDefinition $region) => $region->toArray($this->fields))
                ->values()
                ->all(),
        ];
    }
}
