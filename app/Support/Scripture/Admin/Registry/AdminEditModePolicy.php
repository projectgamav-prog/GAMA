<?php

namespace App\Support\Scripture\Admin\Registry;

readonly class AdminEditModePolicy
{
    /**
     * @param  array<string, array{label: string, status: string, description: string, warning: string|null}>  $modes
     */
    public function __construct(
        public array $modes,
    ) {
        foreach (array_keys($this->modes) as $mode) {
            AdminEditMode::assertValid($mode);
        }
    }

    /**
     * @return array<string, array{key: string, label: string, status: string, description: string, warning: string|null}>
     */
    public function toArray(): array
    {
        return collect($this->modes)
            ->mapWithKeys(fn (array $mode, string $key) => [
                $key => [
                    'key' => $key,
                    'label' => $mode['label'],
                    'status' => $mode['status'],
                    'description' => $mode['description'],
                    'warning' => $mode['warning'],
                ],
            ])
            ->all();
    }
}
