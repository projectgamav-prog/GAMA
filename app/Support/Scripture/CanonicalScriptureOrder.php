<?php

namespace App\Support\Scripture;

use Illuminate\Database\Eloquent\Builder;
use JsonException;
use RuntimeException;

class CanonicalScriptureOrder
{
    /**
     * @var list<string>|null
     */
    private static ?array $bookSlugs = null;

    public static function applyBookOrder(Builder $query): Builder
    {
        $bookSlugs = self::bookSlugs();
        $slugColumn = $query->getModel()->qualifyColumn('slug');
        $keyColumn = $query->getModel()->qualifyColumn($query->getModel()->getKeyName());

        if ($bookSlugs === []) {
            return $query->orderBy($keyColumn);
        }

        $cases = array_map(
            fn (int $index): string => sprintf('WHEN ? THEN %d', $index),
            array_keys($bookSlugs),
        );

        return $query
            ->orderByRaw(
                sprintf(
                    'CASE %s %s ELSE %d END',
                    $slugColumn,
                    implode(' ', $cases),
                    count($bookSlugs),
                ),
                $bookSlugs,
            )
            ->orderBy($keyColumn);
    }

    public static function applyNumberOrder(Builder $query, string $column = 'number'): Builder
    {
        $qualifiedColumn = $query->getModel()->qualifyColumn($column);
        $wrappedColumn = $query->getQuery()->getGrammar()->wrap($qualifiedColumn);
        $keyColumn = $query->getModel()->qualifyColumn($query->getModel()->getKeyName());

        $query->orderByRaw(sprintf('CASE WHEN %s IS NULL THEN 1 ELSE 0 END', $wrappedColumn));

        [$numericCondition, $numericCast] = match ($query->getConnection()->getDriverName()) {
            'mysql', 'mariadb' => [
                sprintf("%s REGEXP '^[0-9]+$'", $wrappedColumn),
                sprintf('CAST(%s AS UNSIGNED)', $wrappedColumn),
            ],
            'sqlite' => [
                sprintf("%s <> '' AND %s NOT GLOB '*[^0-9]*'", $wrappedColumn, $wrappedColumn),
                sprintf('CAST(%s AS INTEGER)', $wrappedColumn),
            ],
            default => [null, null],
        };

        if ($numericCondition !== null && $numericCast !== null) {
            return $query
                ->orderByRaw(sprintf('CASE WHEN %s THEN 0 ELSE 1 END', $numericCondition))
                ->orderByRaw(sprintf('CASE WHEN %s THEN %s END', $numericCondition, $numericCast))
                ->orderBy($qualifiedColumn)
                ->orderBy($keyColumn);
        }

        return $query
            ->orderBy($qualifiedColumn)
            ->orderBy($keyColumn);
    }

    /**
     * @return list<string>
     */
    private static function bookSlugs(): array
    {
        if (self::$bookSlugs !== null) {
            return self::$bookSlugs;
        }

        $contents = file_get_contents(base_path(ScriptureJsonImporter::ROOT_MANIFEST_PATH));

        if ($contents === false) {
            throw new RuntimeException('Unable to read the scripture corpus manifest.');
        }

        try {
            $payload = json_decode($contents, true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException $jsonException) {
            throw new RuntimeException(
                'Unable to decode the scripture corpus manifest.',
                previous: $jsonException,
            );
        }

        if (! is_array($payload) || ! is_array($payload['books'] ?? null)) {
            throw new RuntimeException('The scripture corpus manifest is malformed.');
        }

        self::$bookSlugs = array_values(array_map(
            fn (array $book): string => $book['slug'],
            $payload['books'],
        ));

        return self::$bookSlugs;
    }
}
