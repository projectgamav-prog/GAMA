<?php

namespace App\Admin\Conscious\Schema;

final class ConsciousSchemaFieldRegistry
{
    /**
     * @var array<string, ConsciousSchemaFieldDefinition>
     */
    private array $definitions;

    public function __construct()
    {
        $this->definitions = [];

        foreach (ScriptureConsciousSchemaFields::definitions() as $definition) {
            $this->definitions[$definition->key()] = $definition;
        }
    }

    public function get(
        string $schemaFamily,
        string $entityType,
        string $fieldName,
    ): ?ConsciousSchemaFieldDefinition {
        return $this->definitions[
            ConsciousSchemaFieldDefinition::makeKey(
                $schemaFamily,
                $entityType,
                $fieldName,
            )
        ] ?? null;
    }

    /**
     * @return list<ConsciousSchemaFieldDefinition>
     */
    public function list(): array
    {
        return array_values($this->definitions);
    }
}
