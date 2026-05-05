<?php

namespace App\Admin\Conscious\Services;

use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\Verse;
use App\Support\Scripture\Admin\DeletesScriptureStructure;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;

final class ConsciousCanonicalDeleteService
{
    public function __construct(
        private readonly DeletesScriptureStructure $deletesScriptureStructure,
    ) {}

    public function delete(Model $entity): RedirectResponse
    {
        if ($entity instanceof Book) {
            $this->deletesScriptureStructure->deleteBook($entity);

            return redirect()->route('scripture.books.index', status: 303);
        }

        if ($entity instanceof BookSection) {
            $book = $entity->book()->firstOrFail();
            $this->deletesScriptureStructure->deleteBookSection($entity);

            return redirect()->route('scripture.books.show', ['book' => $book], 303);
        }

        if ($entity instanceof Chapter) {
            $bookSection = $entity->bookSection()->with('book')->firstOrFail();
            $book = $bookSection->book;
            $this->deletesScriptureStructure->deleteChapter($entity);

            return redirect()->route('scripture.books.show', ['book' => $book], 303);
        }

        if ($entity instanceof ChapterSection) {
            $chapter = $entity->chapter()->firstOrFail();
            $bookSection = $chapter->bookSection()->with('book')->firstOrFail();
            $book = $bookSection->book;
            $this->deletesScriptureStructure->deleteChapterSection($entity);

            return redirect()->route('scripture.chapters.show', [
                'book' => $book,
                'bookSection' => $bookSection,
                'chapter' => $chapter,
            ], 303);
        }

        if ($entity instanceof Verse) {
            $chapterSection = $entity->chapterSection()->firstOrFail();
            $chapter = $chapterSection->chapter()->firstOrFail();
            $bookSection = $chapter->bookSection()->with('book')->firstOrFail();
            $book = $bookSection->book;
            $this->deletesScriptureStructure->deleteVerse($entity);

            return redirect()->route('scripture.chapters.show', [
                'book' => $book,
                'bookSection' => $bookSection,
                'chapter' => $chapter,
            ], 303);
        }

        abort(422, 'This canonical entity cannot be deleted.');
    }
}
