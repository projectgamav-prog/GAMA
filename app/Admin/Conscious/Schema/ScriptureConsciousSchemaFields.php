<?php

namespace App\Admin\Conscious\Schema;

use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\Verse;

final class ScriptureConsciousSchemaFields
{
    /**
     * @return list<ConsciousSchemaFieldDefinition>
     */
    public static function definitions(): array
    {
        return [
            self::quickText('book', 'books', Book::class, 'title', 'Book title', 'title', ['required', 'string', 'max:255'], 'Basic Content'),
            self::quickText('book', 'books', Book::class, 'description', 'Book description', 'description', ['nullable', 'string'], 'Basic Content'),
            self::protectedField('book', 'books', Book::class, 'slug', 'URL slug', 'slug', 'Canonical Identity'),
            self::protectedField('book', 'books', Book::class, 'number', 'Canonical number', 'number', 'Canonical Identity'),

            self::quickText('book_section', 'book_sections', BookSection::class, 'title', 'Book section title', 'title', ['nullable', 'string', 'max:255'], 'Basic Content'),
            self::protectedField('book_section', 'book_sections', BookSection::class, 'slug', 'URL slug', 'slug', 'Canonical Identity'),
            self::protectedField('book_section', 'book_sections', BookSection::class, 'number', 'Canonical number', 'number', 'Canonical Identity'),
            self::protectedField('book_section', 'book_sections', BookSection::class, 'book_id', 'Parent book', 'relation', 'Structure & Parentage'),

            self::quickText('chapter', 'chapters', Chapter::class, 'title', 'Chapter title', 'title', ['nullable', 'string', 'max:255'], 'Basic Content'),
            self::protectedField('chapter', 'chapters', Chapter::class, 'slug', 'URL slug', 'slug', 'Canonical Identity'),
            self::protectedField('chapter', 'chapters', Chapter::class, 'number', 'Canonical number', 'number', 'Canonical Identity'),
            self::protectedField('chapter', 'chapters', Chapter::class, 'book_section_id', 'Parent book section', 'relation', 'Structure & Parentage'),

            self::quickText('chapter_section', 'chapter_sections', ChapterSection::class, 'title', 'Chapter section title', 'title', ['nullable', 'string', 'max:255'], 'Basic Content'),
            self::protectedField('chapter_section', 'chapter_sections', ChapterSection::class, 'slug', 'URL slug', 'slug', 'Canonical Identity'),
            self::protectedField('chapter_section', 'chapter_sections', ChapterSection::class, 'number', 'Canonical number', 'number', 'Canonical Identity'),
            self::protectedField('chapter_section', 'chapter_sections', ChapterSection::class, 'chapter_id', 'Parent chapter', 'relation', 'Structure & Parentage'),

            self::quickText('verse', 'verses', Verse::class, 'text', 'Verse text', 'long_text', ['required', 'string'], 'Basic Content'),
            self::protectedField('verse', 'verses', Verse::class, 'slug', 'URL slug', 'slug', 'Canonical Identity'),
            self::protectedField('verse', 'verses', Verse::class, 'number', 'Canonical number', 'number', 'Canonical Identity'),
            self::protectedField('verse', 'verses', Verse::class, 'chapter_section_id', 'Parent chapter section', 'relation', 'Structure & Parentage'),
        ];
    }

    /**
     * @param  class-string<\Illuminate\Database\Eloquent\Model>  $modelClass
     * @param  list<string>  $validationRules
     */
    private static function quickText(
        string $entityType,
        string $tableName,
        string $modelClass,
        string $fieldName,
        string $label,
        string $fieldKind,
        array $validationRules,
        string $category,
    ): ConsciousSchemaFieldDefinition {
        return new ConsciousSchemaFieldDefinition(
            schemaFamily: 'scripture',
            entityType: $entityType,
            tableName: $tableName,
            modelClass: $modelClass,
            fieldName: $fieldName,
            columnName: $fieldName,
            label: $label,
            fieldKind: $fieldKind,
            editableMode: 'quick_edit',
            validationRules: $validationRules,
            protected: false,
            category: $category,
        );
    }

    /**
     * @param  class-string<\Illuminate\Database\Eloquent\Model>  $modelClass
     */
    private static function protectedField(
        string $entityType,
        string $tableName,
        string $modelClass,
        string $fieldName,
        string $label,
        string $fieldKind,
        string $category,
    ): ConsciousSchemaFieldDefinition {
        return new ConsciousSchemaFieldDefinition(
            schemaFamily: 'scripture',
            entityType: $entityType,
            tableName: $tableName,
            modelClass: $modelClass,
            fieldName: $fieldName,
            columnName: $fieldName,
            label: $label,
            fieldKind: $fieldKind,
            editableMode: 'protected',
            validationRules: ['prohibited'],
            protected: true,
            category: $category,
        );
    }
}
