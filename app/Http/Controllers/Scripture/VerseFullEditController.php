<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\CommentarySource;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\ContentBlock;
use App\Models\TranslationSource;
use App\Models\Verse;
use App\Support\Scripture\Admin\RegisteredContentBlockData;
use App\Support\Scripture\Admin\Registry\AdminEntityRegistry;
use App\Support\Scripture\Admin\VerseAdminRouteContext;
use App\Support\Scripture\Admin\VerseRelationAdminData;
use App\Support\Scripture\PublicScriptureData;
use Inertia\Inertia;
use Inertia\Response;

class VerseFullEditController extends Controller
{
    /**
     * Render the deeper protected verse editor surface.
     */
    public function show(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        Verse $verse,
        PublicScriptureData $publicScriptureData,
        AdminEntityRegistry $adminEntityRegistry,
    ): Response {
        $verse->load([
            'translations.translationSource',
            'commentaries.commentarySource',
            'verseMeta',
            'characterAssignments.character',
        ]);

        $adminEntityDefinition = $adminEntityRegistry->definition('verse');
        $contentBlocks = $verse->contentBlocks()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
        $translationSources = TranslationSource::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
        $commentarySources = CommentarySource::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
        $adminRouteContext = new VerseAdminRouteContext(
            $book,
            $bookSection,
            $chapter,
            $chapterSection,
            $verse,
        );
        $editableNoteBlocks = $contentBlocks
            ->filter(fn (ContentBlock $block) => $adminRouteContext->isEditableNoteBlock($block))
            ->values();
        $protectedContentBlocks = $contentBlocks
            ->reject(fn (ContentBlock $block) => $adminRouteContext->isEditableNoteBlock($block))
            ->values();

        return Inertia::render('scripture/chapters/verses/full-edit', [
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
                ...$publicScriptureData->verse(
                    $verse,
                    $adminRouteContext->verseHref(),
                ),
                'admin_full_edit_href' => $adminRouteContext->fullEditHref(),
            ],
            'admin_entity' => $adminEntityDefinition->toArray(),
            'characters' => $publicScriptureData->characters($verse->characterAssignments),
            'admin_identity_update_href' => $adminRouteContext->identityUpdateHref(),
            'verse_meta' => $publicScriptureData->verseMeta($verse->verseMeta),
            'admin_meta_update_href' => $adminRouteContext->metaUpdateHref(),
            'admin_translations' => [
                'store_href' => $adminRouteContext->translationStoreHref(),
                'next_sort_order' => VerseRelationAdminData::nextTranslationSortOrder(
                    $verse->translations,
                ),
                'rows' => $verse->translations
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
            'admin_commentaries' => [
                'store_href' => $adminRouteContext->commentaryStoreHref(),
                'next_sort_order' => VerseRelationAdminData::nextCommentarySortOrder(
                    $verse->commentaries,
                ),
                'rows' => $verse->commentaries
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
            'admin_content_block_store_href' => $adminRouteContext->contentBlockStoreHref(),
            'next_content_block_sort_order' => RegisteredContentBlockData::nextSortOrder(
                $contentBlocks,
            ),
            'admin_content_blocks' => $editableNoteBlocks
                ->map(fn (ContentBlock $block) => RegisteredContentBlockData::editor(
                    $block,
                    $adminRouteContext->contentBlockUpdateHref($block),
                ))
                ->values()
                ->all(),
            'protected_content_blocks' => $protectedContentBlocks
                ->map(fn (ContentBlock $block) => RegisteredContentBlockData::protected(
                    $block,
                    $adminRouteContext->contentBlockProtectionReason(),
                ))
                ->values()
                ->all(),
        ]);
    }
}
