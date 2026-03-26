<?php

namespace App\Support\Scripture\Admin\Registry;

readonly class AdminRegionMethodDefinition
{
    /**
     * @param  list<string>  $editModes
     */
    public function __construct(
        public string $family,
        public array $editModes,
        public ?string $label = null,
        public ?string $description = null,
    ) {
        AdminMethodFamily::assertValid($this->family);

        foreach ($this->editModes as $mode) {
            AdminEditMode::assertValid($mode);
        }
    }

    public function labelFor(AdminRegionDefinition $region): string
    {
        if ($this->label !== null) {
            return $this->label;
        }

        return match ($this->family) {
            AdminMethodFamily::CONTENT_BLOCK_CREATE => "{$region->label} create",
            AdminMethodFamily::CONTENT_BLOCK_EDIT => "{$region->label} edit",
            AdminMethodFamily::ORDERED_INSERTION => "{$region->label} ordered insertion",
            AdminMethodFamily::REORDER => "{$region->label} reorder",
            AdminMethodFamily::MEDIA_SLOT_EDIT => "{$region->label} edit",
            AdminMethodFamily::CANONICAL_DISPLAY => "{$region->label} display",
            default => "{$region->label} method",
        };
    }

    public function descriptionFor(AdminRegionDefinition $region): string
    {
        if ($this->description !== null) {
            return $this->description;
        }

        return match ($this->family) {
            AdminMethodFamily::CONTENT_BLOCK_CREATE => "Creates registered content blocks inside the {$region->label} contract.",
            AdminMethodFamily::CONTENT_BLOCK_EDIT => "Edits registered blocks already attached to the {$region->label} contract.",
            AdminMethodFamily::ORDERED_INSERTION => "Inserts new registered blocks into {$region->label} at an explicit visual position.",
            AdminMethodFamily::REORDER => "Reorders registered items inside the {$region->label} contract through stable ordering rules.",
            AdminMethodFamily::MEDIA_SLOT_EDIT => "Assigns registered media into the {$region->label} contract.",
            AdminMethodFamily::CANONICAL_DISPLAY => "Shows the protected {$region->label} contract as canonical reference.",
            default => "Runs a registered admin method on the {$region->label} contract.",
        };
    }
}
