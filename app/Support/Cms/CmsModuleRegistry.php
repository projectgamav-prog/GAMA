<?php

namespace App\Support\Cms;

use App\Support\Cms\Modules\ButtonGroupModuleDefinition;
use App\Support\Cms\Modules\CardListModuleDefinition;
use App\Support\Cms\Modules\CmsModuleDefinition;
use App\Support\Cms\Modules\MediaModuleDefinition;
use App\Support\Cms\Modules\RichTextModuleDefinition;

class CmsModuleRegistry
{
    /**
     * @return list<string>
     */
    public static function keys(): array
    {
        return array_keys(self::definitions());
    }

    /**
     * @return array{data: array<string, mixed>, config: array<string, mixed>}
     */
    public static function defaults(string $moduleKey): array
    {
        return self::definition($moduleKey)?->defaults() ?? [
            'data' => [],
            'config' => [],
        ];
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

        $definition = self::definition($moduleKey);
        $payload = self::normalizedPayload($moduleKey, $data, $config);

        return $definition?->validationErrors($payload['data'], $payload['config']) ?? [];
    }

    /**
     * @return array<string, CmsModuleDefinition>
     */
    private static function definitions(): array
    {
        $definitions = [
            new RichTextModuleDefinition(),
            new ButtonGroupModuleDefinition(),
            new MediaModuleDefinition(),
            new CardListModuleDefinition(),
        ];

        return collect($definitions)
            ->keyBy(fn (CmsModuleDefinition $definition) => $definition->key())
            ->all();
    }

    /**
     * @return CmsModuleDefinition|null
     */
    private static function definition(string $moduleKey): ?CmsModuleDefinition
    {
        return self::definitions()[$moduleKey] ?? null;
    }
}
