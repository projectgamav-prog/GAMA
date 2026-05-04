<?php

namespace App\Admin\Conscious\Relationships;

final class ScriptureConsciousRelationshipDefinitions
{
    /**
     * @return list<ConsciousRelationshipDefinition>
     */
    public static function definitions(): array
    {
        return [
            self::structural('book', 'book_section', 'bookSections', 'book_id'),
            self::structural('book_section', 'chapter', 'chapters', 'book_section_id'),
            self::structural('chapter', 'chapter_section', 'chapterSections', 'chapter_id'),
            self::structural('chapter_section', 'verse', 'verses', 'chapter_section_id'),
        ];
    }

    private static function structural(
        string $parentEntityType,
        string $childEntityType,
        string $relationName,
        string $foreignKey,
    ): ConsciousRelationshipDefinition {
        return new ConsciousRelationshipDefinition(
            schemaFamily: 'scripture',
            parentEntityType: $parentEntityType,
            childEntityType: $childEntityType,
            relationName: $relationName,
            foreignKey: $foreignKey,
            structural: true,
            protected: true,
            policyKey: 'protected_canonical_relationship',
        );
    }
}
