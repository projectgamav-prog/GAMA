<?php

namespace App\Admin\Conscious\Actions;

use Illuminate\Contracts\Container\Container;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
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
    ): ?RedirectResponse {
        $action = $this->actions->get($schemaFamily, $entityType, $actionKey);

        abort_unless($action, 404);

        abort_if(
            ! $action->enabled,
            422,
            $action->disabledReason ?? 'This Conscious action is not enabled.',
        );

        abort_unless($action->handlerClass, 501, 'No Conscious action handler is registered.');

        $entity = $this->resolveEntity($action, $id);
        $handler = $this->container->make($action->handlerClass);

        abort_unless($handler instanceof ConsciousActionHandler, 500, 'Invalid Conscious action handler.');

        return $handler->handle($request, $action, $entity);
    }

    private function resolveEntity(ConsciousActionDefinition $action, int $id): Model
    {
        if ($action->actionKey === 'canonical.create_book' && $id === 0) {
            return new $action->modelClass;
        }

        return $action->modelClass::query()->findOrFail($id);
    }
}
