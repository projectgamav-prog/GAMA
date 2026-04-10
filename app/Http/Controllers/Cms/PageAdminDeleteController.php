<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\RedirectResponse;

class PageAdminDeleteController extends Controller
{
    public function destroy(Page $page): RedirectResponse
    {
        $page->delete();

        return redirect()->to(route('cms.pages.index', absolute: false), 303);
    }
}
