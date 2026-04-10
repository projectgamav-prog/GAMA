<?php

namespace App\Http\Controllers\Scripture;

use App\Actions\Scripture\BuildChapterVerseReaderData;
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
use App\Support\Scripture\Admin\ChapterAdminRouteContext;
use App\Support\Scripture\Admin\ChapterSectionAdminRouteContext;
use App\Support\Scripture\Admin\PrimaryPublishedEditableContentBlock;
use App\Support\Scripture\Admin\Registry\AdminEntityRegistry;
use App\Support\Scripture\Admin\VerseAdminRouteContext;
use App\Support\Scripture\Admin\VerseRelationAdminData;
use App\Support\Scripture\PublicScriptureData;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class ChapterController extends Controller
{
    /**
     * Display a read-only chapter overview page.
     */
    public function show(
        Request $request,
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        BuildChapterVerseReaderData $buildChapterVerseReaderData,
        PublicScriptureData $publicScriptureData,
        AdminEntityRegistry $adminEntityRegistry,
    ): Response
    {
        $contentBlocks = $chapter->contentBlocks()
            ->published()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
        $isAdmin = AdminContext::canAccess($request->user());
        $adminRouteContext = new ChapterAdminRouteContext($book, $bookSection, $chapter);
        $primaryIntroBlock = $this->primaryPublishedIntroBlock(
            $contentBlocks,
            $adminRouteContext,
        );
        $readerData = $buildChapterVerseReaderData->handle(
            $book,
            $bookSection,
            $chapter,
        );
        $verseAdminDefinition = $adminEntityRegistry->definition('verse');

        if ($isAdmin) {
            $chapter->loadMissing([
                'chapterSections.verses.commentaries',
                'chapterSections.verses.verseMeta',
                'chapterSections.verses.characterAssignments.character',
                'chapterSections.verses.contentBlocks' => fn ($query) => $query
                    ->published()
                    ->orderBy('sort_order')
                    ->orderBy('id'),
            ]);
        }

        $readerSectionsBySlug = collect($readerData['chapter_sections'])
            ->keyBy('slug');

        return Inertia::render('scripture/chapters/show', [
            'book' => $publicScriptureData->book($book),
            'book_section' => $publicScriptureData->bookSection($book, $bookSection),
            'chapter' => [
                ...$publicScriptureData->chapter($book, $bookSection, $chapter),
                'intro_block' => $primaryIntroBlock
                    ? $publicScriptureData->contentBlock($primaryIntroBlock)
                    : null,
            ],
            'reader_languages' => $readerData['reader_languages'],
            'default_language' => $readerData['default_language'],
            'isAdmin' => $isAdmin,
            'admin' => $isAdmin
                ? $this->chapterAdminPayload(
                    $adminRouteContext,
                    $primaryIntroBlock,
                    $publicScriptureData,
                )
                : null,
            'verse_admin_shared' => $isAdmin
                ? $this->verseAdminSharedPayload($verseAdminDefinition)
                : null,
            'chapter_sections' => $this->chapterSectionsPayload(
                $book,
                $bookSection,
                $chapter,
                $chapter->chapterSections,
                $readerSectionsBySlug,
                $publicScriptureData,
                $isAdmin,
            ),
        ]);
    }

    /**
     * Resolve the primary published overview intro block for page-intro editing.
     *
     * @param  Collection<int, ContentBlock>  $contentBlocks
     */
    private function primaryPublishedIntroBlock(
        Collection $contentBlocks,
        ChapterAdminRouteContext $adminRouteContext,
    ): ?ContentBlock {
        return PrimaryPublishedEditableContentBlock::resolve(
            $contentBlocks,
            fn (ContentBlock $block): bool => $adminRouteContext->isEditableIntroBlock($block),
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function chapterAdminPayload(
        ChapterAdminRouteContext $adminRouteContext,
        ?ContentBlock $primaryIntroBlock,
        PublicScriptureData $publicScriptureData,
    ): array {
        return [
            'full_edit_href' => $adminRouteContext->fullEditHref(),
            'identity_update_href' => $adminRouteContext->identityUpdateHref(),
            'destroy_href' => $adminRouteContext->destroyHref(),
            'chapter_section_store_href' => route(
                'scripture.chapter-sections.admin.store',
                $adminRouteContext->routeParameters(),
            ),
            'intro_store_href' => $adminRouteContext->contentBlockStoreHref(),
            'primary_intro_block' => $primaryIntroBlock
                ? $publicScriptureData->contentBlock($primaryIntroBlock)
                : null,
            'primary_intro_update_href' => $primaryIntroBlock
                ? $adminRouteContext->contentBlockUpdateHref($primaryIntroBlock)
                : null,
            'primary_intro_destroy_href' => $primaryIntroBlock
                ? $adminRouteContext->contentBlockDestroyHref($primaryIntroBlock)
                : null,
            'intro_block_types' => $adminRouteContext->contentBlockTypes(),
            'intro_default_region' => $adminRouteContext->defaultIntroBlockRegion(),
        ];
    }

    /**
     * @param  Collection<int, ChapterSection>  $chapterSections
     * @param  Collection<string, array<string, mixed>>  $readerSectionsBySlug
     * @return list<array<string, mixed>>
     */
    private function chapterSectionsPayload(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        Collection $chapterSections,
        Collection $readerSectionsBySlug,
        PublicScriptureData $publicScriptureData,
        bool $isAdmin,
    ): array {
        return $chapterSections
            ->map(function (ChapterSection $chapterSection) use (
                $book,
                $bookSection,
                $chapter,
                $readerSectionsBySlug,
                $publicScriptureData,
                $isAdmin,
            ): array {
                $readerSection = $readerSectionsBySlug->get($chapterSection->slug);
                $cards = is_array($readerSection['cards'] ?? null)
                    ? $readerSection['cards']
                    : [];
                $versesCount = collect($cards)
                    ->sum(
                        fn (array $card): int => is_array($card['verses'] ?? null)
                            ? count($card['verses'])
                            : 0,
                    );
                $adminRouteContext = new ChapterSectionAdminRouteContext(
                    $book,
                    $bookSection,
                    $chapter,
                    $chapterSection,
                );
                $contentBlocks = $chapterSection->relationLoaded('contentBlocks')
                    ? collect($chapterSection->contentBlocks)
                    : $chapterSection->contentBlocks()
                        ->published()
                        ->orderBy('sort_order')
                        ->orderBy('id')
                        ->get();
                $primaryIntroBlock = PrimaryPublishedEditableContentBlock::resolve(
                    $contentBlocks,
                    fn (ContentBlock $block): bool => $adminRouteContext->isEditableIntroBlock($block),
                );

                return [
                    ...$publicScriptureData->chapterSection(
                        $book,
                        $bookSection,
                        $chapter,
                        $chapterSection,
                        $versesCount,
                    ),
                    'intro_block' => $primaryIntroBlock
                        ? $publicScriptureData->contentBlock($primaryIntroBlock)
                        : null,
                    'admin' => $isAdmin
                        ? $this->chapterSectionAdminPayload(
                            $book,
                            $bookSection,
                            $chapter,
                            $chapterSection,
                            $publicScriptureData,
                            $contentBlocks,
                            $primaryIntroBlock,
                        )
                        : null,
                    'cards' => $this->chapterSectionCardsPayload(
                        $book,
                        $bookSection,
                        $chapter,
                        $chapterSection,
                        $cards,
                        $publicScriptureData,
                        $isAdmin,
                    ),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function verseAdminSharedPayload(
        \App\Support\Scripture\Admin\Registry\AdminEntityDefinition $verseAdminDefinition,
    ): array {
        $translationSources = TranslationSource::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
        $commentarySources = CommentarySource::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return [
            'translations' => [
                'sources' => VerseRelationAdminData::translationSources($translationSources),
                'fields' => VerseRelationAdminData::translationFields($verseAdminDefinition),
            ],
            'commentaries' => [
                'sources' => VerseRelationAdminData::commentarySources($commentarySources),
                'fields' => VerseRelationAdminData::commentaryFields($verseAdminDefinition),
            ],
        ];
    }

    /**
     * @param  list<array<string, mixed>>  $cards
     * @return list<array<string, mixed>>
     */
    private function chapterSectionCardsPayload(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        array $cards,
        PublicScriptureData $publicScriptureData,
        bool $isAdmin,
    ): array {
        if (! $isAdmin) {
            return $cards;
        }

        $sectionVerses = $chapterSection->relationLoaded('verses')
            ? collect($chapterSection->verses)
            : $chapterSection->verses()
                ->inCanonicalOrder()
                ->with([
                    'translations',
                    'commentaries',
                    'verseMeta',
                    'characterAssignments.character',
                    'contentBlocks' => fn ($query) => $query
                        ->published()
                        ->orderBy('sort_order')
                        ->orderBy('id'),
                ])
                ->get();
        $versesById = $sectionVerses->keyBy('id');

        return collect($cards)
            ->map(function (array $card) use (
                $book,
                $bookSection,
                $chapter,
                $chapterSection,
                $publicScriptureData,
                $versesById,
            ): array {
                $readerVerses = is_array($card['verses'] ?? null)
                    ? $card['verses']
                    : [];

                return [
                    ...$card,
                    'verses' => collect($readerVerses)
                        ->map(function (array $readerVerse) use (
                            $book,
                            $bookSection,
                            $chapter,
                            $chapterSection,
                            $publicScriptureData,
                            $versesById,
                        ): array {
                            $verse = $versesById->get($readerVerse['id'] ?? null);

                            if (! $verse instanceof Verse) {
                                return $readerVerse;
                            }

                            return [
                                ...$readerVerse,
                                'verse_meta' => $publicScriptureData->verseMeta($verse->verseMeta),
                                'characters' => $publicScriptureData->characters(
                                    $verse->characterAssignments,
                                ),
                                'admin' => $this->chapterReaderVerseAdminPayload(
                                    $book,
                                    $bookSection,
                                    $chapter,
                                    $chapterSection,
                                    $verse,
                                    $publicScriptureData,
                                ),
                            ];
                        })
                        ->values()
                        ->all(),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function chapterReaderVerseAdminPayload(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        Verse $verse,
        PublicScriptureData $publicScriptureData,
    ): array {
        $adminRouteContext = new VerseAdminRouteContext(
            $book,
            $bookSection,
            $chapter,
            $chapterSection,
            $verse,
        );
        $contentBlocks = $verse->relationLoaded('contentBlocks')
            ? collect($verse->contentBlocks)
            : $verse->contentBlocks()
                ->published()
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get();
        $primaryIntroBlock = PrimaryPublishedEditableContentBlock::resolve(
            $contentBlocks,
            fn (ContentBlock $block): bool => $adminRouteContext->isEditableIntroBlock($block),
        );

        return [
            'identity_update_href' => $adminRouteContext->identityUpdateHref(),
            'meta_update_href' => $adminRouteContext->metaUpdateHref(),
            'full_edit_href' => $adminRouteContext->fullEditHref(),
            'destroy_href' => $adminRouteContext->destroyHref(),
            'nearby_create_href' => route(
                'scripture.chapters.verses.admin.store',
                [
                    'book' => $book,
                    'bookSection' => $bookSection,
                    'chapter' => $chapter,
                    'chapterSection' => $chapterSection,
                ],
            ),
            'intro_store_href' => $adminRouteContext->contentBlockStoreHref(),
            'primary_intro_block' => $primaryIntroBlock
                ? $publicScriptureData->contentBlock($primaryIntroBlock)
                : null,
            'primary_intro_update_href' => $primaryIntroBlock
                ? $adminRouteContext->contentBlockUpdateHref($primaryIntroBlock)
                : null,
            'primary_intro_destroy_href' => $primaryIntroBlock
                ? $adminRouteContext->contentBlockDestroyHref($primaryIntroBlock)
                : null,
            'intro_block_types' => $adminRouteContext->contentBlockTypes(),
            'intro_default_region' => $adminRouteContext->defaultIntroBlockRegion(),
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
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function chapterSectionAdminPayload(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        PublicScriptureData $publicScriptureData,
        Collection $contentBlocks,
        ?ContentBlock $primaryIntroBlock,
    ): array {
        $adminRouteContext = new ChapterSectionAdminRouteContext(
            $book,
            $bookSection,
            $chapter,
            $chapterSection,
        );

        return [
            'details_update_href' => route(
                'scripture.chapter-sections.admin.details.update',
                [
                    'book' => $book,
                    'bookSection' => $bookSection,
                    'chapter' => $chapter,
                    'chapterSection' => $chapterSection,
                ],
            ),
            'destroy_href' => $adminRouteContext->destroyHref(),
            'intro_store_href' => $adminRouteContext->contentBlockStoreHref(),
            'primary_intro_block' => $primaryIntroBlock
                ? ($publicScriptureData->contentBlocks([$primaryIntroBlock])[0] ?? null)
                : null,
            'primary_intro_update_href' => $primaryIntroBlock
                ? $adminRouteContext->contentBlockUpdateHref($primaryIntroBlock)
                : null,
            'primary_intro_destroy_href' => $primaryIntroBlock
                ? $adminRouteContext->contentBlockDestroyHref($primaryIntroBlock)
                : null,
            'intro_block_types' => $adminRouteContext->contentBlockTypes(),
            'intro_default_region' => $adminRouteContext->defaultContentBlockRegion(),
            'child_store_href' => route(
                'scripture.chapters.verses.admin.store',
                [
                    'book' => $book,
                    'bookSection' => $bookSection,
                    'chapter' => $chapter,
                    'chapterSection' => $chapterSection,
                ],
            ),
        ];
    }
}
