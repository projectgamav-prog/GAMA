<?php

namespace App\Http\Requests\Scripture;

use App\Models\Book;
use App\Models\BookSection;
use App\Models\ContentBlock;
use App\Support\Scripture\Admin\BookSectionAdminRouteContext;

class BookSectionContentBlockStoreRequest extends RegisteredNoteContentBlockStoreRequest
{
    protected function isContextualInsertionAnchor(ContentBlock $contentBlock): bool
    {
        return $this->bookSectionAdminRouteContext()
            ->isContextualInsertionAnchor($contentBlock);
    }

    private function bookSectionAdminRouteContext(): BookSectionAdminRouteContext
    {
        return new BookSectionAdminRouteContext(
            $this->book(),
            $this->bookSection(),
        );
    }

    private function book(): Book
    {
        $book = $this->route('book');

        if (! $book instanceof Book) {
            throw new \RuntimeException('The Book route parameter is missing.');
        }

        return $book;
    }

    private function bookSection(): BookSection
    {
        $bookSection = $this->route('bookSection');

        if (! $bookSection instanceof BookSection) {
            throw new \RuntimeException('The BookSection route parameter is missing.');
        }

        return $bookSection;
    }
}
