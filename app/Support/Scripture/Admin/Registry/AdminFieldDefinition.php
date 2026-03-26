<?php

namespace App\Support\Scripture\Admin\Registry;

readonly class AdminFieldDefinition
{
    /**
     * @param  list<string>  $validationRules
     * @param  list<string>  $editModes
     * @param  list<string>|null  $options
     */
    public function __construct(
        public string $key,
        public string $label,
        public string $source,
        public string $type,
        public array $validationRules,
        public array $editModes,
        public string $classification,
        public string $group,
        public bool $readOnly = false,
        public ?array $options = null,
        public ?string $helpText = null,
        public ?string $visibilityRule = null,
    ) {
        AdminFieldClassification::assertValid($this->classification);
        AdminFieldGroup::assertValid($this->group);

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
     * @return list<string>
     */
    public function validationRules(): array
    {
        return $this->validationRules;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'key' => $this->key,
            'label' => $this->label,
            'source' => $this->source,
            'type' => $this->type,
            'validation_rules' => $this->validationRules,
            'edit_modes' => $this->editModes,
            'classification' => $this->classification,
            'group' => $this->group,
            'read_only' => $this->readOnly,
            'options' => $this->options,
            'help_text' => $this->helpText,
            'visibility_rule' => $this->visibilityRule,
        ];
    }
}
