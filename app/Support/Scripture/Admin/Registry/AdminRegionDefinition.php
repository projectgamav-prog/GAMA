<?php

namespace App\Support\Scripture\Admin\Registry;

readonly class AdminRegionDefinition
{
    /**
     * @param  list<string>  $fieldKeys
     * @param  list<string>  $contextualFieldKeys
     * @param  list<string>  $fullFieldKeys
     * @param  list<string>  $canonicalFieldKeys
     */
    public function __construct(
        public string $key,
        public string $label,
        public string $surface,
        public string $description,
        public array $fieldKeys = [],
        public array $contextualFieldKeys = [],
        public array $fullFieldKeys = [],
        public array $canonicalFieldKeys = [],
        public ?string $capabilityHint = null,
        public ?string $helpText = null,
    ) {}

    /**
     * @param  array<string, AdminFieldDefinition>  $fieldMap
     * @return array<string, mixed>
     */
    public function toArray(array $fieldMap): array
    {
        return [
            'key' => $this->key,
            'label' => $this->label,
            'surface' => $this->surface,
            'description' => $this->description,
            'field_keys' => $this->fieldKeys,
            'contextual_field_keys' => $this->contextualFieldKeys,
            'full_field_keys' => $this->fullFieldKeys,
            'canonical_field_keys' => $this->canonicalFieldKeys,
            'supported_modes' => $this->supportedModes(),
            'capability_hint' => $this->capabilityHint,
            'help_text' => $this->helpText,
            'fields' => $this->resolveFields($fieldMap, $this->fieldKeys),
            'contextual_fields' => $this->resolveFields($fieldMap, $this->contextualFieldKeys),
            'full_fields' => $this->resolveFields($fieldMap, $this->fullFieldKeys),
            'canonical_fields' => $this->resolveFields($fieldMap, $this->canonicalFieldKeys),
        ];
    }

    /**
     * @return list<string>
     */
    private function supportedModes(): array
    {
        $modes = [];

        if ($this->contextualFieldKeys !== []) {
            $modes[] = AdminEditMode::CONTEXTUAL;
        }

        if ($this->fullFieldKeys !== []) {
            $modes[] = AdminEditMode::FULL;
        }

        if ($this->canonicalFieldKeys !== []) {
            $modes[] = AdminEditMode::CANONICAL;
        }

        return $modes;
    }

    /**
     * @param  array<string, AdminFieldDefinition>  $fieldMap
     * @param  list<string>  $fieldKeys
     * @return list<array<string, mixed>>
     */
    private function resolveFields(array $fieldMap, array $fieldKeys): array
    {
        return collect($fieldKeys)
            ->map(function (string $fieldKey) use ($fieldMap): ?array {
                if (! array_key_exists($fieldKey, $fieldMap)) {
                    return null;
                }

                return $fieldMap[$fieldKey]->toArray();
            })
            ->filter()
            ->values()
            ->all();
    }
}
