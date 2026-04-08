<?php

namespace App\Support\Scripture\Admin;

use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\Verse;
use Illuminate\Support\Facades\DB;

class DeletesScriptureStructure
{
    public function deleteBook(Book $book): void
    {
        $book->loadMissing('bookSections.chapters.chapterSections.verses');

        DB::transaction(function () use ($book): void {
            foreach ($book->bookSections as $bookSection) {
                $this->deleteBookSectionRecord($bookSection);
            }

            $book->contentBlocks()->delete();
            $book->mediaAssignments()->delete();
            $book->outgoingEntityRelations()->delete();
            $book->incomingEntityRelations()->delete();
            $book->delete();
        });
    }

    public function deleteBookSection(BookSection $bookSection): void
    {
        $bookSection->loadMissing('chapters.chapterSections.verses');

        DB::transaction(function () use ($bookSection): void {
            $this->deleteBookSectionRecord($bookSection);
        });
    }

    public function deleteChapter(Chapter $chapter): void
    {
        $chapter->loadMissing('chapterSections.verses');

        DB::transaction(function () use ($chapter): void {
            $this->deleteChapterRecord($chapter);
        });
    }

    public function deleteChapterSection(ChapterSection $chapterSection): void
    {
        $chapterSection->loadMissing('verses');

        DB::transaction(function () use ($chapterSection): void {
            $this->deleteChapterSectionRecord($chapterSection);
        });
    }

    public function deleteVerse(Verse $verse): void
    {
        DB::transaction(function () use ($verse): void {
            $this->deleteVerseRecord($verse);
        });
    }

    private function deleteBookSectionRecord(BookSection $bookSection): void
    {
        $bookSection->loadMissing('chapters.chapterSections.verses');

        foreach ($bookSection->chapters as $chapter) {
            $this->deleteChapterRecord($chapter);
        }

        $bookSection->contentBlocks()->delete();
        $bookSection->delete();
    }

    private function deleteChapterRecord(Chapter $chapter): void
    {
        $chapter->loadMissing('chapterSections.verses');

        foreach ($chapter->chapterSections as $chapterSection) {
            $this->deleteChapterSectionRecord($chapterSection);
        }

        $chapter->contentBlocks()->delete();
        $chapter->outgoingEntityRelations()->delete();
        $chapter->incomingEntityRelations()->delete();
        $chapter->delete();
    }

    private function deleteChapterSectionRecord(ChapterSection $chapterSection): void
    {
        $chapterSection->loadMissing('verses');

        foreach ($chapterSection->verses as $verse) {
            $this->deleteVerseRecord($verse);
        }

        $chapterSection->contentBlocks()->delete();
        $chapterSection->delete();
    }

    private function deleteVerseRecord(Verse $verse): void
    {
        $verse->contentBlocks()->delete();
        $verse->outgoingEntityRelations()->delete();
        $verse->incomingEntityRelations()->delete();
        $verse->delete();
    }
}
