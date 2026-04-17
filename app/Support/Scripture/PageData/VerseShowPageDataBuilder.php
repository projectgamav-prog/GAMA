<?php

namespace App\Support\Scripture\PageData;

use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\ContentBlock;
use App\Models\Verse;
use App\Support\Scripture\Admin\PrimaryPublishedEditableContentBlock;
use App\Support\Scripture\Admin\VerseAdminRouteContext;
use App\Support\Scripture\PublicScriptureData;
use Illuminate\Support\Collection;

class VerseShowPageDataBuilder
{
    /**
     * @param  Collection<int, ContentBlock>  $contentBlocks
     */
    public function primaryIntroBlock(
        Collection $contentBlocks,
        VerseAdminRouteContext $adminRouteContext,
    ): ?ContentBlock {
        return PrimaryPublishedEditableContentBlock::resolve(
            $contentBlocks,
            fn (ContentBlock $block): bool => $adminRouteContext->isEditableIntroBlock($block),
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function versePayload(
        Verse $verse,
        ?ContentBlock $primaryIntroBlock,
        PublicScriptureData $publicScriptureData,
    ): array {
        return [
            ...$publicScriptureData->verse($verse),
            'intro_block' => $primaryIntroBlock
                ? $publicScriptureData->contentBlock($primaryIntroBlock)
                : null,
        ];
    }

    /**
     * @param  Collection<int, Verse>  $chapterSectionVerses
     * @return array{previous_verse: array<string, mixed>|null, next_verse: array<string, mixed>|null}
     */
    public function adjacentVerses(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        Collection $chapterSectionVerses,
        Verse $verse,
        PublicScriptureData $publicScriptureData,
    ): array {
        $currentVerseIndex = $chapterSectionVerses->search(
            fn (Verse $candidate): bool => (int) $candidate->getKey() === (int) $verse->getKey(),
        );

        return [
            'previous_verse' => $currentVerseIndex === false
                ? null
                : $publicScriptureData->adjacentVerse(
                    $book,
                    $bookSection,
                    $chapter,
                    $chapterSection,
                    $chapterSectionVerses->get($currentVerseIndex - 1),
                ),
            'next_verse' => $currentVerseIndex === false
                ? null
                : $publicScriptureData->adjacentVerse(
                    $book,
                    $bookSection,
                    $chapter,
                    $chapterSection,
                    $chapterSectionVerses->get($currentVerseIndex + 1),
                ),
        ];
    }
}
