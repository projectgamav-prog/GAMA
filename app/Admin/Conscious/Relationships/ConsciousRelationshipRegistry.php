<?php

namespace App\Admin\Conscious\Relationships;

final class ConsciousRelationshipRegistry
{
    /**
     * @var array<string, ConsciousRelationshipDefinition>
     */
    private array $definitions = [];

    public function __construct()
    {
        $this->registerMany(ScriptureConsciousRelationshipDefinitions::definitions());
    }

    /**
     * @return list<ConsciousRelationshipDefinition>
     */
    public function list(): array
    {
        return array_values($this->definitions);
    }

    /**
     * @return list<ConsciousRelationshipDefinition>
     */
    public function childrenOf(string $schemaFamily, string $parentEntityType): array
    {
        return array_values(array_filter(
            $this->definitions,
            fn (ConsciousRelationshipDefinition $definition): bool => $definition->schemaFamily === $schemaFamily
                && $definition->parentEntityType === $parentEntityType,
        ));
    }

    /**
     * @param  list<ConsciousRelationshipDefinition>  $definitions
     */
    private function registerMany(array $definitions): void
    {
        foreach ($definitions as $definition) {
            $this->definitions[$definition->key()] = $definition;
        }
    }
}
