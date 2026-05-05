<?php

namespace App\Support\Scripture\Admin;

use Illuminate\Database\Eloquent\Model;

final class ConsciousAdminRouteUrls
{
    public static function fullEdit(string $entityType, Model|int $entity): string
    {
        return route('admin.schema.full-edit', [
            'scripture',
            $entityType,
            self::entityId($entity),
        ]);
    }

    public static function fieldUpdate(string $entityType, Model|int $entity, string $fieldName): string
    {
        return route('admin.schema.fields.update', [
            'scripture',
            $entityType,
            self::entityId($entity),
            $fieldName,
        ]);
    }

    public static function action(string $entityType, Model|int $entity, string $actionKey): string
    {
        return route('admin.schema.actions.run', [
            'scripture',
            $entityType,
            self::entityId($entity),
            $actionKey,
        ]);
    }

    /**
     * @param  array<string, mixed>  $query
     */
    public static function actionWithQuery(
        string $entityType,
        Model|int $entity,
        string $actionKey,
        array $query,
    ): string {
        return self::action($entityType, $entity, $actionKey).'?'.http_build_query($query);
    }

    private static function entityId(Model|int $entity): int
    {
        if ($entity instanceof Model) {
            return (int) $entity->getKey();
        }

        return $entity;
    }
}
