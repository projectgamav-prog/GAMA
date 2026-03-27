<?php

namespace App\Support\Scripture\Admin;

class BookContentBlockSchema
{
    /**
     * @return list<string>
     */
    public static function editableTypes(): array
    {
        return [
            ...TextualContentBlockSchema::editableTypes(),
            'image',
        ];
    }

    /**
     * @return list<string>
     */
    public static function creatableRegions(): array
    {
        return ['overview', 'highlights'];
    }

    /**
     * @return list<string>
     */
    public static function insertionModes(): array
    {
        return ['start', 'before', 'after', 'end'];
    }

    public static function typeValidationRule(): string
    {
        return 'in:'.implode(',', self::editableTypes());
    }

    public static function regionValidationRule(): string
    {
        return 'in:'.implode(',', self::creatableRegions());
    }
}
