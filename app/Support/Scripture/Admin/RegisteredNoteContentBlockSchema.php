<?php

namespace App\Support\Scripture\Admin;

class RegisteredNoteContentBlockSchema
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

    public static function typeValidationRule(): string
    {
        return 'in:'.implode(',', self::editableTypes());
    }
}
