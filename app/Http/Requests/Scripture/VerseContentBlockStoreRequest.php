<?php

namespace App\Http\Requests\Scripture;

use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\ContentBlock;
use App\Models\Verse;
use App\Support\Scripture\Admin\VerseAdminRouteContext;

class VerseContentBlockStoreRequest extends OrderedRegistryTextContentBlockStoreRequest
{
    protected function adminEntityKey(): string
    {
        return 'verse';
    }

    protected function isContextualInsertionAnchor(ContentBlock $contentBlock): bool
    {
        return $this->verseAdminRouteContext()
            ->isContextualInsertionAnchor($contentBlock);
    }

    private function verseAdminRouteContext(): VerseAdminRouteContext
    {
        return new VerseAdminRouteContext(
            $this->book(),
            $this->bookSection(),
            $this->chapter(),
            $this->chapterSection(),
            $this->verse(),
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

    private function chapterSection(): ChapterSection
    {
        $chapterSection = $this->route('chapterSection');

        if (! $chapterSection instanceof ChapterSection) {
            throw new \RuntimeException('The ChapterSection route parameter is missing.');
        }

        return $chapterSection;
    }

    private function verse(): Verse
    {
        $verse = $this->route('verse');

        if (! $verse instanceof Verse) {
            throw new \RuntimeException('The Verse route parameter is missing.');
        }

        return $verse;
    }
}
