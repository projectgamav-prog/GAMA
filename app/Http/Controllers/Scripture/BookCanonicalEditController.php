<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Support\Scripture\Admin\BookAdminRouteContext;
use App\Support\Scripture\Admin\Registry\AdminEntityRegistry;
use App\Support\Scripture\PublicScriptureData;
use Inertia\Inertia;
use Inertia\Response;

class BookCanonicalEditController extends Controller
{
    /**
     * Render the protected canonical book workflow.
     */
    public function show(
        Book $book,
        PublicScriptureData $publicScriptureData,
        AdminEntityRegistry $adminEntityRegistry,
    ): Response {
        $adminRouteContext = new BookAdminRouteContext($book);

        return Inertia::render('scripture/books/canonical-edit', [
            'book' => [
                ...$publicScriptureData->book($book),
                'admin_full_edit_href' => $adminRouteContext->fullEditHref(),
                'admin_canonical_edit_href' => $adminRouteContext->canonicalEditHref(),
            ],
            'admin_entity' => $adminEntityRegistry
                ->definition('book')
                ->toArray(),
        ]);
    }
}
