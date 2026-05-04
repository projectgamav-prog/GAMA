<?php

namespace App\Http\Controllers\Admin;

use App\Admin\Conscious\Schema\ConsciousProtectedCanonicalFieldPolicy;
use App\Admin\Conscious\Schema\ConsciousSchemaEntityResolver;
use App\Admin\Conscious\Schema\ConsciousSchemaFieldRegistry;
use App\Admin\Conscious\Services\ConsciousFieldUpdateService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ConsciousSchemaFieldUpdateController extends Controller
{
    public function __invoke(
        Request $request,
        ConsciousSchemaFieldRegistry $fields,
        ConsciousSchemaEntityResolver $entities,
        ConsciousProtectedCanonicalFieldPolicy $protectedFields,
        ConsciousFieldUpdateService $fieldUpdates,
        string $schemaFamily,
        string $entityType,
        int $id,
        string $fieldName,
    ): RedirectResponse {
        $field = $fields->get($schemaFamily, $entityType, $fieldName);

        abort_unless($field, 404);

        $protectedFields->assertCanUpdate($field);

        $entity = $entities->resolve($field, $id);
        $fieldUpdates->updateFromRequest($request, $entity, $field);

        return redirect()->back(status: 303);
    }
}
