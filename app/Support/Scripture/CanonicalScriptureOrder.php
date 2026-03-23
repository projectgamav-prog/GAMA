<?php

namespace App\Support\Scripture;

use Illuminate\Database\Eloquent\Builder;

class CanonicalScriptureOrder
{
    public static function applyBookOrder(Builder $query): Builder
    {
        return self::applyNumberOrder($query);
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
}
