<?php

namespace App\Http\Requests\Scripture;

use App\Models\Book;
use App\Models\ContentBlock;
use App\Support\Scripture\Admin\BookAdminRouteContext;

class BookAdminContentBlockStoreRequest extends OrderedRegistryContentBlockStoreRequest
{
    protected function adminEntityKey(): string
    {
        return 'book';
    }

    protected function isContextualInsertionAnchor(ContentBlock $contentBlock): bool
    {
        return $this->bookAdminRouteContext()
            ->isContextualInsertionAnchor($contentBlock);
    }

    private function bookAdminRouteContext(): BookAdminRouteContext
    {
        return new BookAdminRouteContext($this->book());
    }

    private function book(): Book
    {
        $book = $this->route('book');

        if (! $book instanceof Book) {
            throw new \RuntimeException('The Book route parameter is missing.');
        }

        return $book;
    }
}
