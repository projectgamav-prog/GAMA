<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\ContentBlock;
use App\Models\Verse;
use App\Support\AdminContext\AdminContext;
use App\Support\Cms\Regions\CmsExposedRegionRegistry;
use App\Support\Cms\Regions\CmsExposedRegionResolver;
use App\Support\Scripture\Admin\Registry\AdminEntityRegistry;
use App\Support\Scripture\Admin\VerseAdminRouteContext;
use App\Support\Scripture\PageData\VersePageAdminDataBuilder;
use App\Support\Scripture\PageData\VerseShowPageDataBuilder;
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
        AdminEntityRegistry $adminEntityRegistry,
        CmsExposedRegionRegistry $regionRegistry,
        CmsExposedRegionResolver $regionResolver,
        VerseShowPageDataBuilder $verseShowPageDataBuilder,
        VersePageAdminDataBuilder $versePageAdminDataBuilder,
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

        $contentBlocks = $verse->contentBlocks()
            ->published()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $isAdmin = AdminContext::canAccess($request->user());
        $adminRouteContext = new VerseAdminRouteContext(
            $book,
            $bookSection,
            $chapter,
            $chapterSection,
            $verse,
        );
        $adminEntityDefinition = $adminEntityRegistry->definition('verse');
        $primaryIntroBlock = $verseShowPageDataBuilder->primaryIntroBlock(
            $contentBlocks,
            $adminRouteContext,
        );

        $adjacentVerses = $verseShowPageDataBuilder->adjacentVerses(
            $book,
            $bookSection,
            $chapter,
            $chapterSection,
            $chapterSectionVerses,
            $verse,
            $publicScriptureData,
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
            'verse' => $verseShowPageDataBuilder->versePayload(
                $verse,
                $primaryIntroBlock,
                $publicScriptureData,
            ),
            'previous_verse' => $adjacentVerses['previous_verse'],
            'next_verse' => $adjacentVerses['next_verse'],
            'translations' => $publicScriptureData->translations($verse->translations),
            'commentaries' => $publicScriptureData->commentaries($verse->commentaries),
            'verse_meta' => $publicScriptureData->verseMeta($verse->verseMeta),
            'dictionary_terms' => $publicScriptureData->dictionaryTerms($verse->dictionaryAssignments),
            'recitations' => $publicScriptureData->recitations($verse->recitations),
            'topics' => $publicScriptureData->topics($verse->topicAssignments),
            'characters' => $publicScriptureData->characters($verse->characterAssignments),
            'cms_regions' => $regionResolver->resolve([
                $regionRegistry->verseSupplementary(
                    $verse,
                    route('scripture.chapters.verses.show', [
                        'book' => $book,
                        'bookSection' => $bookSection,
                        'chapter' => $chapter,
                        'chapterSection' => $chapterSection,
                        'verse' => $verse,
                    ], false),
                ),
            ], $request->user()),
            'isAdmin' => $isAdmin,
            'admin' => $isAdmin
                ? $versePageAdminDataBuilder->adminPayload(
                    $verse,
                    $adminRouteContext,
                    $primaryIntroBlock,
                    $publicScriptureData,
                    $adminEntityDefinition,
                )
                : null,
        ]);
    }
}
