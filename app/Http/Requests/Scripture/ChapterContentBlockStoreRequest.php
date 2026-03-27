<?php

namespace App\Http\Requests\Scripture;

use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ContentBlock;
use App\Support\Scripture\Admin\ChapterAdminRouteContext;

class ChapterContentBlockStoreRequest extends OrderedRegistryTextContentBlockStoreRequest
{
    protected function adminEntityKey(): string
    {
        return 'chapter';
    }

    protected function isContextualInsertionAnchor(ContentBlock $contentBlock): bool
    {
        return $this->chapterAdminRouteContext()
            ->isContextualInsertionAnchor($contentBlock);
    }

    private function chapterAdminRouteContext(): ChapterAdminRouteContext
    {
        return new ChapterAdminRouteContext(
            $this->book(),
            $this->bookSection(),
            $this->chapter(),
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

    private function chapter(): Chapter
    {
        $chapter = $this->route('chapter');

        if (! $chapter instanceof Chapter) {
            throw new \RuntimeException('The Chapter route parameter is missing.');
        }

        return $chapter;
    }
}
