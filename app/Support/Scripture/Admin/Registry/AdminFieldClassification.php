<?php

namespace App\Support\Scripture\Admin\Registry;

class AdminFieldClassification
{
    public const CANONICAL = 'canonical';

    public const EDITORIAL = 'editorial';

    /**
     * @return list<string>
     */
    public static function all(): array
    {
        return [
            self::CANONICAL,
            self::EDITORIAL,
        ];
    }

    public static function assertValid(string $classification): void
    {
        if (! in_array($classification, self::all(), true)) {
            throw new \InvalidArgumentException(
                "Unsupported admin field classification [{$classification}].",
            );
        }
    }
}
