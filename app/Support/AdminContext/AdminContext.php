<?php

namespace App\Support\AdminContext;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\Request;

class AdminContext
{
    public const VISIBILITY_COOKIE = 'admin_context_visible';

    /**
     * Determine whether the current user can access protected admin context UI.
     */
    public static function canAccess(?Authenticatable $user): bool
    {
        if ($user === null) {
            return false;
        }

        $value = data_get($user, 'can_access_admin_context', false);

        return filter_var($value, FILTER_VALIDATE_BOOL);
    }

    /**
     * Determine whether admin visibility is enabled for the current request.
     */
    public static function isVisible(Request $request): bool
    {
        if (! self::canAccess($request->user())) {
            return false;
        }

        return filter_var(
            $request->cookie(self::VISIBILITY_COOKIE, false),
            FILTER_VALIDATE_BOOL,
        );
    }
}
