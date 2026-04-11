<?php

namespace App\Http\Middleware;

use App\Support\AdminContext\AdminContext;
use App\Support\Navigation\LinkTargetRegistry;
use App\Support\Navigation\SiteNavigationData;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $canAccessAdminContext = AdminContext::canAccess($request->user());

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'adminContext' => [
                'canAccess' => $canAccessAdminContext,
                'isVisible' => AdminContext::isVisible($request),
                'visibilityUrl' => AdminContext::visibilityUrl($request->user()),
            ],
            'siteNavigation' => [
                'header' => SiteNavigationData::headerItems(),
                'footer' => SiteNavigationData::footerItems(),
                'headerAdmin' => $canAccessAdminContext
                    ? SiteNavigationData::headerAuthoringData()
                    : null,
            ],
            'linkTargetOptions' => $canAccessAdminContext
                ? LinkTargetRegistry::sharedOptions()
                : null,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
