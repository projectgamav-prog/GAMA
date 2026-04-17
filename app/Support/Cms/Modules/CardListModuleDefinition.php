<?php

namespace App\Support\Cms\Modules;

use App\Support\Navigation\LinkTarget;

class CardListModuleDefinition extends CmsModuleDefinition
{
    public function key(): string
    {
        return 'card_list';
    }

    /**
     * @return array{data: array<string, mixed>, config: array<string, mixed>}
     */
    public function defaults(): array
    {
        return [
            'data' => [
                'eyebrow' => '',
                'title' => 'Guided cards',
                'intro' => '',
                'items' => [[
                    'eyebrow' => '',
                    'title' => 'New card',
                    'body' => '',
                    'cta_label' => 'Learn more',
                    'target' => [
                        'type' => 'url',
                        'value' => [
                            'url' => '',
                        ],
                        'behavior' => [
                            'new_tab' => false,
                        ],
                    ],
                ]],
            ],
            'config' => [
                'layout' => 'cards',
                'columns' => 'two',
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
        $items = $data['items'] ?? null;

        if (! is_array($items) || $items === []) {
            $errors['data_json.items'] = 'Add at least one card.';

            return $errors;
        }

        foreach ($items as $index => $item) {
            if (! is_array($item)) {
                $errors["data_json.items.{$index}"] = 'Each card must be a valid card object.';

                continue;
            }

            $title = trim((string) ($item['title'] ?? ''));

            if ($title === '') {
                $errors["data_json.items.{$index}.title"] = 'Card title is required.';
            }

            $target = CmsLinkTargetNormalizer::normalize($item);

            if ($target !== null) {
                foreach (LinkTarget::validate($target) as $message) {
                    $errors["data_json.items.{$index}.target.value"] = $message;
                    break;
                }
            }
        }

        if (! in_array($config['layout'] ?? null, ['cards', 'list'], true)) {
            $errors['config_json.layout'] = 'Choose a valid card-list layout.';
        }

        if (! in_array($config['columns'] ?? null, ['one', 'two', 'three'], true)) {
            $errors['config_json.columns'] = 'Choose a valid card-list column count.';
        }

        return $errors;
    }
}
