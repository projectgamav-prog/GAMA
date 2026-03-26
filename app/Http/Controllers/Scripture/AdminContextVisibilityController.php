<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Support\AdminContext\AdminContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;

class AdminContextVisibilityController extends Controller
{
    /**
     * Persist the protected admin visibility preference.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'visible' => ['required', 'boolean'],
        ]);

        $response = redirect()->back(status: 303);

        if ((bool) $validated['visible']) {
            return $response->withCookie(
                cookie(
                    AdminContext::VISIBILITY_COOKIE,
                    '1',
                    60 * 24 * 30,
                ),
            );
        }

        return $response->withCookie(Cookie::forget(AdminContext::VISIBILITY_COOKIE));
    }
}
