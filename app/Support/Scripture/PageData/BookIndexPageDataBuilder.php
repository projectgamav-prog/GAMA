<?php

namespace App\Support\Scripture\PageData;

use App\Models\Book;
use App\Support\Scripture\Admin\BookAdminRouteContext;
use App\Support\Scripture\PublicScriptureData;
use Illuminate\Support\Collection;

class BookIndexPageDataBuilder
{
    /**
     * @param  Collection<int, Book>  $books
     * @return list<array<string, mixed>>
     */
    public function books(
        Collection $books,
        PublicScriptureData $publicScriptureData,
        bool $isAdmin,
    ): array {
        return $books
            ->map(fn (Book $book) => [
                ...$publicScriptureData->book($book),
                'admin' => $this->bookCardAdminPayload($book, $isAdmin),
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<string, string>
     */
    public function adminPayload(): array
    {
        return [
            'store_href' => route('scripture.books.admin.store'),
        ];
    }

    /**
     * @return array<string, string>|null
     */
    private function bookCardAdminPayload(
        Book $book,
        bool $isAdmin,
    ): ?array {
        if (! $isAdmin) {
            return null;
        }

        $adminRouteContext = new BookAdminRouteContext($book);

        return [
            'details_update_href' => $adminRouteContext->detailsUpdateHref(),
            'full_edit_href' => $adminRouteContext->fullEditHref(),
            'canonical_edit_href' => $adminRouteContext->canonicalEditHref(),
        ];
    }
}
