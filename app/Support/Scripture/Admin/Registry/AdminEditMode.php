<?php

namespace App\Support\Scripture\Admin\Registry;

class AdminEditMode
{
    public const CONTEXTUAL = 'contextual';

    public const FULL = 'full';

    public const CANONICAL = 'canonical';

    /**
     * @return list<string>
     */
    public static function all(): array
    {
        return [
            self::CONTEXTUAL,
            self::FULL,
            self::CANONICAL,
        ];
    }

    public static function assertValid(string $mode): void
    {
        if (! in_array($mode, self::all(), true)) {
            throw new \InvalidArgumentException("Unsupported admin edit mode [{$mode}].");
        }
    }
}
