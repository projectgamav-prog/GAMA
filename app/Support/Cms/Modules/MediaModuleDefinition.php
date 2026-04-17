<?php

namespace App\Support\Cms\Modules;

class MediaModuleDefinition extends CmsModuleDefinition
{
    public function key(): string
    {
        return 'media';
    }

    /**
     * @return array{data: array<string, mixed>, config: array<string, mixed>}
     */
    public function defaults(): array
    {
        return [
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
