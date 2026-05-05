<?php

namespace App\Http\Controllers\Admin;

use App\Admin\Conscious\Actions\ConsciousActionDispatcher;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ConsciousSchemaActionController extends Controller
{
    public function __invoke(
        Request $request,
        ConsciousActionDispatcher $dispatcher,
        string $schemaFamily,
        string $entityType,
        int $id,
        string $actionKey,
    ): RedirectResponse {
        $response = $dispatcher->dispatch($request, $schemaFamily, $entityType, $id, $actionKey);

        return $response ?? redirect()->back(status: 303);
    }
}
