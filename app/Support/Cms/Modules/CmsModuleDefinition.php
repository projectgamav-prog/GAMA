<?php

namespace App\Support\Cms\Modules;

abstract class CmsModuleDefinition
{
    abstract public function key(): string;

    /**
     * @return array{data: array<string, mixed>, config: array<string, mixed>}
     */
    abstract public function defaults(): array;

    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $config
     * @return array<string, string>
     */
    abstract public function validationErrors(array $data, array $config): array;

    /**
     * @return array{data: array<string, mixed>, config: array<string, mixed>}
     */
    public function normalizedPayload(mixed $data, mixed $config): array
    {
        $defaults = $this->defaults();

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
}
