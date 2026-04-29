<?php

namespace App\Admin\Conscious\Schema;

use Illuminate\Database\Eloquent\Model;

/**
 * Describes one schema-backed field the Conscious Admin backend understands.
 */
final readonly class ConsciousSchemaFieldDefinition
{
    /**
     * @param  class-string<Model>  $modelClass
     * @param  list<string>  $validationRules
     */
    public function __construct(
        public string $schemaFamily,
        public string $entityType,
        public string $tableName,
        public string $modelClass,
        public string $fieldName,
        public string $columnName,
        public string $label,
        public string $fieldKind,
        public string $editableMode,
        public array $validationRules,
        public bool $protected = false,
        public ?string $category = null,
    ) {}

    public function key(): string
    {
        return self::makeKey(
            $this->schemaFamily,
            $this->entityType,
            $this->fieldName,
        );
    }

    public function canQuickEdit(): bool
    {
        return $this->editableMode === 'quick_edit' && ! $this->protected;
    }

    public static function makeKey(
        string $schemaFamily,
        string $entityType,
        string $fieldName,
    ): string {
        return sprintf('%s:%s:%s', $schemaFamily, $entityType, $fieldName);
    }
}
