<?php

namespace App\Support\Scripture\Admin;

class RegisteredContentBlockDataJson
{
    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>|null
     */
    public static function fromValidated(
        array $validated,
        string $blockType,
    ): ?array {
        if ($blockType !== 'image') {
            return null;
        }

        $data = array_filter([
            'url' => self::nullableString($validated['media_url'] ?? null),
            'alt' => self::nullableString($validated['alt_text'] ?? null),
        ], fn (mixed $value): bool => $value !== null);

        return $data === [] ? null : $data;
    }

    private static function nullableString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }
}
