<?php

namespace App\Admin\Conscious\Schema;

use Illuminate\Database\Eloquent\Model;

final class ConsciousSchemaEntityResolver
{
    public function resolve(
        ConsciousSchemaFieldDefinition $field,
        int $id,
    ): Model {
        $modelClass = $field->modelClass;

        return $modelClass::query()->findOrFail($id);
    }
}
