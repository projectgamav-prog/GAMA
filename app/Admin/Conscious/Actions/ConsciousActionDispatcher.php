<?php

namespace App\Admin\Conscious\Actions;

use Illuminate\Contracts\Container\Container;
use Illuminate\Http\Request;

final class ConsciousActionDispatcher
{
    public function __construct(
        private readonly ConsciousActionRegistry $actions,
        private readonly Container $container,
    ) {}

    public function dispatch(
        Request $request,
        string $schemaFamily,
        string $entityType,
        int $id,
        string $actionKey,
    ): void {
        $action = $this->actions->get($schemaFamily, $entityType, $actionKey);

        abort_unless($action, 404);

        abort_if(
            ! $action->enabled,
            422,
            $action->disabledReason ?? 'This Conscious action is not enabled.',
        );

        abort_unless($action->handlerClass, 501, 'No Conscious action handler is registered.');

        $entity = $action->modelClass::query()->findOrFail($id);
        $handler = $this->container->make($action->handlerClass);

        abort_unless($handler instanceof ConsciousActionHandler, 500, 'Invalid Conscious action handler.');

        $handler->handle($request, $action, $entity);
    }
}
