<?php

namespace App\Http\Controllers\Admin;

use App\Admin\Conscious\Services\ConsciousFullEditPayloadBuilder;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ConsciousFullEditController extends Controller
{
    /**
     * Render the schema-aware Conscious Admin Full Edit shell.
     */
    public function show(
        ConsciousFullEditPayloadBuilder $payloadBuilder,
        string $schemaFamily,
        string $entityType,
        int $id,
    ): Response {
        return Inertia::render('admin/schema/full-edit', [
            ...$payloadBuilder->build($schemaFamily, $entityType, $id),
            'mode' => 'conscious_full_edit',
            'is_deprecated_old_full_edit_bypassed' => true,
        ]);
    }
}
