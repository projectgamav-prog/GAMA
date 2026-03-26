<?php

namespace App\Support\Scripture\Admin\Registry;

readonly class AdminMethodDefinition
{
    /**
     * @param  list<string>  $editModes
     * @param  list<string>  $fieldKeys
     */
    public function __construct(
        public string $key,
        public string $family,
        public string $label,
        public string $description,
        public string $scope,
        public array $editModes,
        public array $fieldKeys = [],
        public ?string $regionKey = null,
        public ?string $surface = null,
        public ?string $capabilityHint = null,
    ) {
        AdminMethodFamily::assertValid($this->family);

        if (! in_array($this->scope, ['field', 'region'], true)) {
            throw new \InvalidArgumentException("Unsupported admin method scope [{$this->scope}].");
        }

        foreach ($this->editModes as $mode) {
            AdminEditMode::assertValid($mode);
        }
    }

    public function availableIn(string $mode): bool
    {
        AdminEditMode::assertValid($mode);

        return in_array($mode, $this->editModes, true);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        $family = AdminMethodFamily::metadata($this->family);

        return [
            'key' => $this->key,
            'family' => $this->family,
            'family_label' => $family['label'],
            'family_description' => $family['description'],
            'label' => $this->label,
            'description' => $this->description,
            'scope' => $this->scope,
            'edit_modes' => $this->editModes,
            'field_keys' => $this->fieldKeys,
            'region_key' => $this->regionKey,
            'surface' => $this->surface,
            'capability_hint' => $this->capabilityHint,
            'ui_hint' => $family['ui_hint'],
            'content_aware' => $family['content_aware'],
        ];
    }
}
