<?php

namespace App\Support\Cms\Modules;

use App\Support\Navigation\LinkTarget;

class ButtonGroupModuleDefinition extends CmsModuleDefinition
{
    public function key(): string
    {
        return 'button_group';
    }

    /**
     * @return array{data: array<string, mixed>, config: array<string, mixed>}
     */
    public function defaults(): array
    {
        return [
            'data' => [
                'buttons' => [[
                    'label' => 'New button',
                    'target' => [
                        'type' => 'url',
                        'value' => [
                            'url' => '',
                        ],
                        'behavior' => [
                            'new_tab' => false,
                        ],
                    ],
                    'variant' => 'default',
                    'open_in_new_tab' => false,
                ]],
            ],
            'config' => [
                'layout' => 'auto',
                'alignment' => 'stretch',
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $config
     * @return array<string, string>
     */
    public function validationErrors(array $data, array $config): array
    {
        $errors = [];
        $buttons = $data['buttons'] ?? null;

        if (! is_array($buttons) || $buttons === []) {
            $errors['data_json.buttons'] = 'Add at least one button.';

            return $errors;
        }

        foreach ($buttons as $index => $button) {
            if (! is_array($button)) {
                $errors["data_json.buttons.{$index}"] = 'Each button must be a valid button object.';

                continue;
            }

            $label = trim((string) ($button['label'] ?? ''));
            $variant = $button['variant'] ?? null;
            $target = CmsLinkTargetNormalizer::normalize($button);

            if ($label === '') {
                $errors["data_json.buttons.{$index}.label"] = 'Button label is required.';
            }

            if ($target === null) {
                $errors["data_json.buttons.{$index}.target.type"] = 'Choose a valid destination type.';
            } else {
                foreach (LinkTarget::validate($target) as $message) {
                    $errors["data_json.buttons.{$index}.target.value"] = $message;
                    break;
                }
            }

            if (! in_array($variant, ['default', 'secondary', 'outline', 'ghost'], true)) {
                $errors["data_json.buttons.{$index}.variant"] = 'Choose a valid button style.';
            }
        }

        if (! in_array($config['layout'] ?? null, ['auto', 'stack', 'inline'], true)) {
            $errors['config_json.layout'] = 'Choose a valid button layout.';
        }

        if (! in_array($config['alignment'] ?? null, ['start', 'center', 'end', 'stretch'], true)) {
            $errors['config_json.alignment'] = 'Choose a valid button alignment.';
        }

        return $errors;
    }
}
