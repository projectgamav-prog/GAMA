<?php

namespace App\Http\Controllers\Admin;

use App\Admin\Conscious\Schema\ConsciousProtectedCanonicalFieldPolicy;
use App\Admin\Conscious\Schema\ConsciousSchemaEntityResolver;
use App\Admin\Conscious\Schema\ConsciousSchemaFieldRegistry;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class ConsciousSchemaFieldUpdateController extends Controller
{
    public function __invoke(
        Request $request,
        ConsciousSchemaFieldRegistry $fields,
        ConsciousSchemaEntityResolver $entities,
        ConsciousProtectedCanonicalFieldPolicy $protectedFields,
        string $schemaFamily,
        string $entityType,
        int $id,
        string $fieldName,
    ): RedirectResponse {
        $field = $fields->get($schemaFamily, $entityType, $fieldName);

        abort_unless($field, 404);

        $protectedFields->assertCanUpdate($field);

        $entity = $entities->resolve($field, $id);
        $payloadKey = $request->exists('value') ? 'value' : $fieldName;

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

        return redirect()->back(status: 303);
    }
}
