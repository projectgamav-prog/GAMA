<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;

class PostponedAdminSurfaceController extends Controller
{
    /**
     * Abort postponed admin domains so they no longer shape the active CMS flow.
     */
    public function __invoke(): never
    {
        abort(404);
    }
}
