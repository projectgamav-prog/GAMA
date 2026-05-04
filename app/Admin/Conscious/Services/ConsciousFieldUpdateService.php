<?php

namespace App\Admin\Conscious\Services;

use App\Admin\Conscious\Schema\ConsciousSchemaFieldDefinition;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

final class ConsciousFieldUpdateService
{
    public function updateFromRequest(
        Request $request,
        Model $entity,
        ConsciousSchemaFieldDefinition $field,
    ): void {
        $payloadKey = $request->exists('value') ? 'value' : $field->fieldName;

        if (! $request->exists($payloadKey)) {
            throw ValidationException::withMessages([
                'value' => sprintf('%s is required.', $field->label),
            ]);
        }

        $validated = Validator::make(
            [$payloadKey => $request->input($payloadKey)],
            [$payloadKey => $field->validationRules],
            attributes: [$payloadKey => $field->label],
        )->validate();

        $entity->forceFill([
            $field->columnName => $validated[$payloadKey],
        ])->save();
    }
}
