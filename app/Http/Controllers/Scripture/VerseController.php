<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\Verse;
use App\Support\AdminContext\AdminContext;
use App\Support\Scripture\Admin\VerseAdminRouteContext;
use App\Support\Scripture\PublicScriptureData;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VerseController extends Controller
{
    /**
     * Display a read-only scripture verse detail page.
     */
    public function show(
        Request $request,
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        Verse $verse,
        PublicScriptureData $publicScriptureData,
    ): Response {
        $verse->load([
            'translations',
            'commentaries',
            'verseMeta',
            'dictionaryAssignments.dictionaryEntry',
            'recitations.media',
            'topicAssignments.topic',
            'characterAssignments.character',
        ]);

        $chapterSectionVerses = $chapterSection->verses()
            ->inCanonicalOrder()
            ->get();

        $currentVerseIndex = $chapterSectionVerses->search(
            fn (Verse $candidate): bool => (int) $candidate->getKey() === (int) $verse->getKey(),
        );

        $contentBlocks = $verse->contentBlocks()
            ->published()
            ->get();

        $adminVisibilityEnabled = AdminContext::isVisible($request);
        $adminRouteContext = new VerseAdminRouteContext(
            $book,
            $bookSection,
            $chapter,
            $chapterSection,
            $verse,
        );

        return Inertia::render('scripture/chapters/verses/show', [
            'book' => $publicScriptureData->book($book),
            'book_section' => $publicScriptureData->bookSection($book, $bookSection),
            'chapter' => $publicScriptureData->chapter($book, $bookSection, $chapter),
            'chapter_section' => $publicScriptureData->chapterSection(
                $book,
                $bookSection,
                $chapter,
                $chapterSection,
            ),
            'verse' => $publicScriptureData->verse($verse),
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
            'translations' => $publicScriptureData->translations($verse->translations),
            'commentaries' => $publicScriptureData->commentaries($verse->commentaries),
            'verse_meta' => $publicScriptureData->verseMeta($verse->verseMeta),
            'dictionary_terms' => $publicScriptureData->dictionaryTerms($verse->dictionaryAssignments),
            'recitations' => $publicScriptureData->recitations($verse->recitations),
            'topics' => $publicScriptureData->topics($verse->topicAssignments),
            'characters' => $publicScriptureData->characters($verse->characterAssignments),
            'content_blocks' => $publicScriptureData->contentBlocks($contentBlocks),
            'admin' => $adminVisibilityEnabled
                ? [
                    'meta_update_href' => $adminRouteContext->metaUpdateHref(),
                    'full_edit_href' => $adminRouteContext->fullEditHref(),
                    'content_block_update_hrefs' => $contentBlocks
                        ->filter(fn ($block) => $adminRouteContext->isEditableNoteBlock($block))
                        ->mapWithKeys(fn ($block) => [
                            (string) $block->id => $adminRouteContext->contentBlockUpdateHref($block),
                        ])
                        ->all(),
                ]
                : null,
        ]);
    }
}
