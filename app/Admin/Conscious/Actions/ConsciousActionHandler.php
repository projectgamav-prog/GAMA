<?php

namespace App\Admin\Conscious\Actions;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

interface ConsciousActionHandler
{
    public function handle(
        Request $request,
        ConsciousActionDefinition $action,
        Model $entity,
    ): void;
}
