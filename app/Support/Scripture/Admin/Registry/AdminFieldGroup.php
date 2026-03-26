<?php

namespace App\Support\Scripture\Admin\Registry;

class AdminFieldGroup
{
    public const IDENTITY = 'identity';

    public const EDITORIAL = 'editorial';

    public const SUPPORTING = 'supporting';

    /**
     * @return list<string>
     */
    public static function all(): array
    {
        return [
            self::IDENTITY,
            self::EDITORIAL,
            self::SUPPORTING,
        ];
    }

    public static function assertValid(string $group): void
    {
        if (! in_array($group, self::all(), true)) {
            throw new \InvalidArgumentException("Unsupported admin field group [{$group}].");
        }
    }
}
