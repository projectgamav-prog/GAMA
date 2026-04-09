<?php

namespace App\Support\Cms;

class CmsModuleRegistry
{
    /**
     * @return list<string>
     */
    public static function keys(): array
    {
        return ['rich_text', 'button_group', 'media'];
    }

    /**
     * @return array{data: array<string, mixed>, config: array<string, mixed>}
     */
    public static function defaults(string $moduleKey): array
    {
        return match ($moduleKey) {
            'rich_text' => [
                'data' => [
                    'html' => '<p>New rich text block.</p>',
                ],
                'config' => [
                    'align' => 'left',
                    'max_width' => 'content',
                ],
            ],
            'button_group' => [
                'data' => [
                    'buttons' => [[
                        'label' => 'New button',
                        'href' => '#',
                        'variant' => 'default',
                        'open_in_new_tab' => false,
                    ]],
                ],
                'config' => [
                    'layout' => 'auto',
                    'alignment' => 'stretch',
                ],
            ],
            'media' => [
                'data' => [
                    'media_type' => 'image',
                    'url' => '',
                    'alt_text' => null,
                    'caption' => null,
                ],
                'config' => [
                    'aspect_ratio' => 'auto',
                    'width' => 'wide',
                ],
            ],
            default => [
                'data' => [],
                'config' => [],
            ],
        };
    }

    /**
     * @return array{data: array<string, mixed>, config: array<string, mixed>}
     */
    public static function normalizedPayload(
        string $moduleKey,
        mixed $data,
        mixed $config,
    ): array {
        $defaults = self::defaults($moduleKey);

        return [
            'data' => array_replace_recursive(
                $defaults['data'],
                is_array($data) ? $data : [],
            ),
            'config' => array_replace_recursive(
                $defaults['config'],
                is_array($config) ? $config : [],
            ),
        ];
    }

    /**
     * @return array<string, string>
     */
    public static function validationErrors(
        ?string $moduleKey,
        mixed $data,
        mixed $config,
    ): array {
        if (! is_string($moduleKey) || ! in_array($moduleKey, self::keys(), true)) {
            return [
                'module_key' => 'Choose a valid CMS module.',
            ];
        }

        $payload = self::normalizedPayload($moduleKey, $data, $config);

        return match ($moduleKey) {
            'rich_text' => self::validateRichText($payload['data'], $payload['config']),
            'button_group' => self::validateButtonGroup($payload['data'], $payload['config']),
            'media' => self::validateMedia($payload['data'], $payload['config']),
            default => [],
        };
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $config
     * @return array<string, string>
     */
    private static function validateRichText(array $data, array $config): array
    {
        $errors = [];
        $html = trim((string) ($data['html'] ?? ''));

        if ($html === '') {
            $errors['data_json.html'] = 'Rich text content is required.';
        }

        if (! in_array($config['align'] ?? null, ['left', 'center', 'right'], true)) {
            $errors['config_json.align'] = 'Choose a valid text alignment.';
        }

        if (! in_array($config['max_width'] ?? null, ['content', 'wide', 'full'], true)) {
            $errors['config_json.max_width'] = 'Choose a valid rich text width.';
        }

        return $errors;
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $config
     * @return array<string, string>
     */
    private static function validateButtonGroup(array $data, array $config): array
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
            $href = trim((string) ($button['href'] ?? ''));
            $variant = $button['variant'] ?? null;

            if ($label === '') {
                $errors["data_json.buttons.{$index}.label"] = 'Button label is required.';
            }

            if ($href === '') {
                $errors["data_json.buttons.{$index}.href"] = 'Button destination is required.';
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

    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $config
     * @return array<string, string>
     */
    private static function validateMedia(array $data, array $config): array
    {
        $errors = [];
        $mediaType = $data['media_type'] ?? null;
        $url = trim((string) ($data['url'] ?? ''));

        if (! in_array($mediaType, ['image', 'video'], true)) {
            $errors['data_json.media_type'] = 'Choose a valid media type.';
        }

        if ($url === '') {
            $errors['data_json.url'] = 'Media URL is required.';
        }

        if (! in_array($config['aspect_ratio'] ?? null, ['auto', 'landscape', 'portrait', 'square'], true)) {
            $errors['config_json.aspect_ratio'] = 'Choose a valid aspect ratio.';
        }

        if (! in_array($config['width'] ?? null, ['content', 'wide', 'full'], true)) {
            $errors['config_json.width'] = 'Choose a valid media width.';
        }

        return $errors;
    }
}
