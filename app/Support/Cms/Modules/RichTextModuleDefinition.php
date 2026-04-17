<?php

namespace App\Support\Cms\Modules;

class RichTextModuleDefinition extends CmsModuleDefinition
{
    public function key(): string
    {
        return 'rich_text';
    }

    /**
     * @return array{data: array<string, mixed>, config: array<string, mixed>}
     */
    public function defaults(): array
    {
        return [
            'data' => [
                'eyebrow' => '',
                'title' => '',
                'lead' => '',
                'body' => 'New rich text block.',
                'blocks' => [[
                    'type' => 'paragraph',
                    'text' => 'New rich text block.',
                ]],
                'html' => '',
            ],
            'config' => [
                'align' => 'left',
                'max_width' => 'content',
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
        $eyebrow = trim((string) ($data['eyebrow'] ?? ''));
        $title = trim((string) ($data['title'] ?? ''));
        $lead = trim((string) ($data['lead'] ?? ''));
        $body = trim((string) ($data['body'] ?? ''));
        $blocks = is_array($data['blocks'] ?? null) ? $data['blocks'] : [];
        $html = trim((string) ($data['html'] ?? ''));

        if ($eyebrow === '' && $title === '' && $lead === '' && $body === '' && $blocks === [] && $html === '') {
            $errors['data_json.body'] = 'Add at least a title, lead, or body for this prose section.';
        }

        if (! in_array($config['align'] ?? null, ['left', 'center', 'right'], true)) {
            $errors['config_json.align'] = 'Choose a valid text alignment.';
        }

        if (! in_array($config['max_width'] ?? null, ['content', 'wide', 'full'], true)) {
            $errors['config_json.max_width'] = 'Choose a valid rich text width.';
        }

        return $errors;
    }
}
