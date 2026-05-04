<?php

namespace App\Admin\Conscious\Actions;

final class ConsciousActionRegistry
{
    /**
     * @var array<string, ConsciousActionDefinition>
     */
    private array $definitions = [];

    public function __construct()
    {
        $this->registerMany(ScriptureConsciousActionDefinitions::definitions());
    }

    public function get(string $schemaFamily, string $entityType, string $actionKey): ?ConsciousActionDefinition
    {
        return $this->definitions[ConsciousActionDefinition::makeKey($schemaFamily, $entityType, $actionKey)] ?? null;
    }

    /**
     * @return list<ConsciousActionDefinition>
     */
    public function list(): array
    {
        return array_values($this->definitions);
    }

    /**
     * @param  list<ConsciousActionDefinition>  $definitions
     */
    private function registerMany(array $definitions): void
    {
        foreach ($definitions as $definition) {
            $this->definitions[$definition->key()] = $definition;
        }
    }
}
