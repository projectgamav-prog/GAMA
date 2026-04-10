<?php

namespace App\Support\Cms;

use App\Models\Page;
use Illuminate\Http\Request;

trait ResolvesCmsAuthoringRedirect
{
    protected function resolveRedirectTarget(Request $request, Page $page): string
    {
        $returnTo = $request->string('return_to')->trim()->value();

        if ($returnTo !== '' && str_starts_with($returnTo, '/') && ! str_starts_with($returnTo, '//')) {
            return $returnTo;
        }

        return route('cms.pages.show', $page, false);
    }
}
