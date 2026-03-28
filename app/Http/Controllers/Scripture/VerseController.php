<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\CommentarySource;
use App\Models\ContentBlock;
use App\Models\TranslationSource;
use App\Models\Verse;
use App\Support\AdminContext\AdminContext;
use App\Support\Scripture\Admin\ContentBlockCapabilityPayload;
use App\Support\Scripture\Admin\PrimaryPublishedEditableContentBlock;
use App\Support\Scripture\Admin\Registry\AdminEntityRegistry;
use App\Support\Scripture\Admin\VerseRelationAdminData;
use App\Support\Scripture\Admin\VisibleContentBlockSequence;
use App\Support\Scripture\Admin\VerseAdminRouteContext;
use App\Support\Scripture\PublicScriptureData;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
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
        $primaryIntroBlock = PrimaryPublishedEditableContentBlock::resolve(
            $contentBlocks,
            fn (ContentBlock $block): bool => $adminRouteContext->isEditableIntroBlock($block),
        );
        $noteBlocks = $primaryIntroBlock instanceof ContentBlock
            ? $contentBlocks
                ->reject(
                    fn (ContentBlock $block): bool => (int) $block->getKey() === (int) $primaryIntroBlock->getKey(),
                )
                ->values()
            : $contentBlocks;

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
            'verse' => [
                ...$publicScriptureData->verse($verse),
                'intro_block' => $primaryIntroBlock
                    ? $publicScriptureData->contentBlock($primaryIntroBlock)
                    : null,
            ],
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
            'content_blocks' => $publicScriptureData->contentBlocks($noteBlocks),
            'isAdmin' => $isAdmin,
            'admin' => $isAdmin
                ? $this->verseAdminPayload(
                    $verse,
                    $adminRouteContext,
                    $noteBlocks,
                    $primaryIntroBlock,
                    $publicScriptureData,
                    $adminEntityDefinition,
                )
                : null,
        ]);
    }

    /**
     * @param  Collection<int, \App\Models\ContentBlock>  $contentBlocks
     * @return array<string, mixed>
     */
    private function verseAdminPayload(
        Verse $verse,
        VerseAdminRouteContext $adminRouteContext,
        Collection $contentBlocks,
        ?ContentBlock $primaryIntroBlock,
        PublicScriptureData $publicScriptureData,
        \App\Support\Scripture\Admin\Registry\AdminEntityDefinition $adminEntityDefinition,
    ): array {
        $visibleSequence = new VisibleContentBlockSequence($contentBlocks);
        $translationSources = TranslationSource::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
        $commentarySources = CommentarySource::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return [
            'identity_update_href' => $adminRouteContext->identityUpdateHref(),
            'meta_update_href' => $adminRouteContext->metaUpdateHref(),
            'full_edit_href' => $adminRouteContext->fullEditHref(),
            'translations' => [
                'store_href' => $adminRouteContext->translationStoreHref(),
                'next_sort_order' => VerseRelationAdminData::nextTranslationSortOrder(
                    $verse->translations,
                ),
                'rows' => collect($verse->translations)
                    ->map(
                        fn (\App\Models\VerseTranslation $translation) => VerseRelationAdminData::translation(
                            $translation,
                            $adminRouteContext->translationUpdateHref($translation),
                            $adminRouteContext->translationDestroyHref($translation),
                        ),
                    )
                    ->values()
                    ->all(),
                'sources' => VerseRelationAdminData::translationSources($translationSources),
                'fields' => VerseRelationAdminData::translationFields($adminEntityDefinition),
            ],
            'commentaries' => [
                'store_href' => $adminRouteContext->commentaryStoreHref(),
                'next_sort_order' => VerseRelationAdminData::nextCommentarySortOrder(
                    $verse->commentaries,
                ),
                'rows' => collect($verse->commentaries)
                    ->map(
                        fn (\App\Models\VerseCommentary $commentary) => VerseRelationAdminData::commentary(
                            $commentary,
                            $adminRouteContext->commentaryUpdateHref($commentary),
                            $adminRouteContext->commentaryDestroyHref($commentary),
                        ),
                    )
                    ->values()
                    ->all(),
                'sources' => VerseRelationAdminData::commentarySources($commentarySources),
                'fields' => VerseRelationAdminData::commentaryFields($adminEntityDefinition),
            ],
            'intro_store_href' => $adminRouteContext->contentBlockStoreHref(),
            'primary_intro_block' => $primaryIntroBlock
                ? $publicScriptureData->contentBlock($primaryIntroBlock)
                : null,
            'primary_intro_update_href' => $primaryIntroBlock
                ? $adminRouteContext->contentBlockUpdateHref($primaryIntroBlock)
                : null,
            'intro_block_types' => $adminRouteContext->contentBlockTypes(),
            'intro_default_region' => $adminRouteContext->defaultIntroBlockRegion(),
            'content_block_store_href' => $adminRouteContext->contentBlockStoreHref(),
            'content_block_types' => $adminRouteContext->contentBlockTypes(),
            'content_block_default_region' => $adminRouteContext->defaultContentBlockRegion(),
            ...ContentBlockCapabilityPayload::build(
                $contentBlocks,
                $visibleSequence,
                fn (ContentBlock $block): bool => $adminRouteContext->isEditableNoteBlock($block),
                fn (ContentBlock $block): bool => $adminRouteContext->isDuplicableNoteBlock($block),
                fn (ContentBlock $block): string => $adminRouteContext->contentBlockUpdateHref($block),
                fn (ContentBlock $block): string => $adminRouteContext->contentBlockMoveUpHref($block),
                fn (ContentBlock $block): string => $adminRouteContext->contentBlockMoveDownHref($block),
                fn (ContentBlock $block): string => $adminRouteContext->contentBlockReorderHref($block),
                fn (ContentBlock $block): string => $adminRouteContext->contentBlockDuplicateHref($block),
                fn (ContentBlock $block): string => $adminRouteContext->contentBlockDestroyHref($block),
            ),
        ];
    }
}
