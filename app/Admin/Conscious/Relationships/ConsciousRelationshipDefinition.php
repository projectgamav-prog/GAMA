<?php

namespace App\Admin\Conscious\Relationships;

final readonly class ConsciousRelationshipDefinition
{
    public function __construct(
        public string $schemaFamily,
        public string $parentEntityType,
        public string $childEntityType,
        public string $relationName,
        public string $foreignKey,
        public bool $structural,
        public bool $protected,
        public ?string $policyKey = null,
    ) {}

    public function key(): string
    {
        return self::makeKey($this->schemaFamily, $this->parentEntityType, $this->childEntityType, $this->relationName);
    }

    public static function makeKey(
        string $schemaFamily,
        string $parentEntityType,
        string $childEntityType,
        string $relationName,
    ): string {
        return sprintf('%s:%s:%s:%s', $schemaFamily, $parentEntityType, $childEntityType, $relationName);
    }
}
