<?php

namespace App\Support\Scripture\Admin;

class TextualContentBlockSchema
{
    /**
     * @return list<string>
     */
    public static function editableTypes(): array
    {
        return ['text', 'quote'];
    }

    public static function typeValidationRule(): string
    {
        return 'in:'.implode(',', self::editableTypes());
    }
}
